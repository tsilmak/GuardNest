// ============================================================================
//  PROXY SERVER - HTTP/HTTPS PROXY WITH BLOCKLIST FUNCTIONALITY
// ============================================================================
// This file implements a local proxy server that:
// 1. Intercepts HTTP/HTTPS requests from the browser
// 2. Checks domains against a blocklist (malicious sites)
// 3. Forwards allowed requests to their destinations
// 4. Blocks requests to malicious domains
// 5. Manages Windows system proxy settings automatically

use crate::logger::ProxyLogger;
use crate::windows::http_service;
use crate::windows::system::WindowsSystemProxy;
use once_cell::sync::Lazy;
use std::collections::HashSet;
use std::sync::{Arc, Mutex, RwLock};
use std::{io, net::SocketAddr, time::Duration};
use tokio::{
    io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt},
    net::{TcpListener, TcpStream as TokioTcpStream},
    sync::broadcast,
    task::JoinHandle,
    time::{sleep, timeout},
};

static PROXY_PORT: u16 = 3000;

// Broadcasts a shutdown signal to all listeners, enabling a graceful exitfrom multiple tasks.
// The channel is lazily initialized and thread-safe.
static SHUTDOWN_TX: Lazy<broadcast::Sender<()>> = Lazy::new(|| {
    let (tx, _) = broadcast::channel(1); // Buffer size of 1 is enough for shutdown signals
    tx
});

// Mutex to safely share the proxy task handle between threads.
// It prevents multiple threads from trying to modify the handle at the same time.
static PROXY_TASK_HANDLE: Lazy<Mutex<Option<JoinHandle<()>>>> = Lazy::new(|| Mutex::new(None));

// The main server function. It creates a TCP listener, starts background tasks,
// and handles all incoming connections and graceful shutdown.
pub async fn run_proxy(mut shutdown_rx: broadcast::Receiver<()>) -> io::Result<()> {


    // bloclist as a hashset that stores unique values 
    let blocklist = Arc::new(RwLock::new(HashSet::<String>::new()));

    // Create the address our proxy will listen on (localhost port 3000)
    let proxy_address = SocketAddr::from(([127, 0, 0, 1], PROXY_PORT));

    // Bind to the address - this makes our server start listening for connections
    let listener = TcpListener::bind(proxy_address).await?;
    ProxyLogger::log_proxy_start(proxy_address);

 
    // This background task periodically checks if our proxy is still working by trying to connect to it
    let mut health_shutdown_rx = SHUTDOWN_TX.subscribe(); // Subscribe to shutdown signals
    tokio::spawn(async move {
        const HEALTH_CHECK_INTERVAL: Duration = Duration::from_secs(30);

    // Loop until either a shutdown signal is received or 30 seconds pass
        loop {     
            tokio::select! {
                _ = health_shutdown_rx.recv() => break,  // Shutdown signal received - exit loop
                _ = sleep(HEALTH_CHECK_INTERVAL) => {    // 30 seconds passed - do health check
                    // Try to connect to our own proxy to see if it's still working
                    if let Err(e) = TokioTcpStream::connect(proxy_address).await {
                        println!("⚠️ Proxy health check failed: {}", e);
                    }
                }
            }
        }
    });

    // This background task periodically fetches the latest list of domains from our server

    let blocklist_clone = blocklist.clone(); // Create another reference to the same blocklist
    let mut updater_shutdown_rx = SHUTDOWN_TX.subscribe(); // Subscribe to shutdown signals
    tokio::spawn(async move {
        loop {
            
            // `spawn_blocking` runs blocking code (like network I/O) on a dedicated thread pool.
            // This prevents the main async runtime from being blocked, ensuring the proxy remains responsive.
            let fetch_result =
                tokio::task::spawn_blocking(http_service::fetch::proxy_fetch_blocklist).await;

            match fetch_result {
                Ok(new_blocked_addresses) => {
                    // Obtain a write lock on the blocklist. `unwrap()` is used because a poisoned lock
                    // indicates a fatal, unrecoverable error.
                    let mut current = blocklist_clone.write().unwrap();

                    // Only update if the blocklist actually changed (avoid unnecessary work)
                    if *current != new_blocked_addresses {
                        *current = new_blocked_addresses; // Replace the old blocklist with the new one
                        println!("Blocklist updated");
                    }
                }
                Err(e) => ProxyLogger::log_error("fetching blocklist", &e.to_string()),
            }

            // Wait for either shutdown signal or 30 seconds to pass
            tokio::select! {
                _ = updater_shutdown_rx.recv() => break,  // Shutdown signal - exit loop
                _ = tokio::time::sleep(Duration::from_secs(30)) => {}  // 30 seconds passed - continue loop
            }
        }
    });


    // This is the core of our proxy server - it continuously accepts new connections
    // and handles them concurrently (multiple connections at the same time)
    loop {
        // `tokio::select!` with `biased` to prioritize the shutdown signal.
        tokio::select! {
            biased;  

            // OPTION 1: Shutdown signal received
            _ = shutdown_rx.recv() => {
                println!("Proxy server shutting down.");
                break;  // Exit the loop and shut down gracefully
            }

            // OPTION 2: New connection attempt
            result = listener.accept() => {
                match result {
                    Ok((client_stream, _)) => {
                        // Successfully accepted a new connection
                        let peer_addr = client_stream.peer_addr().unwrap_or(proxy_address);
                        println!("Connection accepted from {}", peer_addr);

                        // Create a new reference to the blocklist for this connection
                        let blocklist_clone = blocklist.clone();

                        // Spawn a new asynchronous task for each client connection.
                        //  This allows to handle multiple connections concurrently without blocking
                        tokio::spawn(async move {
                            if let Err(e) = handle_client(client_stream, peer_addr, blocklist_clone).await {
                                ProxyLogger::log_error("client handling", &e);
                            }
                        });
                    }
                    Err(e) => {
                        // Failed to accept connection - log error and wait a bit before trying again
                        ProxyLogger::log_error("accepting connection", &e);
                        sleep(Duration::from_millis(100)).await;  // Brief pause to avoid busy-waiting
                    }
                }
            }
        }
    }
    Ok(()) // Return success when the loop exits (shutdown complete)
}

