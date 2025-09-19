# get_proxy_status - Check Proxy Server Running State

## Overview

The `get_proxy_status` Tauri command provides a **synchronous status check** of the proxy server's running state. It queries the global task handle to determine if the proxy is actively running, which is essential for UI state management and preventing duplicate operations.

## Function Signature

```rust
#[tauri::command]
pub fn get_proxy_status() -> Result<bool, String>
```

## Status Check Logic

### Complete Flow Diagram

```
Global State ──► Task Handle ──► Check Status ──► Return Result
     │                │                │                │
     ▼                ▼                ▼                ▼
PROXY_HANDLE     Some(JoinHandle)   is_finished()?   true/false
  mutex ─────►     .lock()        ┌───false──┐     ┌───true──┐
     │                │           │          │     │         │
     └─None───────────┼───────────┼───true───┼─────┼───false─┘
                      │           │          │     │
                      └───────────┼──────────┘     │
                                 │                │
                                 └─Return false───┘
```

## Core Implementation

### Thread-Safe Status Query

```rust
let is_running = PROXY_TASK_HANDLE
    .lock()
    .unwrap()
    .as_ref()
    .map_or(false, |h| !h.is_finished());
```

- **Mutex Acquisition**: Thread-safe access to global task handle
- **Handle Existence**: Returns false if no proxy task exists
- **Task Completion**: Uses `is_finished()` to check if task is still running
- **Boolean Logic**: `!h.is_finished()` converts to running state

### Error Handling

```rust
Ok(is_running)
```

- **Poison Safety**: `unwrap()` is safe here as mutex poisoning would be critical
- **Type Safety**: Returns `Result<bool, String>` for Tauri command interface
- **Success Path**: Always succeeds with boolean status

## Design Principles

### Synchronous Operation

- **Fast Response**: Status checks should be immediate and non-blocking
- **UI Responsiveness**: Frontend needs instant feedback for state updates
- **Low Overhead**: Minimal system impact for frequent calls

### Conservative Approach

- **Default to False**: Any uncertainty results in "not running" status
- **Safety First**: Prefer false negatives over false positives
- **Error Tolerance**: Handle edge cases gracefully

### Thread Safety

- **Mutex Protection**: Required for shared state access
- **Minimal Lock Duration**: Lock held only during status check
- **No Side Effects**: Read-only operation, no state modifications

## Performance Characteristics

### Execution Time

- **Mutex Acquisition**: ~1-10μs depending on contention
- **Status Check**: Near-instantaneous task state query
- **Total**: ~5-50μs for complete operation
- **Scalability**: Performance doesn't degrade with system load

### Resource Usage

- **Memory**: Minimal stack usage, no heap allocation
- **CPU**: Negligible impact, suitable for frequent calls
- **System Calls**: None required for basic status check

### Frequency Considerations

- **UI Polling**: Can be called frequently (every 1-5 seconds) without impact
- **Event-Driven**: Could be optimized with event-driven status updates
- **Caching**: Status can be cached briefly if needed

## Integration with Frontend

### Tauri Command Usage

```rust
// Frontend status polling
const checkStatus = async () => {
    try {
        const isRunning = await invoke('get_proxy_status');
        setProxyStatus(isRunning);

        // Update UI elements based on status
        updateEnableButton(!isRunning);
        updateDisableButton(isRunning);
        updateStatusIndicator(isRunning ? 'running' : 'stopped');
    } catch (error) {
        console.error('Failed to get proxy status:', error);
        // Handle error state
    }
};

// Periodic status checking
useEffect(() => {
    checkStatus(); // Initial check
    const interval = setInterval(checkStatus, 2000); // Every 2 seconds
    return () => clearInterval(interval);
}, []);
```

### State Management Integration

```rust
// React state management
const [proxyRunning, setProxyRunning] = useState(false);
const [statusError, setStatusError] = useState(null);

// Status update function
const updateProxyStatus = async () => {
    try {
        const isRunning = await invoke('get_proxy_status');
        setProxyRunning(isRunning);
        setStatusError(null);
    } catch (error) {
        setStatusError(error);
        setProxyRunning(false); // Conservative fallback
    }
};
```

## Usage Scenarios

### UI State Synchronization

- **Button States**: Enable/disable buttons based on current status
- **Status Indicators**: Visual feedback showing proxy state
- **Menu Items**: Context menu options based on running state
- **Notifications**: Alerts when proxy state changes unexpectedly

### Operation Validation

- **Duplicate Prevention**: Check before starting proxy to avoid conflicts
- **Graceful Operations**: Verify proxy state before enable/disable operations
- **Error Recovery**: Detect when proxy has stopped unexpectedly
- **User Feedback**: Provide appropriate messages based on current state

### Monitoring and Alerts

- **Health Monitoring**: Periodic checks for proxy availability
- **Automatic Recovery**: Detect failures and trigger recovery procedures
- **Usage Tracking**: Monitor proxy uptime and availability
- **Performance Metrics**: Track proxy stability over time

## Error Scenarios and Edge Cases

### Expected Behaviors

1. **Proxy Running**: Returns `Ok(true)`

   - Task handle exists and `is_finished()` returns false

