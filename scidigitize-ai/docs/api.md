# Mineru 解析接口文档 (Latest - Polling with Wrapper)

## 1. 概述
前端采用 **Direct Polling (直连轮询)** 模式。
服务端返回的数据被包裹在 `{ statusCode, body }` 结构中。
**关键逻辑**: 不能依赖 `success` 判断完成，必须判断 `message === 'completed'`。

## 2. 接口定义

### 2.1 触发解析 (Trigger)
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

**响应**:
```json
{
  "task_id": "xxxxx",
  "file_id": 922
}
```

### 2.2 查询状态 (Poll)
**请求地址**: `POST https://foxuai.com/api/webhook:trigger/acow278h6om`
**Content-Type**: `application/json`

**请求参数**:
```json
{
  "file_id": 922
}
```

**响应 (进行中 / Uploading)**:
```json
{
  "statusCode": 200,
  "body": {
    "success": true,      // ⚠️ 始终为 true
    "message": "uploading", // ⚠️ 依据此字段判断状态
    "data": {}
  }
}
```

**响应 (已完成 / Completed)**:
```json
{
  "statusCode": 200,
  "body": {
    "success": true,
    "message": "completed", // ✅ 完成标志
    "data": {
      // 动态 Key (e.g., "oabaw72jj0s") 包含有效数据
      "xxxx_dynamic_key": {
        "unzip": {
          "full": "https://.../full.md",
          "images": [ "url1", "url2" ],
          "layout": null,
          "origin": null,
          "content_list": null
        },
        "file_zip_url": "https://.../file.zip"
      },
      "obfoekvd5qt": "ZIP 文件上传并解压成功"
    }
  }
}
```

## 3. 前端处理逻辑

1.  **Polling**:
    *   获取响应 JSON.
    *   检查 `res.body.message`.
    *   若 `message === 'uploading'` 或其他非 `completed` 值 -> 继续轮询。
    *   若 `message === 'completed'` -> 解析数据。
2.  **Parsing**:
    *   遍历 `res.body.data` 对象的所有 Values。
    *   寻找一个 Object，其包含 key `unzip`。
    *   读取 `unzip.images`, `unzip.full` 等。
3.  **Result**: 构造 `MineruExtractResult` 并返回。