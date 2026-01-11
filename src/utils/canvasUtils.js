
// Utility to slice a 4x3 grid image into 12 individual pieces
// 用於將 4x3 格狀圖片切割成 12 張獨立圖片的工具

export const sliceImage = (imageElement, options = {}) => {
    return new Promise((resolve) => {
        // Default options
        const {
            marginTop = 0,    // Top offset (ignoring header/padding)
            marginLeft = 0,   // Left offset
            gap = 0,          // Gap between stickers
        } = options;

        const cols = 4;
        const rows = 3;

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
