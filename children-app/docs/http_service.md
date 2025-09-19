# HTTP Service - Blocklist Management and External API Integration

## Overview

The `http_service` module handles external HTTP communications for the GuardNest proxy server. Currently focused on blocklist management, this module provides the interface for fetching malicious domain lists from external sources. It serves as the bridge between the proxy core and external security intelligence feeds.

## Module Structure

### Components

- **`fetch.rs`** - Blocklist fetching functionality
- **`mod.rs`** - Module declarations and exports

### Dependencies

```rust
use std::collections::HashSet;  // For domain storage and deduplication
```

## Function Documentation

### proxy_fetch_blocklist - Malicious Domain List Retrieval

#### Function Signature

```rust
pub fn proxy_fetch_blocklist() -> HashSet<String>
```

#### Purpose

Retrieves the latest list of malicious domains from external security intelligence sources. This function provides the domain blocklist that powers the proxy's security filtering capabilities, enabling real-time protection against known malicious websites.

#### What It Does

1. **External API Communication**: Connects to security intelligence feeds
2. **Domain List Retrieval**: Downloads current malicious domain lists
3. **Data Processing**: Parses and validates domain entries
4. **Deduplication**: Removes duplicate entries using HashSet
5. **Data Return**: Provides clean domain list for proxy integration

#### Current Implementation

```rust
pub fn proxy_fetch_blocklist() -> HashSet<String> {
    // Simulate API call - TODO: Implement real API integration
    vec!["example.com".to_string(), "httpforever.com".to_string()]
        .into_iter()
        .collect()
}
```

#### Parameters

- **None**: Fetches from predefined external sources

#### Returns

- **`HashSet<String>`**: Collection of malicious domain names
  - **Deduplication**: Automatic removal of duplicate domains
  - **Fast Lookup**: O(1) average case domain checking
  - **Memory Efficient**: No duplicate string storage

#### Domain Format

- **Fully Qualified**: `example.com`, `subdomain.example.com`
- **No Protocol**: No `http://` or `https://` prefixes
- **Case Sensitive**: Domains are treated as case-sensitive
- **Unicode Support**: Supports internationalized domain names

#### Usage in Proxy Core

##### Background Task Integration

```rust
// Called from blocklist updater task in run_proxy
let fetch_result = tokio::task::spawn_blocking(http_service::fetch::proxy_fetch_blocklist).await;

match fetch_result {
    Ok(new_blocked_addresses) => {
        let mut current = blocklist.write().unwrap();

        // Only update if blocklist changed
        if *current != new_blocked_addresses {
            *current = new_blocked_addresses;
            println!("Blocklist updated");
        }
    }
    Err(e) => ProxyLogger::log_error("fetching blocklist", &e.to_string()),
}
```

##### Security Integration

```rust
// Used in handle_client for domain blocking
let is_blocked = match blocklist.read() {
    Ok(guard) => guard.contains(host_only),
    Err(poisoned) => {
        ProxyLogger::log_error("RwLock read error (poisoned)", &poisoned.to_string());
        true  // Conservative: block on error
    }
};

if is_blocked {
    client_stream.write_all(b"HTTP/1.1 403 Forbidden\r\n\r\n").await?;
    return Ok(());
}
```

## Design Considerations

### Synchronous vs Asynchronous

- **Current**: Synchronous implementation for simplicity
- **Future**: Should be async for better scalability
- **spawn_blocking**: Used in tokio runtime to prevent blocking

### Error Handling Strategy

- **Graceful Degradation**: On fetch failure, proxy continues with existing blocklist
- **Logging**: All errors logged for monitoring and debugging
- **Fallback**: Never fails proxy operation, only security updates

### Performance Optimization

- **HashSet Usage**: O(1) lookup performance for domain checking
- **Memory Efficiency**: Shared storage prevents duplication
- **Incremental Updates**: Only update when blocklist actually changes

## Security Features

### Domain Validation

- **Format Checking**: Ensure valid domain name format
- **Sanitization**: Remove malicious or malformed entries
- **Unicode Handling**: Proper handling of international domains

### Data Integrity

- **Source Verification**: Validate authenticity of blocklist sources
- **Checksum Validation**: Ensure data integrity during transfer
- **Freshness Checks**: Verify blocklist currency and timeliness

