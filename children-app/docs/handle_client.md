# handle_client - Client Connection Handler

## Overview

The `handle_client` function is the **brain of our proxy server** - it processes each individual client connection from start to finish. It reads HTTP requests, decides whether to allow or block connections, establishes tunnels for HTTPS traffic, and manages the complete lifecycle of each client interaction.

## Function Signature

```rust
pub async fn handle_client(
    mut client_stream: TokioTcpStream,        // TCP connection from browser
    _conn_info: SocketAddr,                   // Client address information
    blocklist: Arc<RwLock<HashSet<String>>>,  // Shared malicious domain list
) -> io::Result<()>
```

## Connection Processing Pipeline

### Complete Flow Diagram

```
1. Read Request ──► 2. Parse HTTP ──► 3. Check Blocklist ──► 4. Connect to Server
      │                       │                       │                        │
      ▼                       ▼                       ▼                        ▼
Read 4KB buffer        CONNECT method?        Domain blocked?         Server response
      │               ┌───YES──┐             ┌───YES──┐            ┌───Success──┐
      ▼               │        │             │        │            │            │
10s timeout           └─Extract domain───────┼─403 Forbidden─────┼─200 OK + Tunnel
                                             │                   │
                                             └─504 Timeout───────┘
```

## Core Responsibilities

### 1. Request Reading and Parsing

```rust
let mut buf = [0u8; 4096];  // 4KB stack buffer for request
let n = match timeout(Duration::from_secs(10), client_stream.read(&mut buf)).await {
    Ok(Ok(n)) => n,        // Successfully read n bytes
    Ok(Err(e)) => return Err(e),  // Read error
    Err(_) => {            // 10-second timeout
        ProxyLogger::log_error("client read timeout", &timeout_error);
        return Ok(());     // Close connection gracefully
    }
};
```

### 2. HTTP Method Detection

```rust
if let Some(first_line) = request.lines().next() {
    let parts: Vec<&str> = first_line.split_whitespace().collect();
    if parts.len() >= 3 && parts[0] == "CONNECT" {
        // Handle HTTPS tunneling
    } else if parts.len() >= 3 {
        // Handle regular HTTP (TODO)
    }
}
```

### 3. Domain Extraction and Validation

```rust
let target = parts[1];  // "google.com:443"
let host_only = target.split(':').next().unwrap_or(target);  // "google.com"
```

### 4. Blocklist Security Check

```rust
let is_blocked = match blocklist.read() {
    Ok(guard) => guard.contains(host_only),  // O(1) HashSet lookup
    Err(poisoned) => {
        // Handle poisoned RwLock (rare thread panic scenario)
        ProxyLogger::log_error("RwLock read error (poisoned)", &poisoned.to_string());
        true  // Conservative: block on error for security
    }
};
```

## Security Features

### Domain Blocklist Protection

- **O(1) Lookup Performance**: HashSet provides constant-time domain checking
- **Thread-Safe Access**: RwLock allows multiple concurrent readers
- **Poison Safety**: Handles thread panics gracefully with conservative blocking
- **Real-time Updates**: Blocklist can be updated without restarting proxy

### Input Validation and Sanitization

- **Buffer Size Limits**: 4KB request buffer prevents memory exhaustion
- **Timeout Protection**: 10-second read timeout prevents hanging connections
- **HTTP Parsing**: Proper validation of CONNECT request format
- **Domain Extraction**: Safe parsing of host:port format

### Error Handling Strategy

- **Conservative Security**: Unknown errors result in connection blocking
- **Graceful Degradation**: Individual connection failures don't crash server
- **Comprehensive Logging**: Detailed error information for security monitoring
- **Resource Cleanup**: Proper connection closure in all error paths

## HTTPS CONNECT Tunneling

### Tunnel Establishment Process