// The core function for HTTPS tunneling. It creates a bidirectional
// data pipe, copying data between two streams (e.g., client and server)
// until the connection closes or a timeout occurs.
// This is achieved by creating a separate task for each direction of data flow.

/// Browser ←───HTTPS────→ Proxy ←───HTTPS────→ Target Server
///    │                       │                       │
///    └─CONNECT request───────┼─Tunnel Setup─────────┘
///                            │
///                    ┌───────┴───────┐
///                    │ Bidirectional │
///                    │ Data Copying  │
///                    └───────────────┘

async fn tunnel_stream(
    mut read_half: impl AsyncRead + Unpin, // Where we read data from
    mut write_half: impl AsyncWrite + Unpin, // Where we write data to
    description: &'static str,             // Description for logging (e.g., "client_to_server")
) -> io::Result<()> {
    // Buffer to hold data as we copy it from one stream to another
    // 8192 bytes is a good balance between memory usage and efficiency
    let mut buffer = [0u8; 8192];

    loop {
        // Use a 30-second timeout to prevent the connection from hanging indefinitely.
        // If the operation doesn't complete within the time limit, it returns an error.
        let n = match timeout(Duration::from_secs(30), read_half.read(&mut buffer)).await {
            Ok(Ok(n)) => n, // Successfully read n bytes
            Ok(Err(e)) => {
                // Read operation failed
                ProxyLogger::log_error(&format!("{} read", description), &e);
                return Err(e);
            }
            Err(_) => {
                // Timeout occurred (30 seconds passed with no data)
                let err = io::Error::new(io::ErrorKind::TimedOut, "Tunnel idle timeout");
                ProxyLogger::log_error(description, &err);
                return Err(err);
            }
        };

        // If we read 0 bytes, the connection was closed by the other side
        if n == 0 {
            break; // Exit the loop - connection is closed
        }

        // Write the data we just read to the other stream
        if let Err(e) = write_half.write_all(&buffer[..n]).await {
            ProxyLogger::log_error(&format!("{} write", description), &e);
            return Err(e);
        }
    }
    Ok(()) // Successfully completed the tunnel
}
// The core logic for each client connection. It reads the request, checks
// the blocklist, and either establishes an HTTPS tunnel or returns an error.

