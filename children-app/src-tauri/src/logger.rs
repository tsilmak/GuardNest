use chrono::Utc;
use std::collections::HashMap;
use std::net::SocketAddr;

#[derive(Debug, Clone)]
pub struct ConnectRequestLog {
    pub client_addr: SocketAddr,
    pub target_host: String,
    pub target_port: u16,
    pub http_version: String,
    pub headers: HashMap<String, String>,
}

#[derive(Debug, Clone)]
pub struct HttpRequestLog {
    pub client_addr: SocketAddr,
    pub method: String,
    pub path: String,
    pub http_version: String,
    pub headers: HashMap<String, String>,
}

pub struct ProxyLogger;

impl ProxyLogger {
    pub fn log_proxy_start(addr: SocketAddr) {
        println!("Proxy running at http://{}", addr);
    }

    pub fn log_connection_established(target: &str) {
        println!("Connection established to {}", target);
    }

    pub fn log_connection_failed(target: &str, error: &str) {
        println!("Failed to connect to {}: {}", target, error);
    }

    pub fn log_error(context: &str, error: &dyn std::fmt::Display) {
        eprintln!("Error in {}: {}", context, error);
    }
}
