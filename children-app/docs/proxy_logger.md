# ProxyLogger - Centralized Logging and Monitoring

## Overview

The `ProxyLogger` module provides centralized logging functionality for the GuardNest proxy server. It handles various types of log messages including startup events, connection status, errors, and security-related events. The logger uses structured output with consistent formatting and appropriate log levels.

## Module Structure

### Core Components

- **`ProxyLogger`** - Main logging struct with static methods
- **`ConnectRequestLog`** - Structured log for HTTPS CONNECT requests
- **`HttpRequestLog`** - Structured log for regular HTTP requests

### Dependencies

```rust
use chrono::Utc;                    // Timestamp generation
use std::collections::HashMap;     // Header storage
use std::net::SocketAddr;          // Network address types
```

## Function Documentation

### log_proxy_start - Proxy Server Startup Logging

#### Function Signature

```rust
pub fn log_proxy_start(addr: SocketAddr)
```

#### Purpose

Logs the successful startup of the proxy server, providing the listening address for user confirmation and debugging purposes.

#### What It Does

1. **Address Display**: Shows the exact address and port the proxy is listening on
2. **User Confirmation**: Provides visual feedback that the proxy started successfully
3. **Debug Information**: Helps with troubleshooting connectivity issues

#### Implementation Details

```rust
pub fn log_proxy_start(addr: SocketAddr) {
    println!("Proxy running at http://{}", addr);
}
```

#### Parameters

- **`addr`**: SocketAddr containing the IP address and port the proxy is bound to

#### Returns

- **None**: This function performs logging only

#### Output Format

```
Proxy running at http://127.0.0.1:3000
```

#### Usage Example

```rust
// Called after successful TCP listener binding
let listener = TcpListener::bind(proxy_address).await?;
ProxyLogger::log_proxy_start(proxy_address);
```

---

### log_connection_established - Successful Connection Logging

#### Function Signature

```rust
pub fn log_connection_established(target: &str)
```

#### Purpose

Logs successful connections to target servers, providing visibility into proxy activity and helping with debugging connection issues.

#### What It Does

1. **Connection Confirmation**: Confirms successful connection to target server
2. **Activity Monitoring**: Shows proxy is actively handling requests
3. **Debug Support**: Helps identify which connections succeed

#### Implementation Details

```rust
pub fn log_connection_established(target: &str) {
    println!("Connection established to {}", target);
}
```

#### Parameters

- **`target`**: String containing target server address (e.g., "google.com:443")

#### Returns

- **None**: This function performs logging only

#### Output Format

```
Connection established to google.com:443
```

#### Usage Example

```rust
match TcpStream::connect(target).await {
    Ok(_) => {
        ProxyLogger::log_connection_established(target);
        // Proceed with tunneling
    }
    Err(e) => {
        ProxyLogger::log_connection_failed(target, &e.to_string());
        // Handle connection failure
    }
}
```

---

### log_connection_failed - Connection Failure Logging

#### Function Signature

```rust
pub fn log_connection_failed(target: &str, error: &str)
```

#### Purpose

Logs failed connection attempts to target servers, providing diagnostic information for troubleshooting connectivity and network issues.

#### What It Does

1. **Failure Recording**: Documents connection failures with specific error details
2. **Diagnostic Support**: Helps identify network issues, server problems, or configuration errors
3. **Security Monitoring**: Can help detect patterns in connection failures

#### Implementation Details

```rust
pub fn log_connection_failed(target: &str, error: &str) {
    println!("Failed to connect to {}: {}", target, error);
}
```

#### Parameters

- **`target`**: String containing target server address that failed
- **`error`**: String containing error description or message

#### Returns

- **None**: This function performs logging only

#### Output Format

```
Failed to connect to google.com:443: Connection refused (os error 111)
```

#### Error Categories

- **Network Errors**: DNS resolution, routing, firewall issues
- **Server Errors**: Server down, port closed, service unavailable
- **Timeout Errors**: Connection timeouts, slow network responses
- **Protocol Errors**: TLS handshake failures, SSL certificate issues

#### Usage Example

```rust
match TcpStream::connect(target).await {
    Ok(_) => {
        ProxyLogger::log_connection_established(target);
    }
    Err(e) => {
        ProxyLogger::log_connection_failed(target, &e.to_string());
        // Return appropriate HTTP error to client
        client_stream.write_all(b"HTTP/1.1 502 Bad Gateway\r\n\r\n").await?;
    }
}
```

---

### log_error - General Error Logging

#### Function Signature

```rust
pub fn log_error(context: &str, error: &dyn std::fmt::Display)
```

#### Purpose

Provides a generic error logging function that can handle any error type that implements Display. This serves as the central error logging mechanism for the proxy server.