### Privacy Protection

- **Minimal Data Exposure**: Only necessary domain information
- **No Personal Data**: No user-specific information in requests
- **Secure Transport**: HTTPS-only communication with sources

## Integration Patterns

### Called From Background Task

```rust
// In run_proxy background task
tokio::spawn(async move {
    loop {
        // Fetch blocklist every 30 seconds
        let fetch_result = tokio::task::spawn_blocking(
            http_service::fetch::proxy_fetch_blocklist
        ).await;

        // Process results and update shared blocklist
        // ... error handling and update logic
    }
});
```

### Blocklist Update Logic

```rust
match fetch_result {
    Ok(new_domains) => {
        let mut blocklist = blocklist.write().unwrap();

        // Atomic update - replace entire blocklist
        if *blocklist != new_domains {
            *blocklist = new_domains;
            println!("✅ Blocklist updated with {} domains", blocklist.len());
        }
    }
    Err(e) => {
        ProxyLogger::log_error("blocklist fetch", &e);
        // Continue with existing blocklist
    }
}
```

## Future Enhancements

### Real API Integration

```rust
// TODO: Replace simulation with real API calls
pub async fn proxy_fetch_blocklist() -> Result<HashSet<String>, HttpError> {
    // 1. Connect to security intelligence APIs
    // 2. Authenticate and authorize requests
    // 3. Fetch multiple blocklist sources
    // 4. Merge and deduplicate results
    // 5. Validate and sanitize domains
    // 6. Return comprehensive blocklist
}
```

### Multiple Sources

- **Primary Sources**: Official security intelligence feeds
- **Backup Sources**: Alternative providers for redundancy
- **Local Sources**: Custom blocklists and overrides
- **Community Sources**: User-contributed threat intelligence

### Advanced Features

- **Incremental Updates**: Only fetch changes since last update
- **Source Prioritization**: Weighted merging from multiple sources
- **Category Support**: Different blocklist categories (malware, phishing, etc.)
- **TTL Management**: Time-based expiration of blocklist entries

## API Design Considerations

### Current Limitations

- **Synchronous**: Blocks calling thread during fetch
- **Hardcoded Data**: Uses simulated data instead of real API
- **Single Source**: No redundancy or fallback sources
- **No Caching**: Fetches full list on every call

### Future API Structure

```rust
pub struct BlocklistConfig {
    pub sources: Vec<BlocklistSource>,
    pub cache_duration: Duration,
    pub max_domains: usize,
    pub enable_categories: Vec<BlocklistCategory>,
}

pub struct BlocklistSource {
    pub url: String,
    pub api_key: Option<String>,
    pub format: BlocklistFormat,
    pub priority: u8,
}

pub enum BlocklistCategory {
    Malware,
    Phishing,
    Scam,
    AdultContent,
    Custom,
}
```

## Error Handling and Recovery

### Network Errors

```rust
// Handle connection failures
if let Err(e) = client.get(&url).send().await {
    ProxyLogger::log_error("blocklist API", &e);
    return get_cached_blocklist(); // Fallback to cache
}
```

### Data Validation Errors

```rust
// Validate domain format
for domain in domains {
    if !is_valid_domain(&domain) {
        ProxyLogger::log_error("invalid domain", &domain);
        continue; // Skip invalid domains
    }
}
```

### Rate Limiting

```rust
// Implement backoff on API errors
if api_errors > MAX_ERRORS {
    sleep(RETRY_DELAY).await;
    api_errors = 0;
}
```

## Monitoring and Observability

### Success Metrics

```rust
println!("✅ Blocklist updated: {} domains from {} sources",
         domains.len(), sources.len());
```

### Failure Metrics

```rust
ProxyLogger::log_error("blocklist fetch failed",
                      &format!("Source: {}, Error: {}", source.url, e));
```

### Performance Metrics

- **Fetch Time**: Time to retrieve and process blocklist
- **Domain Count**: Number of domains in current blocklist
- **Update Frequency**: How often blocklist is successfully updated
- **Failure Rate**: Percentage of failed update attempts

## Testing Strategy

### Unit Testing

