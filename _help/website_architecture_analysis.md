# 網站架構分析報告 (Website Architecture Analysis)

## 目標網站 (Target Website)
[LINE 貼圖自動化助手 (LINE Sticker Automation Helper)](https://meikochang.github.io/line-sticker-factory/)

該網站是一個純前端的單頁應用程式 (Single Page Application, SPA)，主要的技術架構如下：
This website is a pure front-end Single Page Application (SPA). The main technical architecture is as follows:

### 1. 核心技術棧 (Core Tech Stack)
*   **前端框架 (Frontend Framework)**: React 18 (使用 CDN 引入，非編譯式專案 / Imported via CDN, not a compiled project).
*   **編譯器 (Compiler)**: Babel Standalone (在瀏覽器端即時編譯 JSX / Compiles JSX in the browser in real-time).
*   **樣式庫 (Styling)**: Tailwind CSS (CDN).
*   **輔助函式庫 (Helper Libraries)**:
    *   `JSZip`: 用於打包處理好的貼圖並下載 (Used for zipping processed stickers for download).
    *   `FileSaver.js`: 用於觸發檔案下載 (Used to trigger file downloads).
*   **Hosting**: GitHub Pages (靜態網頁託管 / Static site hosting).

### 2. 運作邏輯 (Core Logic)
該應用程式完全在**使用者的瀏覽器 (Client-side)** 運行，沒有後端伺服器參與圖片處理，保護了使用者隱私並節省伺服器成本。
The application runs entirely in the **user's browser (Client-side)**. No backend server is involved in image processing, which protects user privacy and saves server costs.

*   **Prompt 生成器 (Prompt Generator)**:
    *   內建多種預設情境 (日常、打招呼、節日等) 與風格 (Q版、寫實、3D等)。
    *   透過 JavaScript 動態組裝適合 AI 繪圖工具 (如 Midjourney) 的 Prompt。
    *   強制要求生成 "4x3 格" 且 "綠幕背景" 的圖片。
    *   Includes various built-in scenarios (daily, greeting, holidays, etc.) and styles (Q-version, realistic, 3D, etc.).
    *   Dynamically assembles Prompts suitable for AI drawing tools (like Midjourney) via JavaScript.
    *   Enforces the generation of "4x3 grid" images with a "green screen background".

*   **圖片切片 (Image Slicing)**:
    *   使用 HTML5 Canvas API 將上傳的 4x3 大圖裁切成 12 張獨立的小圖。
    *   Uses the HTML5 Canvas API to slice the uploaded 4x3 large image into 12 separate small images.

*   **背景移除 (Background Removal)**:
    *   **Web Workers**: 為了避免圖片處理時網頁卡頓，開發者使用了 Web Worker (`workerScript`) 在背景執行緒處理像素數據。
        *   **Web Workers**: To prevent the web page from freezing during image processing, the developer used Web Workers (`workerScript`) to process pixel data in a background thread.
    *   **演算法 (Algorithm)**: 使用幾何距離算法 (Euclidean distance) 計算像素與目標顏色 (預設 #00FF00 螢光綠) 的差異，進行去背 (Chroma Keying)，並包含邊緣平滑 (Smoothness) 與去溢色 (Despill) 處理。
        *   **Algorithm**: Uses Euclidean distance to calculate the difference between pixels and the target color (default #00FF00 fluorescent green) for Chroma Keying, including edge Smoothness and Despill processing.

### 3. 檔案結構 (File Structure)
*   **單一 HTML 檔案 (Single HTML File)**: 幾乎所有的邏輯 (React Components, 樣式, Worker script) 都直接寫在一個 `index.html` (或類似入口文件) 中，這是典型的 "微型工具" 開發方式，優點是部署與修改極其快速。
*   Almost all logic (React Components, styles, Worker script) is written directly in a single `index.html` (or similar entry file). This is a typical "micro-tool" development approach, with the advantage of extremely fast deployment and modification.

### 總結 (Summary)
這是一個巧妙利用現代瀏覽器能力 (Canvas + Web Workers) 的 Serverless 工具，專門解決 AI 生成貼圖後的 "去背" 與 "切圖" 痛點。
This is a Serverless tool that cleverly utilizes modern browser capabilities (Canvas + Web Workers) to specifically solve the pain points of "background removal" and "image slicing" after AI sticker generation.
