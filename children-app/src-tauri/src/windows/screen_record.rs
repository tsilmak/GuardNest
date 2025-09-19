use chrono::Local;
use image::ImageBuffer;
use image::Rgba;
use std::path::PathBuf;
use std::time::Duration;
use windows::core::Interface;
use windows::core::HRESULT;
use windows::Win32::Foundation::HMODULE;
use windows::Win32::Foundation::RECT;
use windows::Win32::Graphics::Direct3D::D3D_DRIVER_TYPE_HARDWARE;
use windows::Win32::Graphics::Direct3D::{
    D3D_FEATURE_LEVEL_10_0, D3D_FEATURE_LEVEL_10_1, D3D_FEATURE_LEVEL_11_0, D3D_FEATURE_LEVEL_11_1,
    D3D_FEATURE_LEVEL_9_3,
};
use windows::Win32::Graphics::Direct3D11::ID3D11Resource;
use windows::Win32::Graphics::Direct3D11::ID3D11Texture2D;
use windows::Win32::Graphics::Direct3D11::D3D11_CPU_ACCESS_READ;
use windows::Win32::Graphics::Direct3D11::D3D11_MAPPED_SUBRESOURCE;
use windows::Win32::Graphics::Direct3D11::D3D11_MAP_READ;
use windows::Win32::Graphics::Direct3D11::D3D11_TEXTURE2D_DESC;
use windows::Win32::Graphics::Direct3D11::{
    D3D11CreateDevice, ID3D11Device, ID3D11DeviceContext, D3D11_CREATE_DEVICE_FLAG,
    D3D11_SDK_VERSION,
};
use windows::Win32::Graphics::Dxgi::IDXGIResource;
use windows::Win32::Graphics::Dxgi::DXGI_ERROR_ACCESS_LOST;
use windows::Win32::Graphics::Dxgi::DXGI_ERROR_WAIT_TIMEOUT;
use windows::Win32::Graphics::Dxgi::DXGI_OUTDUPL_FRAME_INFO;
use windows::Win32::Graphics::Dxgi::DXGI_OUTDUPL_MOVE_RECT;
use windows::Win32::Graphics::Dxgi::{
    IDXGIAdapter, IDXGIDevice, IDXGIOutput, IDXGIOutput1, IDXGIOutputDuplication,
    DXGI_ERROR_NOT_FOUND,
};

// Removed unused FrameData; metadata is handled inline in the loop

// 1. Initialize Direct3D Device
// This function gets a handle to the graphics card (GPU) and creates a core
// rendering device, which is the foundational step for our desktop cloning API.
fn initialize_direct3d() -> Result<(ID3D11Device, ID3D11DeviceContext), windows::core::Error> {
    let mut d3d_device: Option<ID3D11Device> = None;
    let mut d3d_device_context: Option<ID3D11DeviceContext> = None;

    let feature_levels = [
        D3D_FEATURE_LEVEL_11_1,
        D3D_FEATURE_LEVEL_11_0,
        D3D_FEATURE_LEVEL_10_1,
        D3D_FEATURE_LEVEL_10_0,
        D3D_FEATURE_LEVEL_9_3,
    ];

    unsafe {
        let device_creation_result = D3D11CreateDevice(
            None,
            D3D_DRIVER_TYPE_HARDWARE,
            HMODULE::default(),
            D3D11_CREATE_DEVICE_FLAG::default(),
            Some(&feature_levels),
            D3D11_SDK_VERSION,
            Some(&mut d3d_device as *mut _),
            None,
            Some(&mut d3d_device_context as *mut _),
        );

        match device_creation_result {
            Ok(_) => {
                println!("Hardware device created successfully!");
                let device = d3d_device
                    .ok_or_else(|| windows::core::Error::new(HRESULT(0), "ID3D11DEVICE NULL"))?;
                let device_context = d3d_device_context.ok_or_else(|| {
                    windows::core::Error::new(HRESULT(0), "ID3D11DEVICECONTEXT NULL")
                })?;
                Ok((device, device_context))
            }
            Err(e) => {
                println!("Hardware device creation failed with HRESULT: {:?}", e);
                // TODO: Implement software driver fallback if needed, or simply return the error.
                eprintln!(
                    "Attempting to use the software driver as a fallback is not yet implemented."
                );
                Err(e)
            }
        }
    }
}

// 2. Get DXGI Device from D3D11 Device
// This function gets the DXGI interface from our D3D device, which
// is necessary to interact with the display hardware and capture the desktop.
// It now takes the already initialized ID3D11Device as an argument.
fn get_dxgi_device(d3d_device: &ID3D11Device) -> Result<IDXGIDevice, windows::core::Error> {
    let dxgi_device = d3d_device.cast::<IDXGIDevice>()?;
    println!("DXGI device created: {:?}", dxgi_device);
    Ok(dxgi_device)
}