#### What It Does

1. **Contextual Logging**: Associates errors with specific operations or components
2. **Flexible Error Types**: Accepts any type that can be displayed as a string
3. **Standardized Format**: Consistent error message formatting across the application
4. **Debug Support**: Helps developers identify and fix issues

#### Implementation Details

```rust
pub fn log_error(context: &str, error: &dyn std::fmt::Display) {
    eprintln!("Error in {}: {}", context, error);
}
```

#### Parameters

- **`context`**: String describing where the error occurred (e.g., "client handling", "blocklist fetch")
- **`error`**: Any type that implements std::fmt::Display trait

#### Returns

- **None**: This function performs logging only

#### Output Format

```
Error in client handling: Connection reset by peer
Error in blocklist fetch: Network timeout
```

#### Usage Patterns

##### Network Errors

```rust
if let Err(e) = client_stream.read(&mut buf).await {
    ProxyLogger::log_error("client read", &e);
    return Err(e);
}
```

##### System Errors

```rust
match WindowsSystemProxy::enable_system_proxy(&proxy_url) {
    Ok(_) => println!("✅ System proxy enabled"),
    Err(e) => {
        ProxyLogger::log_error("system proxy setup", &e);
        return Err(e);
    }
}
```

##### Configuration Errors

```rust
let blocklist = match fetch_blocklist().await {
    Ok(list) => list,
    Err(e) => {
        ProxyLogger::log_error("blocklist fetch", &e);
        // Continue with empty or cached blocklist
        HashSet::new()
    }
};
```

#### Error Context Examples

- **"client handling"**: Errors in client connection processing
- **"blocklist fetch"**: Errors retrieving malicious domain lists
- **"tunnel stream"**: Errors in bidirectional data copying
- **"system proxy setup"**: Errors configuring Windows proxy settings
- **"firewall rules"**: Errors managing firewall configurations

---

## Data Structures

### ConnectRequestLog - HTTPS CONNECT Request Logging

#### Structure Definition

```rust
#[derive(Debug, Clone)]
pub struct ConnectRequestLog {
    pub client_addr: SocketAddr,           // Client IP and port
    pub target_host: String,              // Target domain (e.g., "google.com")
    pub target_port: u16,                 // Target port (e.g., 443)
    pub http_version: String,             // HTTP version (e.g., "HTTP/1.1")
    pub headers: HashMap<String, String>, // Request headers
}
```

#### Purpose

Structured logging for HTTPS CONNECT requests, providing comprehensive information about tunneling requests for security monitoring and debugging.

#### Fields

- **`client_addr`**: Source address of the client making the request
- **`target_host`**: Domain name being requested for tunneling
- **`target_port`**: Port number for the connection (typically 443 for HTTPS)
- **`http_version`**: HTTP protocol version used in the request
- **`headers`**: All HTTP headers from the CONNECT request

#### Usage Example

```rust
let connect_log = ConnectRequestLog {
    client_addr: client_stream.peer_addr()?,
    target_host: "google.com".to_string(),
    target_port: 443,
    http_version: "HTTP/1.1".to_string(),
    headers: parse_headers(&request),
};
// Could be used for advanced logging or monitoring
```

---

### HttpRequestLog - Regular HTTP Request Logging

#### Structure Definition

```rust
#[derive(Debug, Clone)]
pub struct HttpRequestLog {
    pub client_addr: SocketAddr,           // Client IP and port
    pub method: String,                   // HTTP method (GET, POST, etc.)
    pub path: String,                     // Request path and query
    pub http_version: String,             // HTTP version
    pub headers: HashMap<String, String>, // Request headers
}
```

#### Purpose

Structured logging for regular HTTP requests (GET, POST, etc.), providing detailed information about HTTP traffic for analysis and debugging.

#### Fields

- **`client_addr`**: Source address of the client
- **`method`**: HTTP method (GET, POST, PUT, DELETE, etc.)
- **`path`**: Request path including query parameters
- **`http_version`**: HTTP protocol version
- **`headers`**: All HTTP headers from the request

#### Usage Example

```rust
let http_log = HttpRequestLog {
    client_addr: client_stream.peer_addr()?,
    method: "GET".to_string(),
    path: "/api/data".to_string(),
    http_version: "HTTP/1.1".to_string(),
    headers: parse_headers(&request),
};
// Could be used for HTTP request analysis (currently TODO)
```

---

## Logging Strategy

### Log Levels and Output

- **Standard Output**: `println!()` for informational messages
- **Error Output**: `eprintln!()` for error messages
- **No File Logging**: Currently console-only (could be enhanced)
- **No Log Levels**: Simple binary (info/error) classification

### Message Formatting

