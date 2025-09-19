// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod logger;
mod windows;

use windows::proxy::{disable_system_proxy, enable_system_proxy, get_proxy_status, restart_proxy};
use windows::screen_record::start_screen_record;
use windows::system::{is_user_admin, system_check};

#[tokio::main]
async fn main() {
    // Stars proxy in background so it can be used by the system to block traffic
    let result = enable_system_proxy().await;
    println!("result: {:?}", result);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_proxy_status,
            restart_proxy,
            enable_system_proxy,
            disable_system_proxy,
            is_user_admin,
            system_check,
            start_screen_record,
        ])
        .setup(|_app| {
            // Ensure root CA exists and is installed in Root store
            windows::certificate::ensure_certificate_installed();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
