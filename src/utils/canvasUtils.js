import UPNG from 'upng-js';

// Utility to slice a 4x3 grid image into 12 individual pieces
// 用於將 4x3 格狀圖片切割成 12 張獨立圖片的工具

export const sliceImage = (imageElement, options = {}) => {
    return new Promise((resolve) => {
        // Default options
        const {
            marginTop = 0,    // Top offset (ignoring header/padding)
            marginLeft = 0,   // Left offset
            gap = 0,          // Gap between stickers
            cols = 4,         // Columns
            rows = 3          // Rows
        } = options;

        // Calculate usable area
        const totalW = imageElement.width;
        const totalH = imageElement.height;

        // We assume the gap is uniform. 
        // Piece width calculation needs to account for gaps.
        // Total Width = (PieceW * 4) + (Gap * 3) + (MarginLeft * 2?) - lets keep it simple first.
        // Let's assume the user just wants to "shrink" the selection box or shift it.
        // Actually, Midjourney grids are usually evenly spaced.
        // Let's try to define the "Cell Size" based on the remaining space?
        // Or simpler: Just strict math:
        // CellW = (TotalW - MarginLeft*2 - Gap*(cols-1)) / cols

        // But simply shifting the start point (Offset) and potentially scaling is often what's needed for screenshots.
        // Let's implement a robust "Offset + Size" logic if possible, or just "Offset + Gap".

        // User complaint: "Middle row has parts of the image below".
        // This implies the Row Height is too large, or vertical gap is not accounted for.

        // Proposed Logic:
        // Determine the "Grid Region" first? 
        // No, let's just stick to "Cell Width/Height" and "Gap".
        // If we subtract the gaps from the total size, we get the total "content" size.

        // Let's rely on standard MJ 4x3.
        // We will apply Margin Top/Left to 'shift' the grid.
        // We will apply 'Gap' to 'shrink' the capture area of each cell (creating a margin around the cutout).

        const startX = marginLeft;
        const startY = marginTop;

        // Effective total width/height for the grid
        const effectiveW = totalW - (marginLeft * 2); // Assume symmetric margin
        const effectiveH = totalH - (marginTop * 2);

        const rawPieceW = effectiveW / cols;
        const rawPieceH = effectiveH / rows;

        // usagePiecW is the actual cut size (subtracting gap)
        const pieceW = rawPieceW - gap;
        const pieceH = rawPieceH - gap;

        const pieces = [];

        // Create a temporary canvas to draw the full image
        const canvas = document.createElement('canvas');
        canvas.width = totalW;
        canvas.height = totalH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(imageElement, 0, 0);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const pCanvas = document.createElement('canvas');
                pCanvas.width = pieceW;
                pCanvas.height = pieceH;
                const pCtx = pCanvas.getContext('2d');

                // Calculate source position
                // Center the cut within the "cell"
                const srcX = startX + (c * rawPieceW) + (gap / 2);
                const srcY = startY + (r * rawPieceH) + (gap / 2);

                // Draw the specific slice
                pCtx.drawImage(
                    canvas,
                    srcX, srcY, pieceW, pieceH, // Source
                    0, 0, pieceW, pieceH // Destination
                );

                // Convert to data URL for preview
                const dataUrl = pCanvas.toDataURL('image/png');

                pieces.push({
                    id: r * cols + c + 1, // ID from 1 to 12
                    dataUrl: dataUrl,
                    originalCanvas: pCanvas, // Keep raw canvas for further processing (BG removal)
                    width: pieceW,
                    height: pieceH
                });
            }
        }

        resolve(pieces);
    });
};

export const resizeImage = (dataUrl, width, height) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Maintain aspect ratio or stretch?
            // Requirement usually implies fitting into the box.
            // But Line stickers usually require specific dimensions.
            // Let's use "contain" fit to preserve aspect ratio, centering it.

            // Calculate scale
            const scale = Math.min(width / img.width, height / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (width - w) / 2;
            const y = (height - h) / 2;

            ctx.drawImage(img, x, y, w, h);
            resolve(canvas.toDataURL('image/png'));
        };
        img.src = dataUrl;
    });
};

export const generateApng = async (frames) => {
    // frames: Array of { dataUrl, duration }
    if (!frames || frames.length === 0) return null;

    // Helper to load image and get buffer
    const processFrame = (frame) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous"; // Safe-guard
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            resolve({
                buffer: imageData.data.buffer,
                width: img.width,
                height: img.height,
                duration: frame.duration || 200
            });
        };
        img.onerror = reject;
        img.src = frame.dataUrl;
    });

    try {
        const results = await Promise.all(frames.map(processFrame));
        if (results.length === 0) return null;

        // Use dimensions of the first frame
        const width = results[0].width;
        const height = results[0].height;

        const buffers = results.map(r => r.buffer);
        const delays = results.map(r => r.duration);

        // Encode to APNG
        // UPNG.encode(imgs, w, h, cnum, dels)
        // cnum = 0 (full color)
        const apngBuffer = UPNG.encode(buffers, width, height, 0, delays);

        // PATCH: Set num_plays to 1 (stops after one cycle of frames)
        // We've already duplicated frames for the loop count, so we interpret the file as a single "play".

        const bytes = new Uint8Array(apngBuffer);
        for (let i = 0; i < bytes.length - 8; i++) {
            // Find 'acTL' signature: 0x61, 0x63, 0x54, 0x4C
            if (bytes[i] === 0x61 && bytes[i + 1] === 0x63 && bytes[i + 2] === 0x54 && bytes[i + 3] === 0x4C) {
                // acTL structure: [Length: 4][acTL: 4][num_frames: 4][num_plays: 4][CRC: 4]
                // 'i' points to 'a' in acTL.
                // num_plays is at i + 4 (num_frames) + 4 = i + 8.

                // Set num_plays to 1 (Big Endian 0x00000001)
                const playOffset = i + 8;
                bytes[playOffset] = 0;
                bytes[playOffset + 1] = 0;
                bytes[playOffset + 2] = 0;
                bytes[playOffset + 3] = 1;

                // Recompute CRC for the chunk (Type + Data)
                // Chunk data length is 8 bytes (frames + plays)
                // Type is 4 bytes. Total 12 bytes to CRC.
                // Start at i (Type start). Length 12.

                const crcStart = i;
                const crcLen = 12; // 4 (acTL) + 4 (frames) + 4 (plays)

                const crc = calcCRC32(bytes.subarray(crcStart, crcStart + crcLen));

                // Write CRC at end of chunk (i + 12)
                const crcOffset = i + 12;
                bytes[crcOffset] = (crc >>> 24) & 0xFF;
                bytes[crcOffset + 1] = (crc >>> 16) & 0xFF;
                bytes[crcOffset + 2] = (crc >>> 8) & 0xFF;
                bytes[crcOffset + 3] = crc & 0xFF;

                break; // Found and patched
            }
        }

        const blob = new Blob([apngBuffer], { type: 'image/png' });
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error("APNG Generation Failed:", e);
        return null;
    }
};

// Simple CRC32 implementation for PNG patching
const calcCRC32 = (buffer) => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c;
    }

    let crc = -1; // 0xFFFFFFFF
    for (let i = 0; i < buffer.length; i++) {
        crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xFF];
    }
    return (crc ^ -1) >>> 0;
};
