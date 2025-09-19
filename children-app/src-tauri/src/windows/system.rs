use windows::core::{BOOL, BSTR, PWSTR};
use windows::Win32::Foundation::VARIANT_TRUE;
use windows::Win32::NetworkManagement::WindowsFirewall::{
    INetFwPolicy2, INetFwRule, NetFwPolicy2, NetFwRule, NET_FW_ACTION_ALLOW,
    NET_FW_IP_PROTOCOL_TCP, NET_FW_PROFILE2_ALL, NET_FW_RULE_DIR_IN, NET_FW_RULE_DIR_OUT,
};
use windows::Win32::Networking::WinHttp::{
    WinHttpSetDefaultProxyConfiguration, WINHTTP_ACCESS_TYPE_NAMED_PROXY,
    WINHTTP_ACCESS_TYPE_NO_PROXY, WINHTTP_PROXY_INFO,
};
use windows::Win32::Networking::WinInet::{
    InternetSetOptionW, INTERNET_OPTION_PER_CONNECTION_OPTION, INTERNET_OPTION_REFRESH,
    INTERNET_OPTION_SETTINGS_CHANGED, INTERNET_PER_CONN_FLAGS, INTERNET_PER_CONN_OPTIONW,
    INTERNET_PER_CONN_OPTIONW_0, INTERNET_PER_CONN_OPTION_LISTW, INTERNET_PER_CONN_PROXY_BYPASS,
    INTERNET_PER_CONN_PROXY_SERVER, PROXY_TYPE_DIRECT, PROXY_TYPE_PROXY,
};
use windows::Win32::Security::PSID;
use windows::Win32::Security::{
    AllocateAndInitializeSid, CheckTokenMembership, FreeSid, SECURITY_NT_AUTHORITY,
};
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_INPROC_SERVER,
    COINIT_APARTMENTTHREADED,
};
use windows::Win32::System::SystemServices::{
    DOMAIN_ALIAS_RID_ADMINS, SECURITY_BUILTIN_DOMAIN_RID,
};

#[derive(serde::Serialize)]
pub struct SystemCheck {
    pub is_windows: bool,
    pub is_64bit: bool,
    pub is_win10_or_later: bool,
    // pub SMBIOS_UUID: Option<String>,  // SMBIOS UUID or WMI UUID
    // System UUID from SMBIOS windows api
    // get hardware uuid
}
#[derive(Debug)]
pub enum SystemProxyError {
    ProcessError(String),
    RegistryError(String),
}

impl std::fmt::Display for SystemProxyError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SystemProxyError::RegistryError(msg) => write!(f, "Registry error: {}", msg),
            SystemProxyError::ProcessError(msg) => write!(f, "Process error: {}", msg),
        }
    }
}

impl std::error::Error for SystemProxyError {}

pub struct WindowsSystemProxy;

impl WindowsSystemProxy {
    /// Enable system-wide proxy settings in Windows registry
    pub fn enable_system_proxy(proxy_address: &str) -> Result<(), SystemProxyError> {
        let proxy_server = proxy_address.to_string();

        println!("🔧 Configurando proxy do sistema para: {}", proxy_server);

        // 1) Set default WinHTTP proxy
        let bypass_list = "<local>;127.0.0.1;localhost";
        let proxy_wide: Vec<u16> = {
            use std::ffi::OsStr;
            use std::os::windows::ffi::OsStrExt;
            OsStr::new(&proxy_server)
                .encode_wide()
                .chain(std::iter::once(0))
                .collect()
        };
        let bypass_wide: Vec<u16> = {
            use std::ffi::OsStr;
            use std::os::windows::ffi::OsStrExt;
            OsStr::new(bypass_list)
                .encode_wide()
                .chain(std::iter::once(0))
                .collect()
        };

        let mut proxy_info = WINHTTP_PROXY_INFO {
            dwAccessType: WINHTTP_ACCESS_TYPE_NAMED_PROXY,
            lpszProxy: PWSTR(proxy_wide.as_ptr() as *mut _),
            lpszProxyBypass: PWSTR(bypass_wide.as_ptr() as *mut _),
        };

        unsafe {
            WinHttpSetDefaultProxyConfiguration(&mut proxy_info).map_err(|e| {
                SystemProxyError::ProcessError(format!(
                    "WinHttpSetDefaultProxyConfiguration failed: {:?}",
                    e
                ))
            })?;
        }

        // 2) Set WinINet (per-user) proxy used by many apps
        Self::set_ie_proxy(&proxy_server)?;

        println!("✅ Proxy do sistema configurado com sucesso");
        Ok(())
    }