- **Consistent Prefixes**: Clear identification of message types
- **Context Information**: Specific details about what operation failed
- **Error Details**: Full error information for debugging
- **User-Friendly**: Readable format for both users and developers

### Performance Considerations

- **Minimal Overhead**: Simple string formatting and console output
- **Non-Blocking**: Console I/O is typically buffered and fast
- **Memory Efficient**: No complex data structures or caching
- **Synchronous**: Logging doesn't block async operations

---

## Usage Patterns

### Startup Logging

```rust
// Log successful proxy startup
ProxyLogger::log_proxy_start(proxy_address);
println!("✅ Proxy server started successfully");
```

### Connection Monitoring

```rust
// Log connection attempts and results
println!("CONNECT request to domain: {}", host_only);

match TcpStream::connect(target).await {
    Ok(_) => ProxyLogger::log_connection_established(target),
    Err(e) => ProxyLogger::log_connection_failed(target, &e.to_string()),
}
```

### Error Handling

```rust
match operation_that_can_fail() {
    Ok(result) => {
        // Handle success
        println!("✅ Operation completed successfully");
    }
    Err(e) => {
        // Log error with context
        ProxyLogger::log_error("operation description", &e);
        // Handle error appropriately
    }
}
```

### Security Event Logging

```rust
if is_blocked {
    println!("🚫 BLOCKED: {} (client: {})", host_only, client_addr);
    ProxyLogger::log_error("security", &format!("Blocked domain: {}", host_only));
}
```

---

## Integration with Other Modules

### Called From Proxy Core

- **`run_proxy`**: Logs proxy startup and connection events
- **`handle_client`**: Logs connection attempts and security decisions
- **`tunnel_stream`**: Logs tunneling errors and timeouts

### Called From System Integration

- **`WindowsSystemProxy`**: Logs system configuration successes and failures
- **HTTP Service**: Logs blocklist fetch errors and successes

### Called From Tauri Commands

- **`enable_system_proxy`**: Logs system configuration operations
- **`disable_system_proxy`**: Logs cleanup operations
- **`restart_proxy`**: Logs restart sequence events

---

## Future Enhancements

### Advanced Logging Features

- **File Logging**: Persistent log storage with rotation
- **Log Levels**: DEBUG, INFO, WARN, ERROR classification
- **Structured Logging**: JSON format for log analysis
- **Log Filtering**: Configurable verbosity levels

### Monitoring Integration

- **Metrics Export**: Connection counts, error rates, performance metrics
- **Alert System**: Automated alerts for critical errors
- **Log Aggregation**: Centralized log collection and analysis
- **Performance Monitoring**: Request latency and throughput tracking

### Security Enhancements

- **Audit Logging**: Security events with tamper-evident logs
- **Anomaly Detection**: Pattern recognition in log data
- **Compliance Logging**: Regulatory compliance log formats
- **Log Encryption**: Secure log storage and transmission

### Debugging Features

- **Request Tracing**: Unique IDs for request correlation
- **Performance Profiling**: Detailed timing and resource usage
- **Stack Traces**: Enhanced error information with context
- **Interactive Debugging**: Runtime log level adjustment

---

## Troubleshooting Guide

### Common Logging Issues

#### Missing Log Output

**Symptoms**: No log messages appear in console
**Cause**: Output redirection or console buffering
**Solution**: Ensure console output is visible, check for output redirection

#### Performance Impact

**Symptoms**: Logging affecting proxy performance
**Cause**: Excessive logging or synchronous I/O blocking
**Solution**: Reduce logging verbosity or implement async logging

#### Log Message Corruption

**Symptoms**: Garbled or incomplete log messages
**Cause**: Concurrent logging from multiple threads
**Solution**: Implement thread-safe logging or message queuing

### Log Analysis

#### Connection Patterns

```bash
# Count successful connections
grep "Connection established" logs.txt | wc -l

# Find failed connections
grep "Failed to connect" logs.txt

# Analyze error patterns
grep "Error in" logs.txt | sort | uniq -c | sort -nr
```

#### Security Monitoring

```bash
# Find blocked domains
grep "BLOCKED:" logs.txt

# Count security events
grep -E "(BLOCKED|Error in security)" logs.txt | wc -l

# Analyze client activity
grep "Connection accepted" logs.txt | cut -d' ' -f4 | sort | uniq -c | sort -nr
```

### Log Rotation and Management

```bash
# Basic log rotation (if file logging is implemented)
find /var/log/proxy -name "*.log" -mtime +30 -delete

# Compress old logs
find /var/log/proxy -name "*.log" -mtime +7 -exec gzip {} \;
```

This logging module provides essential visibility into proxy operations, enabling effective monitoring, debugging, and security analysis of the GuardNest proxy server.
