# WeeTom - 自动深色/浅色模式示例站点

一个零依赖静态页面示例：
- 默认 **自动** 跟随系统深色/浅色模式（`prefers-color-scheme`）
- 右上角可手动选择 **浅色/深色/自动**，并会记住选择（`localStorage`）

## 本地预览

在本目录启动一个静态文件服务器即可：

```bash
cd /Users/wangweite/WeeTom
python3 -m http.server 5173
```

然后在浏览器打开 `http://localhost:5173/`。

## 文件说明

- `index.html`: 页面结构与内容
- `styles.css`: 主题变量与样式（自动模式 + 手动覆盖）
- `main.js`: 主题选择器逻辑（保存/读取/应用）