    /// Disable system-wide proxy settings
    pub fn disable_system_proxy() -> Result<(), SystemProxyError> {
        println!("🔧 Desabilitando proxy do sistema...");

        // 1) Disable WinHTTP default proxy
        let mut proxy_info = WINHTTP_PROXY_INFO {
            dwAccessType: WINHTTP_ACCESS_TYPE_NO_PROXY,
            lpszProxy: PWSTR::null(),
            lpszProxyBypass: PWSTR::null(),
        };

        unsafe {
            WinHttpSetDefaultProxyConfiguration(&mut proxy_info).map_err(|e| {
                SystemProxyError::ProcessError(format!(
                    "WinHttpSetDefaultProxyConfiguration (disable) failed: {:?}",
                    e
                ))
            })?;
        }

        // 2) Disable WinINet (per-user) proxy
        Self::disable_ie_proxy()?;

        println!("✅ Proxy do sistema desabilitado");
        Ok(())
    }

    /// Set WinINet per-connection proxy (affects many Windows apps)
    fn set_ie_proxy(proxy_server: &str) -> Result<(), SystemProxyError> {
        unsafe {
            use std::ffi::OsStr;
            use std::mem::size_of;
            use std::os::windows::ffi::OsStrExt;

            // Build wide strings that live until the call returns
            let proxy_w: Vec<u16> = OsStr::new(proxy_server)
                .encode_wide()
                .chain(std::iter::once(0))
                .collect();
            let bypass_list = "<local>;127.0.0.1;localhost";
            let bypass_w: Vec<u16> = OsStr::new(bypass_list)
                .encode_wide()
                .chain(std::iter::once(0))
                .collect();

            let mut options: [INTERNET_PER_CONN_OPTIONW; 3] = [Default::default(); 3];

            options[0].dwOption = INTERNET_PER_CONN_FLAGS;
            options[1].dwOption = INTERNET_PER_CONN_PROXY_SERVER;
            options[2].dwOption = INTERNET_PER_CONN_PROXY_BYPASS;

            options[0].Value = INTERNET_PER_CONN_OPTIONW_0 {
                dwValue: PROXY_TYPE_DIRECT | PROXY_TYPE_PROXY,
            };
            options[1].Value = INTERNET_PER_CONN_OPTIONW_0 {
                pszValue: PWSTR(proxy_w.as_ptr() as *mut _),
            };
            options[2].Value = INTERNET_PER_CONN_OPTIONW_0 {
                pszValue: PWSTR(bypass_w.as_ptr() as *mut _),
            };

            let mut list = INTERNET_PER_CONN_OPTION_LISTW {
                dwSize: size_of::<INTERNET_PER_CONN_OPTION_LISTW>() as u32,
                pszConnection: PWSTR::null(),
                dwOptionCount: options.len() as u32,
                dwOptionError: 0,
                pOptions: options.as_mut_ptr(),
            };

            let list_ptr = &mut list as *mut _ as *mut core::ffi::c_void;
            InternetSetOptionW(
                None,
                INTERNET_OPTION_PER_CONNECTION_OPTION,
                Some(list_ptr),
                size_of::<INTERNET_PER_CONN_OPTION_LISTW>() as u32,
            )
            .map_err(|e| {
                SystemProxyError::RegistryError(format!(
                    "InternetSetOptionW(INTERNET_OPTION_PER_CONNECTION_OPTION) failed: {:?}",
                    e
                ))
            })?;

            // Notify the system that the settings have changed
            InternetSetOptionW(None, INTERNET_OPTION_SETTINGS_CHANGED, None, 0).map_err(|e| {
                SystemProxyError::RegistryError(format!(
                    "InternetSetOptionW(INTERNET_OPTION_SETTINGS_CHANGED) failed: {:?}",
                    e
                ))
            })?;
            InternetSetOptionW(None, INTERNET_OPTION_REFRESH, None, 0).map_err(|e| {
                SystemProxyError::RegistryError(format!(
                    "InternetSetOptionW(INTERNET_OPTION_REFRESH) failed: {:?}",
                    e
                ))
            })?;
        }

        Ok(())
    }

