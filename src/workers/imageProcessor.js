
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
        despill      // Boolean: Remove green spill?
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
                    // Clamp green to the average of red and blue? 
                    // Or just reduce it slightly?
                    // "Screen" despill method usually replaces dominant channel with max of others
                    // data[i+1] = Math.max(r, b); 

                    // Meiko's method from analysis:
                    data[i + 1] = (r + b) / 2;
                }
            }
        }

        data[i + 3] = alpha; // Set Alpha
    }

    // Put data back
    ctx.putImageData(imgData, 0, 0);

    // Return the result as a Blob needed for ObjectURL, or we can use Transferable ImageBitmap if supported
    // For simplicity and compatibility, we'll convert to Blob
    canvas.convertToBlob({ type: 'image/png' }).then(blob => {
        // We send back the Blob data
        // Converting blob to DataURL in main thread might be better to keep worker pure, 
        // but doing it here saves main thread work. 
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            self.postMessage({ id, dataUrl: reader.result });
        };
    });
};
