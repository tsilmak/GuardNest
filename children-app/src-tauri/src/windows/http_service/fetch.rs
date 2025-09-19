use std::collections::HashSet;

pub fn proxy_fetch_blocklist() -> HashSet<String> {
    // Simulate API call
    vec!["example.com".to_string(), "httpforever.com".to_string()]
        .into_iter()
        .collect()
}