    /// Disable WinINet per-connection proxy
    fn disable_ie_proxy() -> Result<(), SystemProxyError> {
        unsafe {
            use std::ffi::OsStr;
            use std::mem::size_of;
            use std::os::windows::ffi::OsStrExt;

            let empty_w: Vec<u16> = OsStr::new("")
                .encode_wide()
                .chain(std::iter::once(0))
                .collect();

            let mut options: [INTERNET_PER_CONN_OPTIONW; 3] = [Default::default(); 3];

            options[0].dwOption = INTERNET_PER_CONN_FLAGS;
            options[0].Value = INTERNET_PER_CONN_OPTIONW_0 {
                dwValue: PROXY_TYPE_DIRECT,
            };

            options[1].dwOption = INTERNET_PER_CONN_PROXY_SERVER;
            options[1].Value = INTERNET_PER_CONN_OPTIONW_0 {
                pszValue: PWSTR(empty_w.as_ptr() as *mut _),
            };

            options[2].dwOption = INTERNET_PER_CONN_PROXY_BYPASS;
            options[2].Value = INTERNET_PER_CONN_OPTIONW_0 {
                pszValue: PWSTR(empty_w.as_ptr() as *mut _),
            };

            let mut list = INTERNET_PER_CONN_OPTION_LISTW {
                dwSize: size_of::<INTERNET_PER_CONN_OPTION_LISTW>() as u32,
                pszConnection: PWSTR::null(),
                dwOptionCount: options.len() as u32,
                dwOptionError: 0,
                pOptions: options.as_mut_ptr(),
            };

            let list_ptr = &mut list as *mut _ as *mut core::ffi::c_void;
            InternetSetOptionW(None, INTERNET_OPTION_PER_CONNECTION_OPTION, Some(list_ptr), size_of::<INTERNET_PER_CONN_OPTION_LISTW>() as u32)
                .map_err(|e| SystemProxyError::RegistryError(format!(
                    "InternetSetOptionW(INTERNET_OPTION_PER_CONNECTION_OPTION disable) failed: {:?}", e
                )))?;

            InternetSetOptionW(None, INTERNET_OPTION_SETTINGS_CHANGED, None, 0).map_err(|e| {
                SystemProxyError::RegistryError(format!(
                    "InternetSetOptionW(INTERNET_OPTION_SETTINGS_CHANGED) failed: {:?}",
                    e
                ))
            })?;
            InternetSetOptionW(None, INTERNET_OPTION_REFRESH, None, 0).map_err(|e| {
                SystemProxyError::RegistryError(format!(
                    "InternetSetOptionW(INTERNET_OPTION_REFRESH) failed: {:?}",
                    e
                ))
            })?;
        }

        Ok(())
    }