/// ## TODO Features:
/// - Full HTTP proxy support (currently only HTTPS CONNECT is implemented)
/// - HTTP header parsing and modification
/// - Connection keep-alive handling
/// - HTTP method filtering and validation
pub async fn handle_client(
    mut client_stream: TokioTcpStream, // The connection from the browser
    _conn_info: SocketAddr,            // Information about who connected (IP address, etc.)
    blocklist: Arc<RwLock<HashSet<String>>>, // Our list of blocked domains
) -> io::Result<()> {

    // Step 1: Read the full HTTP request from the client into a buffer.
    // This is done to parse the request and determine the action (e.g., connect, get).
    // A timeout is applied to prevent the connection from hanging indefinitely.
    let mut buf = [0u8; 4096]; // Buffer to hold the request data (4KB should be enough for most requests)

    // TIMEOUT on reading - don't wait forever for the browser to send data
    let n = match timeout(Duration::from_secs(10), client_stream.read(&mut buf)).await {
        Ok(Ok(n)) => n,              // Successfully read n bytes
        Ok(Err(e)) => return Err(e), // Read failed
        Err(_) => {
            // Timeout - browser didn't send data within 10 seconds
            ProxyLogger::log_error(
                "client read timeout",
                &io::Error::new(io::ErrorKind::TimedOut, "Read timeout"),
            );
            return Ok(()); // Close connection gracefully
        }
    };

    // If we read 0 bytes, the browser closed the connection
    if n == 0 {
        return Ok(());
    }

    // Convert the raw bytes to a string so we can parse the HTTP request
    let request = String::from_utf8_lossy(&buf[..n]);

    // Step 2: Parse the HTTP request line to determine the method (e.g., `CONNECT` or `GET`)
    // and the target host.
    if let Some(first_line) = request.lines().next() {
        // Split the first line into parts: METHOD TARGET VERSION
        // Example: "CONNECT google.com:443 HTTP/1.1"
        let parts: Vec<&str> = first_line.split_whitespace().collect();

        // Step 3: Handle `CONNECT` requests from the client.
        // This is done to establish a secure HTTPS tunnel to the target server.
        if parts.len() >= 3 && parts[0] == "CONNECT" {
            let target = parts[1]; // The target server (e.g., "google.com:443")
            let host_only = target.split(':').next().unwrap_or(target); // Extract just the domain name
            println!("CONNECT request to domain: {}", host_only);

            // Step 4: Check if the extracted domain is present in the blocklist.
            // This is the security core of the proxy, preventing access to malicious sites.

            // Get a READ lock on the blocklist (multiple threads can read simultaneously)
            let is_blocked = match blocklist.read() {
                Ok(guard) => guard.contains(host_only), // Check if domain is in our blocklist
                Err(poisoned) => {
                    // Handle "poisoned" lock (rare error condition)
                    ProxyLogger::log_error("RwLock read error (poisoned)", &poisoned.to_string());
                    true // If we can't read the blocklist, block the request for safety
                }
            };

            if is_blocked {
                // Domain is blocked - send 403 Forbidden response and close connection
                let _ = client_stream
                    .write_all(b"HTTP/1.1 403 Forbidden\r\n\r\n")
                    .await;
                return Ok(());
            }

            // Step 5: Connect to the target server after a successful blocklist check.
            // This connection is then used to create the secure tunnel.
            match timeout(Duration::from_secs(10), TokioTcpStream::connect(target)).await {
                Ok(Ok(mut server_stream)) => {
                    // SUCCESS! We connected to the target server

                    // Tell the browser "Connection established" - this is the standard HTTP response
                    let _ = client_stream
                        .write_all(b"HTTP/1.1 200 Connection Established\r\n\r\n")
                        .await;

                    // Step 6: Create the bidirectional tunnel. This copies data
                    // between the client and the target server, acting as a transparent pipe.

                    // Split both streams into read and write halves so we can handle them separately
                    let (mut client_read, mut client_write) = client_stream.split();
                    let (mut server_read, mut server_write) = server_stream.split();

                    // TOKIO::SELECT! for bidirectional tunneling
                    // We run two tunnel operations simultaneously:
                    // 1. Copy data from browser to server
                    // 2. Copy data from server to browser
                    // Whichever one finishes first (usually when connection closes), we're done
                    tokio::select! {
                        _ = tunnel_stream(&mut client_read, &mut server_write, "client_to_server") => {},
                        _ = tunnel_stream(&mut server_read, &mut client_write, "server_to_client") => {},
                    }
                }

                // Error handling: Failed to connect to target server
                Ok(Err(e)) => {
                    // Connection to target server failed (server is down, network issue, etc.)
                    ProxyLogger::log_connection_failed(target, &e.to_string());
                    let _ = client_stream
                        .write_all(b"HTTP/1.1 502 Bad Gateway\r\n\r\n") // Standard HTTP error code
                        .await;
                }
                Err(_) => {
                    // Connection attempt timed out (server didn't respond within 10 seconds)
                    ProxyLogger::log_connection_failed(target, "Connection timeout");
                    let _ = client_stream
                        .write_all(b"HTTP/1.1 504 Gateway Timeout\r\n\r\n") // Standard HTTP timeout code
                        .await;
                }
            }
        } else if parts.len() >= 3 {
            // Handle regular HTTP requests (GET, POST, etc.)
            // For regular HTTP websites (not HTTPS), browsers send GET/POST requests directly

            let mut _host = None;

            // Parse HTTP headers to find the "Host" header
            // HTTP headers are in the format "Header-Name: Header-Value"
            for line in request.lines().skip(1) {
                // Skip the first line (request line)
                if let Some((key, value)) = line.split_once(':') {
                    // PERFORMANCE OPTIMIZATION: Case-insensitive comparison without allocation
                    // eq_ignore_ascii_case is faster than to_lowercase() because it doesn't create a new string
                    if key.trim().eq_ignore_ascii_case("host") {
                        _host = Some(value.trim().to_string());
                        println!("HTTP request to domain: {}", value.trim());
                        break; // Found the host header, no need to continue
                    }
                }
            }

            // ============================================================================
            // TODO: IMPLEMENT FULL HTTP PROXY FUNCTIONALITY
            // ============================================================================
            // Currently, we only handle HTTPS CONNECT requests properly
            // For regular HTTP requests, we would need to:
            // 1. Check if the host is in our blocklist
            // 2. If allowed, connect to the target server
            // 3. Forward the original request to the server
            // 4. Stream the server's response back to the browser
            //
            // This is more complex than HTTPS tunneling because we need to:
            // - Parse and potentially modify HTTP headers
            // - Handle different HTTP methods (GET, POST, PUT, DELETE, etc.)
            // - Manage connection keep-alive
            // - Handle redirects and other HTTP features
        }
    }

    // Connection handling complete
    Ok(())
}
// A Tauri command that starts the proxy server and configures the system.
// It checks if the proxy is already running, spawns a new task, and
// then modifies Windows settings to route traffic through the proxy.
#[tauri::command]
pub async fn enable_system_proxy() -> Result<String, String> {
    // Step 1: Check if the proxy is already running
    // We don't want to start multiple proxy instances - that would cause conflicts

    if let Some(handle) = PROXY_TASK_HANDLE.lock().unwrap().as_ref() {
        if !handle.is_finished() {
            return Ok("Proxy is already running.".to_string());
        }
    }

    // Step 2: Start the proxy server

    // Subscribe to shutdown signals before starting the proxy
    let shutdown_rx = SHUTDOWN_TX.subscribe();

    // Spawn the proxy server as a background task
    let proxy_task = tokio::spawn(async move {
        if let Err(e) = run_proxy(shutdown_rx).await {
            ProxyLogger::log_error("proxy run error", &e);
        }
    });

    // Store the task handle so we can manage it later
    *PROXY_TASK_HANDLE.lock().unwrap() = Some(proxy_task);

    // Give the proxy server a moment to start listening on the port
    // This prevents race conditions where we try to configure Windows before the proxy is ready
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    // Step 3: Configure Windows system proxy settings
    // Now we need to tell Windows to route all internet traffic through our proxy

    let proxy_address = SocketAddr::from(([127, 0, 0, 1], PROXY_PORT));
    let proxy_url = format!("127.0.0.1:{}", PROXY_PORT);

    // Enable Windows system proxy settings
    match WindowsSystemProxy::enable_system_proxy(&proxy_url) {
        Ok(_) => {
            println!("✅ Windows system proxy enabled successfully");

            // Step 4: Configure Windows firewall
            // We need to allow our proxy port through the Windows firewall
            // Otherwise, connections to our proxy won't go through

            match WindowsSystemProxy::add_firewall_rules(PROXY_PORT) {
                Ok(_) => println!("✅ Firewall rules added successfully"),
                Err(e) => println!("⚠️ Warning: Failed to add firewall rules: {}", e),
            }
        }
        Err(e) => {
            println!("⚠️ Warning: Failed to enable Windows system proxy: {}", e);
            return Err(format!("Failed to enable system proxy: {}", e));
        }
    }

    Ok(format!(
        "Proxy enabled on {} with system proxy configured",
        proxy_address
    ))
}