// 3. Get DXGI Adapter
// We get the graphics card's adapter to access the display outputs (monitors).
// This is necessary to find the monitor we want to capture.
// It now takes the already obtained IDXGIDevice as an argument.
fn get_dxgi_adapter(dxgi_device: &IDXGIDevice) -> Result<IDXGIAdapter, windows::core::Error> {
    let dxgi_adapter = unsafe { dxgi_device.GetAdapter()? };
    println!("DXGI adapter created: {:?}", dxgi_adapter);
    Ok(dxgi_adapter)
}

// 4. Get DXGI Output (Monitor)
// This function enumerates all available display outputs (monitors) connected
// to the graphics adapter, allowing us to select a specific screen to capture.
// It now takes the already obtained IDXGIAdapter as an argument.
fn get_dxgi_outputs(dxgi_adapter: &IDXGIAdapter) -> Result<Vec<IDXGIOutput>, windows::core::Error> {
    let mut outputs: Vec<IDXGIOutput> = Vec::new();
    let mut i = 0;

    loop {
        match unsafe { dxgi_adapter.EnumOutputs(i) } {
            Ok(output) => {
                println!("Found DXGI Output {}: {:?}", i, output);
                outputs.push(output);
                i += 1;
            }
            Err(e) if e.code() == DXGI_ERROR_NOT_FOUND.into() => {
                println!("No more DXGI outputs found after index {}.", i);
                break;
            }
            Err(e) => {
                eprintln!("Error enumerating DXGI outputs at index {}: {:?}", i, e);
                return Err(e);
            }
        }
    }

    if outputs.is_empty() {
        return Err(windows::core::Error::new(
            HRESULT(0),
            "No DXGI outputs found",
        ));
    }
    Ok(outputs)
}

// 5. Create Duplication Interface
// This function creates the desktop duplication interface for a specific monitor.
// It requires an ID3D11Device to function.
fn create_duplication_interface(
    d3d_device: &ID3D11Device, // Takes the D3D device as an argument
) -> Result<IDXGIOutputDuplication, windows::core::Error> {
    // Pass the D3D device to get_dxgi_device
    let dxgi_device = get_dxgi_device(d3d_device)?;
    // Pass the DXGI device to get_dxgi_adapter
    let dxgi_adapter = get_dxgi_adapter(&dxgi_device)?;
    // Pass the DXGI adapter to get_dxgi_outputs
    let dxgi_outputs = get_dxgi_outputs(&dxgi_adapter)?;

    if dxgi_outputs.is_empty() {
        return Err(windows::core::Error::new(
            HRESULT(0),
            "No display outputs found",
        ));
    }

    // For now, let's just try to duplicate the first monitor found.
    // In a real app, you'd add selection logic.
    let selected_output_base = &dxgi_outputs[0];
    println!(
        "Selected monitor 0 (base IDXGIOutput): {:?}",
        selected_output_base
    );

    // Attempt to cast the base IDXGIOutput to IDXGIOutput1, as DuplicateOutput lives on IDXGIOutput1.
    let output1: IDXGIOutput1 = selected_output_base.cast::<IDXGIOutput1>().map_err(|e| {
        eprintln!("Error casting IDXGIOutput to IDXGIOutput1: {:?}", e);
        windows::core::Error::new(
            HRESULT(0),
            "Selected monitor does not support IDXGIOutput1, cannot create duplication interface.",
        )
    })?;

    let duplication_interface = unsafe { output1.DuplicateOutput(d3d_device)? };

    println!(
        "DXGI Output Duplication Interface created: {:?}",
        duplication_interface
    );

    Ok(duplication_interface)
}

