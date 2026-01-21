# Mineru 解析接口文档 (Latest)

## 1. 概述
前端采用 **Direct Polling (直连轮询)** 模式。
无需 Relay Server，无需 Ngrok。

## 2. 接口定义

### 2.1 触发解析 (Trigger Interface)
**请求地址**: `POST https://foxuai.com/api/webhook:trigger/e6n65lqcahs`
**Content-Type**: `application/json`

**请求参数**:
```json
{
  "url": "https://tos-url... (Signed URL)",
  "title": "filename.pdf",
  "model_version": "vlm"
}
```

**响应 (Response)**:
```json
{
  "task_id": "xxxxx",
  "file_id": "yyyyy"
}
```

### 2.2 查询状态 (Poll Interface)
**请求地址**: `POST https://foxuai.com/api/webhook:trigger/acow278h6om`
**Content-Type**: `application/json`

**请求参数**:
```json
{
  "file_id": "yyyyy"
}
```

**响应 (Response) - 进行中**:
*(假设返回结构，若未完成可能返回 success: false 或 data 为空)*

**响应 (Response) - 已完成**:
```json
{
  "success": true,
  "message": "ZIP 文件上传并解压成功",
  "data": {
    "unzip": {
      "images": [ "url1", "url2" ],
      "content_list": "url...",
      "full": "url...",
      "layout": "url...",
      "origin": "url..."
    }
  }
}
```

## 3. 前端交互流程

1.  **Call Trigger**: 获得 `file_id`.
2.  **Loop Polling**:
    *   POST `/acow278h6om` with `file_id`.
    *   Check `res.success` and `res.data`.
    *   If `success === true`, return data.
    *   Else, sleep 5s and retry.