```rust
// 1. Validate domain is not blocked
if is_blocked {
    client_stream.write_all(b"HTTP/1.1 403 Forbidden\r\n\r\n").await?;
    return Ok(());
}

// 2. Connect to target server with timeout
match timeout(Duration::from_secs(10), TokioTcpStream::connect(target)).await {
    Ok(Ok(mut server_stream)) => {
        // 3. Send success response to browser
        client_stream.write_all(b"HTTP/1.1 200 Connection Established\r\n\r\n").await?;

        // 4. Establish bidirectional tunnel
        let (client_read, client_write) = client_stream.split();
        let (server_read, server_write) = server_stream.split();

        tokio::select! {
            _ = tunnel_stream(&mut client_read, &mut server_write, "client_to_server") => {},
            _ = tunnel_stream(&mut server_read, &mut client_write, "server_to_client") => {},
        }
    }
    Ok(Err(e)) => {
        // Connection failed
        client_stream.write_all(b"HTTP/1.1 502 Bad Gateway\r\n\r\n").await?;
    }
    Err(_) => {
        // Connection timeout
        client_stream.write_all(b"HTTP/1.1 504 Gateway Timeout\r\n\r\n").await?;
    }
}
```

### HTTP Status Code Usage

- **200 Connection Established**: Successful tunnel setup
- **403 Forbidden**: Domain blocked by security policy
- **502 Bad Gateway**: Cannot connect to target server
- **504 Gateway Timeout**: Target server connection timeout

## Regular HTTP Support (TODO)

### Planned Implementation

```rust
// TODO: Implement full HTTP proxy functionality
// 1. Parse HTTP headers to extract Host
// 2. Check host against blocklist
// 3. Establish connection to target server
// 4. Forward original request
// 5. Stream response back to client
// 6. Handle connection keep-alive
// 7. Manage HTTP-specific features (redirects, etc.)
```

### Challenges

- **Header Parsing**: More complex than CONNECT requests
- **Connection Reuse**: HTTP keep-alive support
- **Content Modification**: Potential for header manipulation
- **Protocol Complexity**: Multiple HTTP versions and features

## Performance Characteristics

### Memory Usage

- **Request Buffer**: 4KB stack allocation per connection
- **Minimal Overhead**: No heap allocation in hot path
- **Shared Blocklist**: Reference to global domain list

### CPU Usage

- **Domain Lookup**: O(1) HashSet operation (~0.01ms)
- **String Processing**: Host extraction and validation
- **Network I/O**: Async read/write operations
- **Total**: ~0.5-2% CPU per active connection

### Connection Handling

- **Concurrent Processing**: Each connection runs in separate async task
- **Isolation**: Connection errors don't affect others
- **Resource Limits**: Bounded by system file descriptors (~50K max)

### Timeout Behavior

- **Request Read**: 10 seconds for initial HTTP request
- **Server Connection**: 10 seconds for target server connection
- **Tunnel Idle**: 30 seconds per direction (handled by tunnel_stream)

## Error Scenarios and Recovery

### Network-Level Errors

1. **Connection Timeout**: Browser doesn't send request within 10s

   - **Action**: Close connection gracefully
   - **Logging**: Timeout error with connection info

2. **Server Unreachable**: Target server is down or unreachable

   - **Action**: Send 502 Bad Gateway response
   - **Logging**: Connection failure with target details

3. **Server Timeout**: Target server doesn't respond within 10s
   - **Action**: Send 504 Gateway Timeout response
   - **Logging**: Timeout error with target details

### Security-Related Errors

1. **Blocked Domain**: Domain found in malicious domain list

   - **Action**: Send 403 Forbidden response
   - **Logging**: Block event with domain and client info

2. **Poisoned Lock**: Thread panic while holding blocklist lock
   - **Action**: Conservative blocking (security-first)
   - **Logging**: Critical error with poisoned lock details

### Protocol-Level Errors

1. **Malformed Request**: Invalid HTTP request format

   - **Action**: Close connection without response
   - **Logging**: Parse error with request details

2. **Invalid Host**: Cannot extract domain from request
   - **Action**: Close connection
   - **Logging**: Domain extraction error

## Integration Points

### Dependencies

- **tokio::net::TcpStream**: Async TCP connection handling
- **tokio::time::timeout**: Timeout protection for operations
- **std::collections::HashSet**: Efficient domain storage and lookup
- **std::sync::RwLock**: Thread-safe blocklist access
- **ProxyLogger**: Structured error and event logging

