# Monk 多文件与文件夹支持 - 设计文档

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标：** 为 Monk 添加文件夹浏览和多文件 Tab 切换功能

**架构：** 纯 React State 管理，无需额外状态管理库

---

## UI 布局

```
┌─────────────────────────────────────────────────────────┐
│  Tab Bar                                                │
│  [file1.md ×] [file2.md ×] [file3.md ×]               │
├────────┬────────────────────────┬──────────────────────┤
│ 文件   │   Editor               │  标题目录              │
│ 面板   │                        │                       │
│        │                        │                       │
│ (可    │  (可隐藏)              │  (可隐藏)             │
│  隐藏) │                        │                       │
├────────┴────────────────────────┴──────────────────────┤
│  Status Bar: 当前文件路径 + 修改状态                      │
└─────────────────────────────────────────────────────────┘
```

---

## 功能需求

### 1. 文件夹面板（左）

- 支持打开文件夹，递归显示所有子文件夹
- 支持的文件类型：`.md`, `.markdown`, `.txt`
- 单击文件：在当前 tab 打开
- 双击文件：新建 tab 打开
- 可显示/隐藏（通过按钮切换）
- 文件夹图标使用 Emoji：📁 文件夹，📄 文件

### 2. Tab 栏（顶部）

- 显示所有已打开的文件（文件名 + 关闭按钮 ×）
- 点击切换当前编辑的文件
- 点击 × 关闭 tab（如果已修改，提示保存）
- 当前激活的 tab 高亮显示
- 修改过的文件 Tab 显示 ● 或不同颜色

### 3. 编辑器（中间）

- 基于现有 TipTapEditor 改造
- 显示当前激活文件的内容
- 内容变化时更新 state

### 4. 标题目录（右）- 现有功能

- 解析当前文档的 h1-h6 标题
- 点击跳转
- 可显示/隐藏

### 5. 菜单栏更新

- 新增 "Open Folder" 菜单项
- 现有 "New", "Open", "Save" 保持

---

## 数据结构

```javascript
// 文件对象
{
  id: string,           // 唯一标识 (filename + timestamp)
  path: string,         // 完整文件路径
  name: string,         // 文件名 (显示在 tab)
  content: string,      // 文件内容 (HTML)
  isModified: boolean,  // 是否已修改
  isNew: boolean        // 是否是新建未保存的文件
}

// App State
{
  files: File[],              // 已打开文件列表
  activeFileId: string,      // 当前激活的 file id
  folderPath: string | null, // 当前打开的文件夹路径
  showFileSidebar: boolean,  // 文件面板显示状态
  showTocSidebar: boolean   // 目录面板显示状态
}
```

---

## IPC 通信

### 新增 Main Process  handlers

| Handler | 说明 |
|---------|------|
| `open-folder` | 打开文件夹选择对话框，返回文件夹路径 |
| `read-folder` | 读取文件夹内容（递归），返回文件树 |
| `read-file` | 读取单个文件内容（已有） |
| `save-file` | 保存文件（已有） |

---

## 组件列表

| 组件 | 说明 |
|------|------|
| `TabBar.jsx` | 新增：顶部 Tab 切换栏 |
| `FileSidebar.jsx` | 新增：左侧文件浏览器 |
| `FileTreeItem.jsx` | 新增：文件树单项（支持递归子文件夹） |
| `App.jsx` | 修改：状态管理逻辑 |
| `TipTapEditor.jsx` | 修改：接收 file prop |
| `TableOfContents.jsx` | 已有：保持不变 |

---

## 实现顺序

1. 更新 `main.js` - 添加 folder 相关 IPC handlers
2. 更新 `preload.js` - 暴露新 API
3. 创建 `TabBar.jsx`
4. 创建 `FileSidebar.jsx` + `FileTreeItem.jsx`
5. 重构 `App.jsx` - 多文件状态管理
6. 更新 `App.css` - 布局样式
7. 更新菜单 - 添加 "Open Folder"
8. 测试

---

## 关键交互

### 打开文件夹
1. 用户点击菜单 "File > Open Folder"
2. Main process 打开系统文件夹选择器
3. 用户选择文件夹
4. Main 读取文件夹内容，返回文件树
5. React 渲染 FileSidebar

### 打开文件（单击）
1. 用户单击文件
2. 检查 files 数组是否已有该文件
3. 如有，切换 activeFileId
4. 如无，读取文件内容，添加到 files，切换 activeFileId

### 打开文件（双击）
1. 用户双击文件
2. 读取文件内容
3. 强制创建新 tab（即使已打开）
4. 添加到 files，切换 activeFileId

### 关闭 Tab
1. 用户点击 ×
2. 如 isModified，弹出确认对话框
3. 从 files 移除
4. 如关闭的是 activeFile，切换到相邻 tab

---

## 待讨论

- [x] 布局确认：四个面板水平并列
- [x] Tab 位置：顶部
- [x] 文件交互：单击当前，双击新 tab
- [x] 子文件夹：支持递归