// Updated save_frame function to save the texture as a PNG
pub fn save_frame(
    device: &ID3D11Device,
    context: &ID3D11DeviceContext,
    frame: &ID3D11Texture2D,
    frame_number: u32,
    output_folder: &PathBuf,
) -> Result<(), String> {
    unsafe {
        // 1. Get texture description
        let mut desc = D3D11_TEXTURE2D_DESC::default();
        frame.GetDesc(&mut desc);

        // 2. Create a staging texture with CPU read access
        let staging_desc = D3D11_TEXTURE2D_DESC {
            Width: desc.Width,
            Height: desc.Height,
            MipLevels: 1,
            ArraySize: 1,
            Format: desc.Format,
            SampleDesc: desc.SampleDesc,
            Usage: windows::Win32::Graphics::Direct3D11::D3D11_USAGE_STAGING,
            BindFlags: 0,
            CPUAccessFlags: D3D11_CPU_ACCESS_READ.0 as u32,
            MiscFlags: 0,
        };
        // Create texture using an output parameter
        let mut staging_texture_opt: Option<ID3D11Texture2D> = None;
        device
            .CreateTexture2D(&staging_desc, None, Some(&mut staging_texture_opt))
            .map_err(|e| format!("Failed to create staging texture: {}", e))?;

        // Now, unwrap the Option to get the actual texture
        let staging_texture = staging_texture_opt
            .ok_or_else(|| "Staging texture is None even after successful creation".to_string())?;

        // Cast both textures to ID3D11Resource for the CopyResource call
        let dest_resource: ID3D11Resource = staging_texture
            .cast()
            .map_err(|e| format!("Failed to cast staging texture to resource: {}", e))?;
        let src_resource: ID3D11Resource = frame
            .cast()
            .map_err(|e| format!("Failed to cast frame to resource: {}", e))?;

        // 3. Copy the frame to the staging texture
        context.CopyResource(&dest_resource, &src_resource);

        // 4. Map the staging texture to access its data
        let mut mapped_resource = D3D11_MAPPED_SUBRESOURCE::default();
        context
            .Map(
                &staging_texture,
                0,
                D3D11_MAP_READ,
                0,
                Some(&mut mapped_resource),
            )
            .map_err(|e| format!("Failed to map staging texture: {}", e))?;

        // 5. Get a slice to the pixel data
        let width = desc.Width as usize;
        let height = desc.Height as usize;
        let row_pitch = mapped_resource.RowPitch as usize;
        let data_ptr = mapped_resource.pData as *const u8;
        let data_slice = std::slice::from_raw_parts(data_ptr, height * row_pitch);

        // 6. Create an image buffer and save as PNG
        // The format is BGRA, so we need to handle this. The `image` crate expects RGBA.
        // We can create a buffer and swap the channels manually or find a more direct way.
        // For simplicity, we'll copy and swap.
        let mut image_buffer = ImageBuffer::<Rgba<u8>, Vec<u8>>::new(width as u32, height as u32);
        for y in 0..height {
            let row_start = y * row_pitch;
            for x in 0..width {
                let pixel_start = row_start + x * 4; // 4 bytes per pixel (B, G, R, A)
                let b = data_slice[pixel_start];
                let g = data_slice[pixel_start + 1];
                let r = data_slice[pixel_start + 2];
                let a = data_slice[pixel_start + 3];
                image_buffer.put_pixel(x as u32, y as u32, Rgba([r, g, b, a]));
            }
        }

        // 7. Unmap the texture
        context.Unmap(&staging_texture, 0);

        // 8. Save the file
        let timestamp = Local::now().format("%Y%m%d_%H%M%S");
        let file_path = output_folder.join(format!("frame_{}_{:04}.png", timestamp, frame_number));
        image_buffer
            .save(&file_path)
            .map_err(|e| format!("Failed to save image to {:?}: {}", file_path, e))?;

        println!(
            "Successfully saved frame {} to {:?}",
            frame_number, file_path
        );
    }
    Ok(())
}