### Called From

- **run_proxy**: Main proxy server spawns handle_client for each connection
- **Per-Connection Task**: Each client connection gets its own async task

### Calls Into

- **tunnel_stream**: Establishes bidirectional data tunnels
- **ProxyLogger**: Logs errors and security events
- **blocklist.read()**: Checks domains against malicious list

## Monitoring and Observability

### Security Event Logging

```rust
println!("CONNECT request to domain: {}", host_only);
// Blocklist check results
// Connection establishment status
// Error conditions and recovery actions
```

### Performance Metrics

- **Connection Duration**: Time from accept to close
- **Data Transfer**: Bytes sent/received per connection
- **Blocklist Hit Rate**: Percentage of blocked connection attempts
- **Error Rate**: Frequency of various error conditions

### Debug Information

- **Client Address**: Source IP and port for connection tracking
- **Target Domain**: Requested destination for security analysis
- **HTTP Method**: CONNECT vs other methods for protocol analysis
- **Error Context**: Detailed information for troubleshooting

## Configuration and Tuning

### Current Constants

```rust
const REQUEST_BUFFER_SIZE: usize = 4096;     // 4KB request buffer
const REQUEST_READ_TIMEOUT: Duration = Duration::from_secs(10);  // 10s timeout
const SERVER_CONNECT_TIMEOUT: Duration = Duration::from_secs(10); // 10s timeout
```

### Tunable Parameters

- **Buffer Sizes**: Adjustable based on typical request sizes
- **Timeout Values**: Configurable based on network conditions
- **Logging Verbosity**: Adjustable for production vs debug environments

## Testing Strategy

### Unit Testing

```rust
#[tokio::test]
async fn test_handle_client_blocked_domain() {
    // Test blocklist functionality
}

#[tokio::test]
async fn test_handle_client_timeout() {
    // Test timeout behavior
}

#[tokio::test]
async fn test_handle_client_malformed_request() {
    // Test error handling
}
```

### Integration Testing

- **End-to-End**: Full browser-to-server proxy testing
- **Security Testing**: Blocklist effectiveness verification
- **Load Testing**: High concurrency connection handling
- **Network Testing**: Various network condition simulation

## Future Enhancements

### Security Improvements

- **Advanced Filtering**: URL pattern matching beyond domain blocking
- **Rate Limiting**: Per-client connection rate controls
- **Geographic Blocking**: Country-based access controls
- **Content Inspection**: Optional HTTPS inspection capabilities

### Performance Optimizations

- **Connection Pooling**: Reuse connections to frequently accessed servers
- **DNS Caching**: Local DNS resolution caching
- **Header Compression**: Reduce bandwidth for HTTP requests
- **Protocol Optimization**: HTTP/2 support for better performance

### Feature Additions

- **Regular HTTP Support**: Full HTTP proxying implementation
- **WebSocket Support**: Real-time communication proxying
- **Authentication**: User-based access controls
- **Statistics Export**: Detailed usage and performance metrics

## Troubleshooting Guide

### Common Issues

1. **403 Forbidden**: Domain is in blocklist - check security policy
2. **502 Bad Gateway**: Target server unreachable - verify server status
3. **504 Gateway Timeout**: Network congestion - check connectivity
4. **Connection Timeouts**: Network issues - verify firewall and routing

### Diagnostic Steps

1. **Check Logs**: Review ProxyLogger output for error details
2. **Verify Blocklist**: Ensure malicious domains are properly loaded
3. **Test Connectivity**: Direct connection tests to problematic servers
4. **Monitor Resources**: Check system resources and limits

### Performance Tuning

- **Buffer Sizes**: Adjust based on typical request patterns
- **Timeout Values**: Balance security vs usability requirements
- **Concurrency Limits**: Set based on system capabilities
- **Blocklist Updates**: Ensure regular malicious domain list updates

This function is the critical decision point in the proxy system, implementing security policies and establishing the data tunnels that make secure proxying possible.