```rust
#[test]
fn test_proxy_fetch_blocklist() {
    let blocklist = proxy_fetch_blocklist();

    // Verify expected domains are present
    assert!(blocklist.contains("example.com"));
    assert!(blocklist.contains("httpforever.com"));

    // Verify no duplicates
    assert_eq!(blocklist.len(), 2);
}
```

### Integration Testing

```rust
#[tokio::test]
async fn test_blocklist_update_integration() {
    // Test full update cycle
    let blocklist = Arc::new(RwLock::new(HashSet::new()));

    // Simulate background task
    let fetch_result = spawn_blocking(proxy_fetch_blocklist).await;
    assert!(fetch_result.is_ok());

    // Update shared blocklist
    let mut guard = blocklist.write().unwrap();
    *guard = fetch_result.unwrap();

    // Verify update
    assert!(!guard.is_empty());
}
```

### Mock Testing

```rust
// Mock HTTP client for testing
#[cfg(test)]
mod tests {
    use super::*;
    use mockito::mock;

    #[tokio::test]
    async fn test_blocklist_api_integration() {
        let _m = mock("GET", "/api/blocklist")
            .with_status(200)
            .with_body(r#"["malicious.com", "phishing.net"]"#)
            .create();

        let result = fetch_real_blocklist().await;
        assert!(result.is_ok());
        assert!(result.unwrap().contains("malicious.com"));
    }
}
```

## Troubleshooting Guide

### Common Issues

#### Empty Blocklist

**Symptoms**: Blocklist returns empty or very small set
**Cause**: API failures, network issues, or source problems
**Solution**:

1. Check network connectivity
2. Verify API endpoints are accessible
3. Review error logs for specific failures
4. Consider fallback to cached blocklist

#### Slow Updates

**Symptoms**: Blocklist updates take unusually long
**Cause**: Network latency, large blocklist, or slow API response
**Solution**:

1. Implement timeout for fetch operations
2. Consider incremental updates
3. Optimize API response parsing
4. Use multiple sources with failover

#### Memory Issues

**Symptoms**: High memory usage or OOM errors
**Cause**: Very large blocklist or memory leaks
**Solution**:

1. Implement size limits on blocklist
2. Use streaming parsing for large responses
3. Implement garbage collection for old entries
4. Monitor memory usage and set limits

### Diagnostic Steps

1. **Network Testing**: Verify connectivity to blocklist sources
2. **API Response**: Check if sources are returning valid data
3. **Parsing Issues**: Validate JSON/XML parsing is working
4. **Performance**: Monitor fetch time and memory usage

### Recovery Procedures

1. **Fallback Mode**: Use cached or hardcoded blocklist
2. **Reduced Frequency**: Temporarily reduce update frequency
3. **Manual Override**: Allow manual blocklist specification
4. **Alternative Sources**: Switch to backup blocklist sources

## Future API Integration Plan

### Phase 1: Basic HTTP Client

```rust
use reqwest::{Client, Error};

pub async fn fetch_from_api(url: &str) -> Result<HashSet<String>, Error> {
    let client = Client::new();
    let response = client.get(url).send().await?;
    let domains: Vec<String> = response.json().await?;
    Ok(domains.into_iter().collect())
}
```

### Phase 2: Multiple Sources with Fallback

```rust
pub async fn fetch_with_fallback() -> HashSet<String> {
    let sources = vec![
        "https://api.source1.com/blocklist",
        "https://api.source2.com/domains",
        "https://backup.source3.com/malicious",
    ];

    for source in sources {
        match fetch_from_api(source).await {
            Ok(domains) if !domains.is_empty() => return domains,
            _ => continue, // Try next source
        }
    }

    // All sources failed - return minimal fallback
    vec!["fallback-blocked.com".to_string()].into_iter().collect()
}
```

### Phase 3: Advanced Features

- **Authentication**: API key management
- **Rate Limiting**: Respect API rate limits
- **Caching**: Intelligent caching with TTL
- **Compression**: Handle compressed responses
- **Monitoring**: Detailed API health monitoring

This HTTP service module provides the foundation for external security intelligence integration, enabling the proxy to stay current with the latest threat intelligence and maintain effective protection against malicious domains.
