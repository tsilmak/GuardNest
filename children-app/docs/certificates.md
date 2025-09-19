### Certificates: Auto-generation, Installation and Testing

This app can perform HTTPS MITM. On startup it ensures a local Root CA exists and is valid; if not, it regenerates and imports a PFX into the Windows Trusted Root store.

- Location: `C:\\ProgramData\\GuardNest\\certificate.p12`
- Friendly name: GuardNest Root CA
- Password: `guardnest321`

#### How it works

- On app setup, `ensure_certificate_installed()`:
  - Generates the PFX if missing (via rcgen + OpenSSL PKCS#12).
  - Checks `Cert:\\LocalMachine\\Root` for a cert with subject `GuardNest Local CA` and verifies date validity.
  - If missing/expired/not yet valid, imports the PFX with `certutil -importpfx Root`.

#### Requirements

- Run the app as Administrator (required for LocalMachine Root import).

#### Verify installation

PowerShell:

```powershell
# PFX exists
Test-Path 'C:\\ProgramData\\GuardNest\\certificate.p12'
certutil -p "guardnest321" -dump 'C:\\ProgramData\\GuardNest\\certificate.p12'

# Present and valid in LocalMachine Root
Get-ChildItem Cert:\\LocalMachine\\Root |
  Where-Object { $_.Subject -like '*GuardNest Local CA*' } |
  Format-List Subject, NotBefore, NotAfter, Thumbprint

# Or
certutil -store Root "GuardNest"
```

#### Force regeneration (test)

```powershell
certutil -delstore Root "GuardNest Root CA"
Remove-Item -Force 'C:\\ProgramData\\GuardNest\\certificate.p12'
# Run the app as Administrator; it will regenerate and import automatically
```

#### References

- rcgen (certificate generation): https://docs.rs/rcgen/latest/rcgen/
