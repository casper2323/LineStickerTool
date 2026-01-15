# Implementation Plan v4: Simplified Line Dynamic Sticker Tool / v4 簡易版實作計畫

## Goal / 目標
Create a streamlined tool specifically for generating LINE Dynamic Stickers (APNG) using AI-generated **4x3 grid images**.
建立一個簡化的工具，專門用於使用 AI 生成的 **4x3 格狀圖片** 來製作 LINE 動態貼圖 (APNG)。

## Core Features / 核心功能

### 1. Tab: Dynamic Sticker Prompt / 動態貼圖 Prompt
*   **Function**: Generate a prompt for external AI (e.g., Midjourney/DALL-E) to create the source grid image.
*   **Input**:
    *   **Sticker Picker**: Select a reference emotion/sticker.
    *   **Style**: "Sticker Style" with white outline.
*   **Output Prompt Specification**:
    *   **Layout**: 4x3 Grid (Total 12 frames).
    *   **Dimensions**: Total 1280x810 px (Sub-images ~320x270 px).
    *   **Background**: Pure Green (#00FF00) for easy chroma keying.
    *   **Consistency**: Maintain character appearance across frames.
    *   **Padding**: ~0.2cm padding between frames to prevent overlapping.

### 2. Tab: Make APNG / 製作 APNG
*   **Upload Area**: 
    *   Accepts the **4x3 Grid Image** generated above.
*   **Auto Split (Core Logic)**:
    *   Automatically slices the 1280x810 image into **12 frames** (320x270 each).
*   **Workspace (Editor)**:
    *   **Sequence Editor**: Arrange the 12 frames (or subset, min 5, max 20).
    *   **Animation Settings**:
        *   **Loop Count**: 1-4 times.
        *   **Max Duration**: 4 seconds.
    *   **Preview**: Real-time playback of the APNG.
*   **Collections (Output Zone)**:
    *   **Sticker Collection**: List of created APNGs (320x270 px).
    *   **Other Assets**:
        *   **Main Image**: 240x240 px (Auto-resized from APNG frame).
        *   **Tab Image**: 96x74 px (Auto-resized from APNG frame).
    *   **Actions**: Clear All, Download All.

## UML Sequence Diagram / 循序圖

```mermaid
sequenceDiagram
    participant User as User<br/>使用者
    participant Prompt as Prompt Tab<br/>Prompt 頁籤
    participant Maker as Make APNG Tab<br/>製作 APNG 頁籤
    participant Canvas as Canvas Slicer<br/>切割器
    participant Encoder as APNG Encoder<br/>編碼器 (UPNG.js)

    Note over User, Prompt: 1. Generate Material / 生成素材
    User->>Prompt: Copy Prompt (Green Screen, 4x3 Grid)<br/>複製 Prompt (綠幕, 4x3)
    Prompt-->>User: [External AI Gen] -> 1280x810 Grid Image<br/>[外部 AI 生成] -> 格狀圖

    Note over User, Maker: 2. Import & Slice / 匯入與切割
    User->>Maker: Upload Grid Image<br/>上傳格狀圖
    Maker->>Canvas: Slice 1280x810 to 12 Frames<br/>切割成 12 張影格
    Canvas-->>Maker: Return [Frame 1..12]<br/>回傳 12 張影格

    Note over User, Maker: 3. Configure & Preview / 設定與預覽
    User->>Maker: Set Speed, Loops (Max 4s)<br/>設定速度、循環 (最大 4秒)
    Maker->>Maker: Preview Animation<br/>預覽動畫

    Note over User, Encoder: 4. Encode & Export / 編碼與匯出
    User->>Maker: Click "Add to Collection"<br/>點擊「加入收藏」
    Maker->>Encoder: Encode Frames to APNG<br/>將影格編碼為 APNG
    Encoder-->>Maker: Return APNG Blob<br/>回傳 APNG
    Maker->>Maker: Generate Resized Assets (Main, Tab)<br/>生成尺寸變體 (主圖, 標籤圖)
    Maker-->>User: Display in Collection<br/>顯示於收藏區
```

## Step-by-Step Plan / 實作步驟

### Phase 4.1: Infrastructure (Same) / 基礎設施
1.  Install `upng-js`.
2.  Update `task.md`.

### Phase 4.2: Dynamic Prompt Tab / Prompt 頁籤
1.  Create `DynamicPromptGenerator.jsx`.
2.  Implement logic to construct the specific "4x3 Green Screen" prompt string.

### Phase 4.3: APNG Maker Core / APNG 製作核心
1.  Create `APNGMaker.jsx`.
2.  Reuse `CanvasUtils` to slice 4x3 inputs (ensure 1280x810 support).
3.  Implement `APNGBuilder` using `UPNG.js` to combine sliced frames.

### Phase 4.4: Collection & Export / 收藏與匯出
1.  State management for "Sticker Collection".
2.  Logic to auto-resize generic frames to "Main (240px)" and "Tab (96px)" sizes.
3.  Implement "Download" (Individual and Zip).