// A Tauri command that gracefully shuts down the proxy server and restores system settings.
// It broadcasts a shutdown signal, waits for all tasks to complete, and
// then disables the system proxy settings and removes the firewall rules.
#[tauri::command]
pub async fn disable_system_proxy() -> Result<String, String> {
    // Step 1: Gracefully shut down the proxy server
    // We need to stop the proxy server before disabling system settings

    // Send shutdown signal to all subscribed tasks
    if SHUTDOWN_TX.send(()).is_ok() {
        // Wait for the proxy task to finish gracefully
        let handle = PROXY_TASK_HANDLE.lock().unwrap().take();
        if let Some(handle) = handle {
            println!("Waiting for proxy to shut down...");
            // Use timeout to prevent waiting forever if something goes wrong
            let _ = timeout(Duration::from_secs(5), handle).await;
        }
    }

    // Step 2: Disable Windows system proxy settings
    // Now we need to tell Windows to stop using our proxy

    match WindowsSystemProxy::disable_system_proxy() {
        Ok(_) => {
            println!("✅ Windows system proxy disabled successfully");

            // Step 3: Clean up Windows firewall rules
            // Remove the firewall rules we added for our proxy port
            // This is good practice - clean up after ourselves

            match WindowsSystemProxy::remove_firewall_rules() {
                Ok(_) => println!("✅ Firewall rules removed successfully"),
                Err(e) => println!("⚠️ Warning: Failed to remove firewall rules: {}", e),
            }
        }
        Err(e) => {
            println!("⚠️ Warning: Failed to disable Windows system proxy: {}", e);
            return Err(format!("Failed to disable system proxy: {}", e));
        }
    }

    Ok("System proxy disabled successfully".to_string())
}