2. **Proxy Stopped**: Returns `Ok(false)`

   - No task handle exists OR `is_finished()` returns true

3. **Mutex Poisoned**: Would cause panic (acceptable for critical system state)
   - This indicates a serious threading issue that should crash the application

### Edge Cases

1. **Task Completed but Handle Not Cleared**: Returns `Ok(false)`

   - Conservative approach prevents false positive

2. **Task Starting/Stopping**: Race condition during state transitions

   - Result depends on timing, but always returns valid boolean

3. **Application Restart**: Fresh application instance
   - Returns `Ok(false)` until proxy is started

## Thread Safety Analysis

### Mutex Usage

- **Protection Scope**: Guards access to shared `PROXY_TASK_HANDLE`
- **Lock Duration**: Minimal - only during handle access and status check
- **Contention**: Low - status checks are read-only and fast

### Task Handle Management

- **Ownership**: Handle owned by static mutex-protected variable
- **Lifecycle**: Created by `enable_system_proxy`, cleared by `disable_system_proxy`
- **Consistency**: Handle state reflects actual proxy task state

### Race Condition Prevention

- **Atomic Checks**: Status check is atomic with respect to handle state
- **No TOCTOU**: Check and return happen under mutex protection
- **Conservative Results**: Any ambiguity results in safe default (false)

## Testing Strategy

### Unit Testing

```rust
#[test]
fn test_get_proxy_status_not_running() {
    // Setup: No proxy task running
    // Assert: Returns Ok(false)
}

#[test]
fn test_get_proxy_status_running() {
    // Setup: Mock running proxy task
    // Assert: Returns Ok(true)
}

#[test]
fn test_get_proxy_status_after_completion() {
    // Setup: Completed proxy task
    // Assert: Returns Ok(false)
}
```

### Integration Testing

- **Full Lifecycle**: Test status through enable → running → disable → stopped
- **Concurrent Access**: Test status checks during proxy operations
- **Error Conditions**: Test behavior when proxy task encounters errors
- **Performance**: Verify status checks don't impact proxy performance

## Monitoring and Observability

### Debug Logging (if added)

```rust
// Optional debug logging
println!("Proxy status check: is_running={}", is_running);
```

- **State Transitions**: Log when status changes
- **Call Frequency**: Monitor how often status is checked
- **Performance**: Track status check timing

### Metrics Collection

- **Call Count**: Number of status checks over time
- **Response Time**: Average time for status checks
- **Error Rate**: Frequency of status check failures
- **State Changes**: Track proxy state transitions

## Configuration and Tuning

### Current Implementation

```rust
// No configuration parameters currently
// Could be extended with:
const STATUS_CHECK_CACHE_DURATION: Duration = Duration::from_millis(100);
const MAX_STATUS_CHECK_FREQUENCY: Duration = Duration::from_millis(50);
```

### Potential Enhancements

- **Caching**: Cache status for short duration to reduce mutex contention
- **Rate Limiting**: Prevent excessive status checks from UI
- **Event-Driven**: Push status updates instead of polling
- **Detailed Status**: Return more than just running/stopped

## Troubleshooting Guide

### Common Issues

1. **Inconsistent Status**: UI shows different status than actual proxy state

   - **Cause**: Race conditions or stale cached status
   - **Solution**: Implement status caching with short TTL

2. **Performance Impact**: Status checks affecting UI responsiveness

   - **Cause**: High-frequency polling or mutex contention
   - **Solution**: Reduce polling frequency or implement caching

3. **False Status**: Status doesn't match actual proxy behavior
   - **Cause**: Task completion not properly reflected in handle state
   - **Solution**: Verify task handle cleanup in enable/disable functions

### Diagnostic Steps

1. **Manual Verification**: Check if proxy is actually accepting connections
2. **Log Analysis**: Review proxy startup/shutdown logs
3. **Timing Analysis**: Check timing of status checks vs state changes
4. **Mutex Debugging**: Verify no deadlocks or excessive contention

### Performance Tuning

- **Polling Frequency**: Balance between responsiveness and overhead
- **Caching Strategy**: Implement smart caching for status checks
- **Event Notifications**: Consider push-based status updates
- **Batch Updates**: Group multiple status-dependent UI updates

## Future Enhancements

### Advanced Status Information

```rust
// Potential extended status structure
struct ProxyStatus {
    is_running: bool,
    uptime: Duration,
    active_connections: u32,
    total_requests: u64,
    error_count: u32,
}
```

### Event-Driven Architecture

- **Status Change Events**: Push notifications when proxy state changes
- **Connection Events**: Real-time connection count updates
- **Error Events**: Immediate notification of proxy issues
- **Performance Events**: Real-time metrics and statistics

### Enhanced Monitoring

- **Health Checks**: Detailed proxy health status
- **Resource Usage**: Memory, CPU, and network statistics
- **Configuration Status**: Verification of system settings
- **Security Status**: Blocklist and firewall rule validation

This function serves as the critical bridge between the proxy's internal state and the user interface, enabling responsive and accurate status reporting for a smooth user experience.
