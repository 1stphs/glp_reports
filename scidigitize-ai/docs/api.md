# Mineru 异步回调接口文档 (Production)

## 1. 概述 (Overview)
Mineru 深度解析 API 采用异步回调机制。前端上传文件并触发解析任务后，Mineru 服务端将在后台处理（约 2-5 分钟），处理完成后通过 POST 请求将结果（已持久化的图片和 Markdown 地址）推送到指定的回调地址 (`callback_url`)。

生产环境域名: `https://glp.foxu.ai`

## 2. 交互时序 (Sequence Diagram)

1.  **上传 (Upload)**: 前端直传文件至 TOS (或后端存储)，获取访问 URL (Signed URL)。
2.  **触发 (Trigger)**: 前端调用 Mineru 触发接口，携带 `callback_url` (指向 `glp.foxu.ai` 的接收端)。
3.  **处理 (Processing)**: Mineru 进行解析，第三方服务确保持久化存储。
4.  **回调 (Callback)**: 解析完成后，向 `callback_url` 推送最终结果 JSON。
5.  **渲染 (Rendering)**: 前端通过轮询 (Polling) 或 WebSocket 获取结果并渲染。

## 3. 接口定义 (API Specification)

### 3.1 触发解析 (Trigger Interface)
**请求地址**: `POST https://foxuai.com/api/webhook:trigger/yqwfx0r97q9`
**Content-Type**: `application/json`

**请求参数 (Payload)**:
```json
{
  "url": "https://tos-url... (文件下载地址)",
  "title": "filename.pdf",
  "model_version": "vlm",
  "callback_url": "https://glp.foxu.ai/api/mineru-hook" 
}
```
*注意：生产环境 `callback_url` 必须是公网可访问的 HTTPS 地址。*

### 3.2 接收回调 (Callback Interface)
**接收地址**: `POST https://glp.foxu.ai/api/mineru-hook`
**发送方**: Mineru 服务端 / 持久化服务
**Content-Type**: `application/json`

**回调内容 (Callback Payload)**:
数据包含已持久化的文件链接（不再是临时 TOS 链接），可直接用于及前端渲染。

```json
{
  "unique_id_xxxx": {
    "images": [
      "https://persistent-storage.com/path/to/image1.jpg",
      "https://persistent-storage.com/path/to/image2.jpg"
    ],
    "full": "https://persistent-storage.com/path/to/result.md",
    "layout": "https://persistent-storage.com/path/to/layout.json",
    "origin": "https://original-tos-url..."
  }
}
```

### 3.3 前端轮询 (Frontend Polling)
**为什么需要轮询？(Why Polling? - 技术原理解答)**
*   **回调 (3.2)**: 是 **Mineru 服务端** -> **您的后端服务** 的通信。
*   **轮询 (3.3)**: 是 **您的前端 (浏览器)** -> **您的后端服务** 的通信。

**原因**: 浏览器 (前端) 无法直接接收来自互联网的 POST 回调（没有公网 IP 端口）。因此，必须由后端先“接住”回调结果并存储，前端再不断询问后端：“结果到了吗？”。

**轮询地址**: `GET /api/poll-results` (生产环境相对路径)
**响应**: 返回已接收到的回调数据。

## 4. 生产环境配置指南

1.  **域名**: 确保 `glp.foxu.ai` 能够处理 `/api/mineru-hook` 的 POST 请求。
2.  **Nginx/后端**: 需要一个后端服务（如 Node.js Express）监听该路由并将结果存入内存或数据库（Redis）。
3.  **环境变量**: 
    在生产构建中配置：
    ```
    VITE_CALLBACK_URL=https://glp.foxu.ai/api/mineru-hook
    ```

## 5. 开发环境 vs 生产环境

| 环境 | 触发 URL (Trigger) | 回调 URL (Callback) | 轮询地址 (Poll) |
| :--- | :--- | :--- | :--- |
| **Development** | `/foxu-api/...` (Proxy) | `https://xxxx.ngrok.io/api/mineru-hook` | `http://localhost:3001/api/poll-results` |
| **Production** | `https://foxuai.com/api...` | `https://glp.foxu.ai/api/mineru-hook` | `/api/poll-results` (同域) |