    /// Add Windows Firewall rules for the proxy (COM: INetFwPolicy2)
    pub fn add_firewall_rules(port: u16) -> Result<(), SystemProxyError> {
        println!("🛡️ Adicionando regras do firewall para porta {}...", port);

        struct ComApartment;
        impl ComApartment {
            fn init() -> Result<Self, SystemProxyError> {
                unsafe {
                    CoInitializeEx(None, COINIT_APARTMENTTHREADED)
                        .ok()
                        .map_err(|e| {
                            SystemProxyError::ProcessError(format!(
                                "CoInitializeEx failed: {:?}",
                                e
                            ))
                        })?;
                }
                Ok(Self)
            }
        }
        impl Drop for ComApartment {
            fn drop(&mut self) {
                unsafe {
                    CoUninitialize();
                }
            }
        }

        let _com = ComApartment::init()?;

        // Create policy object
        let policy: INetFwPolicy2 = unsafe {
            CoCreateInstance(&NetFwPolicy2, None, CLSCTX_INPROC_SERVER).map_err(|e| {
                SystemProxyError::ProcessError(format!(
                    "CoCreateInstance(NetFwPolicy2) failed: {:?}",
                    e
                ))
            })?
        };

        let rules = unsafe {
            policy.Rules().map_err(|e| {
                SystemProxyError::ProcessError(format!("INetFwPolicy2.Rules failed: {:?}", e))
            })?
        };

        // Helper to add a rule
        let add_rule = |name: &str, direction_in: bool| -> Result<(), SystemProxyError> {
            let rule: INetFwRule = unsafe {
                CoCreateInstance(&NetFwRule, None, CLSCTX_INPROC_SERVER).map_err(|e| {
                    SystemProxyError::ProcessError(format!(
                        "CoCreateInstance(NetFwRule) failed: {:?}",
                        e
                    ))
                })?
            };

            unsafe { rule.SetName(&BSTR::from(name)) }
                .map_err(|e| SystemProxyError::ProcessError(format!("put_Name failed: {:?}", e)))?;
            unsafe { rule.SetDescription(&BSTR::from("GuardNest proxy rule")) }.map_err(|e| {
                SystemProxyError::ProcessError(format!("put_Description failed: {:?}", e))
            })?;
            unsafe { rule.SetProtocol(NET_FW_IP_PROTOCOL_TCP.0 as i32) }.map_err(|e| {
                SystemProxyError::ProcessError(format!("put_Protocol failed: {:?}", e))
            })?;
            unsafe { rule.SetLocalPorts(&BSTR::from(format!("{}", port))) }.map_err(|e| {
                SystemProxyError::ProcessError(format!("put_LocalPorts failed: {:?}", e))
            })?;
            unsafe {
                rule.SetDirection(if direction_in {
                    NET_FW_RULE_DIR_IN
                } else {
                    NET_FW_RULE_DIR_OUT
                })
            }
            .map_err(|e| {
                SystemProxyError::ProcessError(format!("put_Direction failed: {:?}", e))
            })?;
            unsafe { rule.SetAction(NET_FW_ACTION_ALLOW) }.map_err(|e| {
                SystemProxyError::ProcessError(format!("put_Action failed: {:?}", e))
            })?;
            unsafe { rule.SetEnabled(VARIANT_TRUE) }.map_err(|e| {
                SystemProxyError::ProcessError(format!("put_Enabled failed: {:?}", e))
            })?;
            unsafe { rule.SetProfiles(NET_FW_PROFILE2_ALL.0) }.map_err(|e| {
                SystemProxyError::ProcessError(format!("put_Profiles failed: {:?}", e))
            })?;

            unsafe {
                rules.Add(&rule).map_err(|e| {
                    SystemProxyError::ProcessError(format!("Rules.Add failed: {:?}", e))
                })?;
            }
            Ok(())
        };

        if let Err(e) = add_rule("GuardNest Proxy Inbound", true) {
            println!("⚠️ Aviso: Falha ao adicionar regra de entrada: {}", e);
        } else {
            println!("✅ Regra de entrada adicionada");
        }

        if let Err(e) = add_rule("GuardNest Proxy Outbound", false) {
            println!("⚠️ Aviso: Falha ao adicionar regra de saída: {}", e);
        } else {
            println!("✅ Regra de saída adicionada");
        }

        Ok(())
    }