#[tauri::command]
pub fn start_screen_record() -> Result<(), String> {
    println!("Starting screen recording worker thread...");

    std::thread::spawn(move || {
        // Outer loop: ensure we re-initialize on device/access loss
        loop {
            // Initialize Direct3D device
            let (d3d_device, d3d_context) = match initialize_direct3d() {
                Ok(v) => v,
                Err(e) => {
                    eprintln!("Failed to initialize Direct3D: {}. Retrying in 1s...", e);
                    std::thread::sleep(Duration::from_millis(1000));
                    continue;
                }
            };

            // Create duplication interface
            let duplication_interface = match create_duplication_interface(&d3d_device) {
                Ok(v) => v,
                Err(e) => {
                    eprintln!(
                        "Failed to create duplication interface: {}. Retrying in 1s...",
                        e
                    );
                    std::thread::sleep(Duration::from_millis(1000));
                    continue;
                }
            };

            println!("Desktop duplication setup complete. Ready to acquire frames.");

            // This variable will hold the processed image from the previous frame.
            let mut _acquired_desktop_image: Option<ID3D11Texture2D> = None;
            let mut metadata_size = 0usize;
            let mut metadata_buffer: Option<Vec<u8>> = None;
            let mut frame_counter = 0u32;
            let output_folder = PathBuf::from("screenshots");

            // Create the output directory if it doesn't exist
            if let Err(e) = std::fs::create_dir_all(&output_folder) {
                eprintln!(
                    "Failed to create output directory {:?}: {}",
                    output_folder, e
                );
            } else {
                println!("Output directory ready: {:?}", output_folder);
            }

            // Inner loop: continuously acquire frames until access is lost
            loop {
                let mut desktop_resource: Option<IDXGIResource> = None;
                let mut frame_info = DXGI_OUTDUPL_FRAME_INFO::default();

                let result = unsafe {
                    duplication_interface.AcquireNextFrame(
                        500,
                        &mut frame_info,
                        &mut desktop_resource,
                    )
                };

                match result {
                    Ok(_) => {
                        // We acquired a frame; ensure we always release it before next iteration
                        // Clear previous texture to release ref
                        _acquired_desktop_image = None;

                        // Safeguard against unexpected None
                        let resource = match desktop_resource.take() {
                            Some(r) => r,
                            None => {
                                eprintln!(
                                    "AcquireNextFrame succeeded but desktop_resource was None; releasing frame"
                                );
                                unsafe {
                                    let _ = duplication_interface.ReleaseFrame();
                                }
                                continue;
                            }
                        };

                        // Cast to ID3D11Texture2D
                        let new_texture: ID3D11Texture2D = match resource.cast() {
                            Ok(tex) => tex,
                            Err(e) => {
                                eprintln!(
                                    "Failed to cast resource to ID3D11Texture2D: {}. Releasing frame.",
                                    e
                                );
                                unsafe {
                                    let _ = duplication_interface.ReleaseFrame();
                                }
                                continue;
                            }
                        };

                        _acquired_desktop_image = Some(new_texture.clone());
                        println!("Frame captured: {:?}", frame_info); // lightweight log

                        // Save the frame
                        frame_counter += 1;
                        // Save every frame (remove the LastPresentTime condition for testing)
                        if let Err(e) = save_frame(
                            &d3d_device,
                            &d3d_context,
                            &new_texture,
                            frame_counter,
                            &output_folder,
                        ) {
                            eprintln!("Failed to save frame {}: {}", frame_counter, e);
                        }

                        // Try to fetch metadata, but never crash if it fails
                        if frame_info.TotalMetadataBufferSize > 0 {
                            let total = frame_info.TotalMetadataBufferSize as usize;
                            if total > metadata_size {
                                metadata_buffer = Some(vec![0u8; total]);
                                metadata_size = total;
                            }

                            if let Some(buf) = &mut metadata_buffer {
                                let mut move_size = frame_info.TotalMetadataBufferSize;
                                let move_result = unsafe {
                                    duplication_interface.GetFrameMoveRects(
                                        move_size,
                                        buf.as_mut_ptr() as *mut DXGI_OUTDUPL_MOVE_RECT,
                                        &mut move_size,
                                    )
                                };
                                if move_result.is_err() {
                                    eprintln!(
                                        "GetFrameMoveRects failed; continuing without metadata"
                                    );
                                }

                                let dirty_offset = move_size as usize;
                                if dirty_offset < buf.len() {
                                    let mut dirty_size =
                                        frame_info.TotalMetadataBufferSize - move_size;
                                    let dirty_result = unsafe {
                                        let dirty_ptr =
                                            buf.as_mut_ptr().add(dirty_offset) as *mut RECT;
                                        duplication_interface.GetFrameDirtyRects(
                                            dirty_size,
                                            dirty_ptr,
                                            &mut dirty_size,
                                        )
                                    };
                                    if dirty_result.is_err() {
                                        eprintln!("GetFrameDirtyRects failed; continuing without metadata");
                                    }
                                }
                            }
                        }

                        unsafe {
                            if let Err(e) = duplication_interface.ReleaseFrame() {
                                eprintln!("Failed to release frame: {}", e);
                            }
                        }

                        // Target ~60 FPS max
                        std::thread::sleep(Duration::from_millis(16));
                    }
                    Err(e) => {
                        let code = e.code();
                        if code == DXGI_ERROR_WAIT_TIMEOUT {
                            // No new frame within timeout; try again
                            continue;
                        } else if code == DXGI_ERROR_ACCESS_LOST {
                            eprintln!("DXGI access lost; reinitializing duplication interface...");
                            // Break inner loop to reinitialize device/duplication
                            break;
                        } else {
                            eprintln!(
                                "AcquireNextFrame failed with error: {} (code: {:?}). Sleeping 250ms and retrying...",
                                e, code
                            );
                            std::thread::sleep(Duration::from_millis(250));
                            continue;
                        }
                    }
                }
            }
        }
    });

    Ok(())
}
