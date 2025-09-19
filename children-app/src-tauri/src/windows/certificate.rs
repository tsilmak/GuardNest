use std::fs;
use std::io::Write;
use std::path::Path;

use rcgen::{
    BasicConstraints, CertificateParams, DnType, IsCa, KeyPair, KeyUsagePurpose,
    PKCS_ECDSA_P256_SHA256,
};

// We use OpenSSL only to package the rcgen-generated key/cert into a PKCS#12 (.p12)
use openssl::pkcs12::Pkcs12;
use openssl::pkey::PKey;
use openssl::x509::X509;
use std::process::Command;

/// Generate a self-signed Root CA certificate and save it as a PKCS#12 file
/// at C:\\ProgramData\\GuardNest\\certificate.p12.
///
/// This root will later be used to sign per-host leaf certificates for MITM.
pub fn generate_certificate() {
    println!("Generating GuardNest Root CA (PKCS#12)...");

    let output_path = Path::new("C:\\ProgramData\\GuardNest\\certificate.p12");
    if let Some(parent) = output_path.parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            eprintln!("❌ Failed to create directory {:?}: {}", parent, e);
            return;
        }
    }

    // 1) Build CA certificate parameters
    let mut params = CertificateParams::default();

    // Mark as a CA with unconstrained path length
    params.is_ca = IsCa::Ca(BasicConstraints::Unconstrained);

    // Key usages appropriate for a CA
    params.key_usages = vec![KeyUsagePurpose::KeyCertSign, KeyUsagePurpose::CrlSign];

    // Set a readable subject
    params
        .distinguished_name
        .push(DnType::CommonName, "GuardNest Local CA");

    // 2) Generate a keypair and create the self-signed CA certificate
    let key_pair = match KeyPair::generate_for(&PKCS_ECDSA_P256_SHA256) {
        Ok(kp) => kp,
        Err(e) => {
            eprintln!("❌ Failed to generate key pair: {}", e);
            return;
        }
    };

    let certified = match params.self_signed(&key_pair) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("❌ Failed to create self-signed CA: {}", e);
            return;
        }
    };

    // 3) Extract DER for certificate and private key (PKCS#8)
    let ca_cert_der = certified.der();
    let ca_key_der = key_pair.serialize_der();

    // 4) Convert to OpenSSL types
    let x509 = match X509::from_der(&ca_cert_der) {
        Ok(x) => x,
        Err(e) => {
            eprintln!("❌ Failed to parse DER certificate with OpenSSL: {}", e);
            return;
        }
    };

    let pkey = match PKey::private_key_from_pkcs8(&ca_key_der) {
        Ok(k) => k,
        Err(_) => match PKey::private_key_from_der(&ca_key_der) {
            Ok(k) => k,
            Err(e) => {
                eprintln!("❌ Failed to parse private key with OpenSSL: {}", e);
                return;
            }
        },
    };

    // 5) Build PKCS#12 (PFX). Use a friendly name and a password.
    let friendly_name = "GuardNest Root CA";
    let password = "guardnest321";

    let pkcs12 = match {
        let mut builder = Pkcs12::builder();
        builder.name(friendly_name);
        builder.pkey(&pkey);
        builder.cert(&x509);
        builder.build2(password)
    } {
        Ok(p) => p,
        Err(e) => {
            eprintln!("❌ Failed to build PKCS#12: {}", e);
            return;
        }
    };

    let pfx_der = match pkcs12.to_der() {
        Ok(d) => d,
        Err(e) => {
            eprintln!("❌ Failed to serialize PKCS#12 to DER: {}", e);
            return;
        }
    };

    // 6) Write to C:\\ProgramData\\GuardNest\\certificate.p12
    let mut file = match fs::File::create(&output_path) {
        Ok(f) => f,
        Err(e) => {
            eprintln!("❌ Failed to create {:?}: {}", output_path, e);
            return;
        }
    };

    if let Err(e) = file.write_all(&pfx_der) {
        eprintln!("❌ Failed to write PKCS#12 file: {}", e);
        return;
    }

    println!(
        "✅ Generated CA PKCS#12 at {:?} (friendly name: \"{}\")",
        output_path, friendly_name
    );
}

/// Ensure the GuardNest Root CA is installed in the LocalMachine Root store.
/// - Generates the PFX if missing
/// - Imports to Root via certutil if not present
pub fn ensure_certificate_installed() {
    let pfx_path = Path::new("C:\\ProgramData\\GuardNest\\certificate.p12");

    if !pfx_path.exists() {
        generate_certificate();
    }

    // Validate installed cert: present and within validity window (NotBefore/NotAfter)
    let check_status = Command::new("powershell")
        .args(&[
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-Command",
            r#"$now=Get-Date; $c=Get-ChildItem Cert:\\LocalMachine\\Root | Where-Object { $_.Subject -like '*GuardNest Local CA*' } | Sort-Object NotAfter -Descending | Select-Object -First 1; if ($c -and $c.NotBefore -le $now -and $c.NotAfter -gt $now) { exit 0 } else { exit 1 }"#,
        ])
        .status();

    let is_valid = matches!(check_status, Ok(s) if s.success());

    if !is_valid {
        println!("🔄 Generating and importing a new GuardNest Root CA (existing one missing or invalid)...");
        generate_certificate();

        let import_status = Command::new("certutil")
            .args(&[
                "-f",
                "-p",
                "guardnest321",
                "-importpfx",
                "Root",
                "C:\\ProgramData\\GuardNest\\certificate.p12",
            ])
            .status();

        match import_status {
            Ok(s) if s.success() => println!("✅ GuardNest Root CA installed to Root store"),
            Ok(s) => eprintln!("❌ certutil failed with status: {:?}", s.code()),
            Err(e) => eprintln!("❌ Failed to run certutil: {}", e),
        }
    } else {
        println!("✅ GuardNest Root CA present and valid in Root store");
    }
}
