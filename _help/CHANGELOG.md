# Changelog / 變更日誌

All notable changes to this project will be documented in this file.
所有此專案的重大變更都將記錄於此文件中。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
格式基於 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，並遵循 [語意化版本控制 (Semantic Versioning)](https://semver.org/spec/v2.0.0.html)。

## [0.3.0] - v3: LINE貼圖 RWD版 (Line Sticker RWD Edition)
> **Deployment Status / 部署狀態**:
> - **Deployed on / 已部署於**: GitHub Pages (Jan 14, 23:20)
> - **Branch / 分支**: v3 (Last commit: Jan 14, 23:17)
> - **Note / 備註**: The code logic matches this version, but package.json version was 0.0.0 at deployment.
> - **備註**: 程式邏輯符合此版本，但部署時 package.json 版本號為 0.0.0。

### Added / 新增
- **Framework Migration / 框架遷移**:
    - **RWD Implementation**: Complete Responsive Web Design for all devices.
    - **RWD 實作**: 針對所有裝置的完整響應式網頁設計。
    - Migrated to React + Vite + Tailwind CSS.
    - 遷移至 React + Vite + Tailwind CSS。
- **Prompt Generator / 提示詞生成器**:
    - Added UI for selecting themes and styles. / 新增選擇主題與風格的介面。
    - Implemented prompt string generation logic. / 實作提示詞字串生成邏輯。
- **Image Processing / 圖片處理**:
    - Added support for 4x3 grid image upload. / 新增支援 4x3 格狀圖片上傳。
    - Implemented client-side image slicing (one image to 12 stickers). / 實作客戶端圖片切割 (一張圖切成 12 張貼圖)。
    - Added Web Worker for background removal (Green Screen/Chroma Key). / 新增 Web Worker 進行背景移除 (綠幕去背)。
- **Export / 匯出**:
    - Added "Download All" feature using JSZip. / 新增 "全部下載" 功能 (JSZip)。
- **UI/UX**:
    - Modern Dark Mode aesthetic. /現代化深色模式美學。
    - Real-time previews. / 即時預覽。

## [0.2.0] - v2: LINE貼圖 收藏版 (Line Sticker Collection Edition)
### Added / 新增
- **Collection Features / 收藏功能**:
    - Focused on managing and viewing sticker collections. (Implied)
    - 專注於管理與瀏覽貼圖收藏。(推測功能)
- Previous version stable release. / 先前版本穩定發布。

## [0.1.0] - main: 參考網站復刻 (Reference Site Replica)
> **Reference / 參考**: [Line Sticker Factory by Meiko Chang](https://meikochang.github.io/line-sticker-factory/)
### Added / 新增
- **Replica / 復刻**:
    - Initial replica of the reference website.
    - 參考網站的初始復刻版本。
- Initial prototype. / 初始原型。
