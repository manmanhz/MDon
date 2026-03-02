# MDon

一个类 Typora 的 Markdown 编辑器，基于 Electron + React + TipTap 构建。

## 功能特性

- **所见即所得编辑** - 基于 TipTap (ProseMirror) 的 WYSIWYG 编辑器
- **目录侧边栏** - 自动提取标题生成目录导航
- **主题支持** - 亮色/暗色主题
- **数学公式** - KaTeX 渲染 LaTeX 数学公式
- **Emoji 支持** - 内置 Emoji 选择器
- **图片/表格** - 插入和管理图片、表格
- **任务列表** - 支持 Markdown 任务列表
- **文件关联** - 支持 .md 文件双击打开
- **导出** - 支持导出为 HTML 格式

## 技术栈

- **桌面框架**: Electron 28
- **前端**: React 18 + Vite
- **编辑器**: TipTap (ProseMirror)
- **数学公式**: KaTeX
- **打包**: electron-builder

## 开发

```bash
# 安装依赖
cd monk
npm install

# 启动开发模式
npm run dev
```

## 打包

```bash
# 构建 macOS DMG
npm run build:mac
```

打包输出: `release/MDon-1.0.0-arm64.dmg`

## 安装

1. 挂载 DMG，将 `MDon.app` 拖入 `/Applications`
2. 添加命令行 alias:

```bash
echo 'alias monk="open -a MDon"' >> ~/.zshrc
source ~/.zshrc
```

## 使用

```bash
# 打开应用
monk

# 用 MDon 打开 Markdown 文件
monk file.md
monk ~/Documents/notes.md
```

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| Cmd+N | 新建 |
| Cmd+O | 打开 |
| Cmd+S | 保存 |
| Cmd+Shift+S | 另存为 |

## 项目结构

```
monk/
├── electron/
│   ├── main.js        # 主进程：窗口、菜单、IPC
│   └── preload.js    # 预加载脚本
├── src/
│   ├── App.jsx       # 主组件
│   ├── App.css       # 样式（含主题变量）
│   ├── components/
│   │   ├── TipTapEditor.jsx   # 编辑器组件
│   │   └── TableOfContents.jsx
│   ├── hooks/
│   │   └── useHeadings.js
│   └── utils/
│       └── parser.js
├── release/
│   └── MDon-1.0.0-arm64.dmg   # 安装包
└── package.json
```

## 技术方案细节

### 命令行打开文件

打包后的 Electron 应用无法直接通过命令行参数获取文件路径。采用 localStorage 注入方案：

1. `main.js` 在加载页面之前读取文件内容
2. 页面加载完成后，通过 `executeJavaScript` 注入到 localStorage
3. React 组件在 mount 时检查 localStorage 并加载内容

### 主题实现

使用 CSS 变量实现主题切换：

```css
:root {
  --bg-primary: #fefefe;
  --text-primary: #333;
  /* ... */
}

.theme-dark {
  --bg-primary: #1e1e1e;
  --text-primary: #e0e0e0;
  /* ... */
}
```

编辑器组件通过 `className` 切换主题。