    /// Remove Windows Firewall rules for the proxy via INetFwPolicy2
    pub fn remove_firewall_rules() -> Result<(), SystemProxyError> {
        println!("🛡️ Removendo regras do firewall...");

        struct ComApartment;
        impl ComApartment {
            fn init() -> Result<Self, SystemProxyError> {
                unsafe {
                    CoInitializeEx(None, COINIT_APARTMENTTHREADED)
                        .ok()
                        .map_err(|e| {
                            SystemProxyError::ProcessError(format!(
                                "CoInitializeEx failed: {:?}",
                                e
                            ))
                        })?;
                }
                Ok(Self)
            }
        }
        impl Drop for ComApartment {
            fn drop(&mut self) {
                unsafe {
                    CoUninitialize();
                }
            }
        }

        let _com = ComApartment::init()?;

        let policy: INetFwPolicy2 = unsafe {
            CoCreateInstance(&NetFwPolicy2, None, CLSCTX_INPROC_SERVER).map_err(|e| {
                SystemProxyError::ProcessError(format!(
                    "CoCreateInstance(NetFwPolicy2) failed: {:?}",
                    e
                ))
            })?
        };
        let rules = unsafe {
            policy.Rules().map_err(|e| {
                SystemProxyError::ProcessError(format!("INetFwPolicy2.Rules failed: {:?}", e))
            })?
        };

        if let Err(e) = unsafe { rules.Remove(&BSTR::from("GuardNest Proxy Inbound")) } {
            println!("⚠️ Aviso: Regra de entrada pode não ter existido: {:?}", e);
        } else {
            println!("✅ Regra de entrada removida");
        }

        if let Err(e) = unsafe { rules.Remove(&BSTR::from("GuardNest Proxy Outbound")) } {
            println!("⚠️ Aviso: Regra de saída pode não ter existido: {:?}", e);
        } else {
            println!("✅ Regra de saída removida");
        }

        Ok(())
    }

    pub fn is_user_admin() -> bool {
        /*https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-checktokenmembership#:~:text=/*%2B%2B%20%0ARoutine%20Description%3A%20This,Administrators%20local%20group.%20%2D%2D%0A*/
        Routine Description: This routine returns TRUE if the caller's
        process is a member of the Administrators local group. Caller is NOT
        expected to be impersonating anyone and is expected to be able to
        open its own process and process token.
        Arguments: None.
        Return Value:
           TRUE - Caller has Administrators local group.
           FALSE - Caller does not have Administrators local group. --
        */
        unsafe {
            let mut admin_group_sid: PSID = PSID::default();
            let nt_authority = SECURITY_NT_AUTHORITY;

            let mut is_member = BOOL(0);

            let result = AllocateAndInitializeSid(
                &nt_authority,
                2,
                SECURITY_BUILTIN_DOMAIN_RID.try_into().unwrap(),
                DOMAIN_ALIAS_RID_ADMINS.try_into().unwrap(),
                0,
                0,
                0,
                0,
                0,
                0,
                &mut admin_group_sid as *mut _ as *mut PSID,
            );

            if result.is_ok() {
                CheckTokenMembership(None, admin_group_sid, &mut is_member)
                    .map_err(|_| ())
                    .ok();
                FreeSid(admin_group_sid);
            }

            is_member.as_bool()
        }
    }
    pub fn system_check() -> SystemCheck {
        let is_win = cfg!(target_os = "windows");
        let is_64 = cfg!(target_pointer_width = "64");
        let mut is_win10_or_later = false;

        if is_win {
            use windows::Wdk::System::SystemServices::RtlGetVersion;
            use windows::Win32::System::SystemInformation::OSVERSIONINFOEXW;

            let mut info = OSVERSIONINFOEXW {
                dwOSVersionInfoSize: core::mem::size_of::<OSVERSIONINFOEXW>() as u32,
                ..Default::default()
            };

            unsafe {
                RtlGetVersion(&mut info as *mut _ as *mut _);
            }

            // Windows 10 is version 10.0
            is_win10_or_later = (info.dwMajorVersion > 10)
                || (info.dwMajorVersion == 10 && info.dwMinorVersion >= 0);

            // Windows Product ID from registry
        }

        SystemCheck {
            is_windows: is_win,
            is_64bit: is_64,
            is_win10_or_later,
        }
    }
}

#[tauri::command]
pub fn is_user_admin() -> bool {
    WindowsSystemProxy::is_user_admin()
}

#[tauri::command]
pub fn system_check() -> SystemCheck {
    WindowsSystemProxy::system_check()
}
