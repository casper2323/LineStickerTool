
/* eslint-disable no-restricted-globals */
// Web Worker for image processing (Chroma Key / Background Removal)
// 影像處理 Web Worker (綠幕去背)

// We define the worker logic as a string or separate file. 
// In Vite, we can import it as a worker.

self.onmessage = function (e) {
    const {
        imageBitmap, // The cropped sticker image
        id,          // Sticker ID
        targetColor, // Hex color to remove (e.g. #00FF00)
        tolerance,   // Color distance tolerance (0-100)
        smoothness,  // Edge smoothing (0-10,000)
        despill,      // Boolean: Remove green spill?
        edgeErosion  // Integer: Pixels to erode (0-10)
    } = e.data;

    const w = imageBitmap.width;
    const h = imageBitmap.height;

    // Create an OffscreenCanvas
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');

    // Draw image
    ctx.drawImage(imageBitmap, 0, 0);

    // Get pixel data
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Parse target color
    const tr = parseInt(targetColor.slice(1, 3), 16);
    const tg = parseInt(targetColor.slice(3, 5), 16);
    const tb = parseInt(targetColor.slice(5, 7), 16);

    // Calculate threshold
    // Tolerance scale adjustment to match user feel
    const distThreshold = tolerance * 4.42;
    const ramp = Math.max(1, smoothness);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance in RGB space
        const dist = Math.sqrt(
            (r - tr) * (r - tr) +
            (g - tg) * (g - tg) +
            (b - tb) * (b - tb)
        );

        let alpha = 255;

        if (dist < distThreshold) {
            // Inside absolute tolerance -> Transparent
            alpha = 0;
        } else if (dist < distThreshold + ramp) {
            // In the ramp area -> Semi-transparent (Antialiasing/Smoothing)
            alpha = ((dist - distThreshold) / ramp) * 255;
        }

        // Despill: Remove green reflection on edges if alpha > 0
        if (despill && alpha > 0) {
            // Simple Green Despill: If Green is dominant, reduce it
            // This is a naive implementation optimized for pure green screens
            if (targetColor.toLowerCase() === '#00ff00') {
                if (g > r && g > b) {
                    // Meiko's method from analysis:
                    data[i + 1] = (r + b) / 2;
                }
            }
        }

        data[i + 3] = alpha; // Set Alpha
    }

    // --- Edge Erosion (Expand Transparency) ---
    // User Request: "Search for outermost edge of transparent area, expand, then delete pixels"
    // Logic: Identify "Transparent" pixels, then DILATE that region.

    if (edgeErosion > 0) {
        const radius = edgeErosion;
        const w = imageBitmap.width;
        const h = imageBitmap.height;

        // 1. Create Mask of currently Transparent pixels
        // We treat anything with Alpha < 128 as "Transparent enough to start eroding from"
        // This ensures we catch the edge of the antialiased cut.
        const isTransparentMask = new Uint8Array(w * h);

        for (let i = 0; i < w * h; i++) {
            if (data[i * 4 + 3] < 128) {
                isTransparentMask[i] = 1;
            }
        }

        // 2. Dilate the Transparency Mask (Expand the Holes)
        const dilatedMask = new Uint8Array(w * h);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = y * w + x;

                // If already transparent, keep it
                if (isTransparentMask[idx] === 1) {
                    dilatedMask[idx] = 1;
                    continue;
                }

                // If not transparent, check if a transparent pixel is nearby (within radius)
                // If yes, this pixel gets eaten.
                let isNearHole = false;
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;
                        if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                            if (isTransparentMask[ny * w + nx] === 1) {
                                isNearHole = true;
                                break;
                            }
                        }
                    }
                    if (isNearHole) break;
                }

                if (isNearHole) {
                    dilatedMask[idx] = 1;
                }
            }
        }

        // 3. Apply Mask - Hard Cut
        for (let i = 0; i < w * h; i++) {
            if (dilatedMask[i] === 1) {
                data[i * 4 + 3] = 0; // Forcefully clear
            }
        }
    }

    // --- Post-Erosion Smoothing (Anti-aliasing) ---
    // Erosion often causes aliasing (jagged edges). We apply a small blur to the alpha channel to fix this.
    // Only run if erosion was applied, or if standard smoothness is high?
    // Let's run it specifically if edgeErosion > 0 to counter the aliasing it introduces.
    if (edgeErosion > 0) {
        // We need another copy of the alpha channel because we can't read/write to the same buffer for blur
        const erodedAlpha = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) {
            erodedAlpha[i] = data[i * 4 + 3];
        }

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const idx = (y * w + x) * 4;

                // 3x3 Box Blur
                // Optimization: Unroll loop
                let sum = 0;
                sum += erodedAlpha[(y - 1) * w + (x - 1)];
                sum += erodedAlpha[(y - 1) * w + x];
                sum += erodedAlpha[(y - 1) * w + (x + 1)];
                sum += erodedAlpha[y * w + (x - 1)];
                sum += erodedAlpha[y * w + x];
                sum += erodedAlpha[y * w + (x + 1)];
                sum += erodedAlpha[(y + 1) * w + (x - 1)];
                sum += erodedAlpha[(y + 1) * w + x];
                sum += erodedAlpha[(y + 1) * w + (x + 1)];

                const avg = sum / 9;

                // Only touch pixels that are not fully transparent or fully opaque?
                // Or just apply everywhere? Applying everywhere is safer for AA.
                data[idx + 3] = avg;
            }
        }
    }

    // Put data back
    ctx.putImageData(imgData, 0, 0);

    // Return the result as a Blob needed for ObjectURL
    canvas.convertToBlob({ type: 'image/png' }).then(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            self.postMessage({ id, dataUrl: reader.result });
        };
    });
};