// A synchronous Tauri command that checks if the proxy is running.
// It acquires a lock on the global task handle and returns its status.
#[tauri::command]
pub fn get_proxy_status() -> Result<bool, String> {
    // Check proxy status
    // This function tells the frontend whether the proxy is currently running
    // We check the task handle to see if the proxy task is still active

    let is_running = PROXY_TASK_HANDLE
        .lock()
        .unwrap()
        .as_ref()
        .map_or(false, |h| !h.is_finished());
    Ok(is_running)
}
// A Tauri command that safely restarts the proxy server. It first
// gracefully shuts down the old instance, waits for cleanup, and then
// starts a new instance while re-applying system-level configurations.
#[tauri::command]
pub async fn restart_proxy() -> Result<String, String> {
    // Proxy restart function - Race-Free Restart Sequence
    // This function safely restarts the proxy server without conflicts
    // It ensures the old proxy is completely shut down before starting a new one

    // Step 1: Gracefully shut down existing proxy

    // Send shutdown signal to all proxy-related tasks
    if SHUTDOWN_TX.send(()).is_ok() {
        // Take ownership of the old task handle and wait for it to finish
        let handle = PROXY_TASK_HANDLE.lock().unwrap().take();
        if let Some(handle) = handle {
            println!("Waiting for existing proxy to shut down...");
            // Use timeout to prevent waiting indefinitely if something goes wrong
            let _ = timeout(Duration::from_secs(5), handle).await;
        }
    }

    // Step 2: Start new proxy instance

    println!("Starting new proxy instance...");

    // Subscribe to shutdown signals for the new proxy
    let shutdown_rx = SHUTDOWN_TX.subscribe();

    // Spawn the new proxy server
    let proxy_task = tokio::spawn(async move {
        if let Err(e) = run_proxy(shutdown_rx).await {
            ProxyLogger::log_error("proxy run error", &e);
        }
    });

    // Store the new task handle
    *PROXY_TASK_HANDLE.lock().unwrap() = Some(proxy_task);

    // Give the new proxy instance time to bind to the port
    // This prevents race conditions with Windows system configuration
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    // Step 3: Re-configure Windows system settings
    // Ensure Windows is still configured to use our proxy after restart

    let proxy_url = format!("127.0.0.1:{}", PROXY_PORT);
    match WindowsSystemProxy::enable_system_proxy(&proxy_url) {
        Ok(_) => {
            println!("✅ Windows system proxy re-enabled after restart");

            // Step 4: Verify firewall rules
            // Make sure our firewall rules are still in place

            match WindowsSystemProxy::add_firewall_rules(PROXY_PORT) {
                Ok(_) => println!("✅ Firewall rules verified after restart"),
                Err(e) => println!("⚠️ Warning: Failed to verify firewall rules: {}", e),
            }
        }
        Err(e) => {
            println!(
                "⚠️ Warning: Failed to re-enable Windows system proxy after restart: {}",
                e
            );
            return Err(format!(
                "Failed to re-enable system proxy after restart: {}",
                e
            ));
        }
    }

    Ok("Proxy restart completed with system proxy configured".to_string())
}
