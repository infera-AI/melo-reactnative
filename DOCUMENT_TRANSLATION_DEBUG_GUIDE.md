# 文档翻译功能调试指南

## 功能概述

文档翻译功能允许用户上传文档（PDF、Word、Excel、PowerPoint等），系统会异步处理翻译任务，用户可以通过轮询获取翻译进度，最终下载翻译结果。

## 完整流程

### 1. 文件上传和任务创建

```typescript
// 用户选择文件后，调用翻译接口
const response = await translateService.translateDocument({
  source_language: 'zh-CN',
  target_language: 'en-US',
  file: {
    uri: fileInfo.uri,
    name: fileInfo.name,
    type: fileInfo.type,
  }
});

// 成功响应示例
{
  "code": 200,
  "message": "翻译任务创建成功",
  "data": {
    "task_id": "task_123456789",
    "request_id": "req_987654321",
    "status": "pending",
    "success": "true",
    "message": "任务已创建"
  }
}
```

### 2. 轮询任务状态

```typescript
// 每3秒轮询一次任务状态
const response = await translateService.getTranslationTask(taskId);

// 轮询响应示例
{
  "code": 200,
  "data": {
    "task_id": "task_123456789",
    "request_id": "req_987654321",
    "status": "processing", // pending, processing, completed, failed
    "page_count": "5",
    "translate_file_url": "https://example.com/translated_file.pdf",
    "translate_error_message": "",
    "message": "翻译进行中"
  }
}
```

### 3. 翻译完成

当 `status` 等于 `translated` 时，表示翻译完成：

```typescript
// 完成状态响应
{
  "code": 200,
  "data": {
    "task_id": "task_123456789",
    "status": "translated", // 翻译完成状态
    "translate_file_url": "https://example.com/translated_file.pdf",
    "page_count": "5",
    "message": "翻译完成"
  }
}
```

**注意**：只有当状态为 `translated` 时，才会获取 `translate_file_url` 并停止轮询。

## 状态说明

| 状态 | 描述 | 处理方式 |
|------|------|----------|
| `pending` | 任务等待中 | 继续轮询，显示加载动画 |
| `processing` | 翻译进行中 | 继续轮询，显示加载动画 |
| `translating` | 翻译进行中 | 继续轮询，显示加载动画 |
| `translated` | 翻译完成 | 停止轮询，显示结果 |
| `failed` | 翻译失败 | 停止轮询，显示错误 |
| `error` | 翻译错误 | 停止轮询，显示错误 |

## 常见问题及解决方案

### 1. 任务创建失败

**问题**: 调用 `translateDocument` 接口返回错误

**可能原因**:
- 文件格式不支持
- 文件大小超限（100MB）
- 网络连接问题
- 认证失败

**解决方案**:
```typescript
// 检查文件格式
const supportedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
if (!supportedTypes.includes(fileType.toLowerCase())) {
  Alert.alert('文件格式不支持', '请选择支持的文档格式');
  return;
}

// 检查文件大小
const maxSize = 100 * 1024 * 1024; // 100MB
if (fileSize > maxSize) {
  Alert.alert('文件过大', '文件大小不能超过100MB');
  return;
}
```

### 2. 轮询失败

**问题**: 轮询过程中出现网络错误

**解决方案**:
```typescript
// 添加网络错误处理
if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
  console.log('网络错误，继续轮询');
  return; // 继续轮询，不停止
}
```

### 3. 任务状态异常

**问题**: 任务状态长时间不更新

**解决方案**:
```typescript
// 添加超时机制
const maxPollingTime = 300000; // 5分钟
const startTime = Date.now();

if (Date.now() - startTime > maxPollingTime) {
  console.log('轮询超时，停止轮询');
  clearInterval(pollInterval);
  setUploadStatus('error');
  setErrorMessage('翻译超时，请重试');
}
```

### 4. 下载失败

**问题**: 翻译完成后无法下载结果

**解决方案**:
```typescript
// 检查下载链接
if (taskData.translate_file_url) {
  // 使用直接下载链接
  console.log('使用直接下载链接:', taskData.translate_file_url);
} else {
  // 调用下载API
  const blob = await translateService.downloadTranslationResult(taskId);
  // 处理下载的文件
}
```

## 调试技巧

### 1. 启用详细日志

```typescript
// 在关键步骤添加日志
console.log('🚀 开始翻译文档...');
console.log('📄 文件信息:', fileInfo);
console.log('📤 发送翻译请求:', JSON.stringify(request, null, 2));
console.log('📥 翻译响应:', JSON.stringify(response, null, 2));
```

### 2. 使用测试脚本

运行 `test-document-translation.js` 来测试API接口：

```bash
node test-document-translation.js
```

### 3. 检查网络请求

使用浏览器开发者工具或React Native调试器查看网络请求：

- 请求URL是否正确
- 请求头是否包含认证信息
- 响应状态码和内容

### 4. 模拟不同状态

在开发环境中，可以模拟不同的翻译状态来测试UI：

```typescript
// 模拟不同状态
const mockStatuses = ['pending', 'processing', 'completed', 'failed'];
const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
```

## 性能优化建议

### 1. 轮询间隔优化

```typescript
// 根据任务状态调整轮询间隔
const getPollingInterval = (status: string) => {
  switch (status) {
    case 'pending': return 5000; // 5秒
    case 'processing': return 3000; // 3秒
    default: return 10000; // 10秒
  }
};
```

### 2. 错误重试机制

```typescript
// 添加重试机制
let retryCount = 0;
const maxRetries = 3;

if (error && retryCount < maxRetries) {
  retryCount++;
  setTimeout(() => {
    // 重试请求
  }, 1000 * retryCount);
}
```

### 3. 内存管理

```typescript
// 组件卸载时清理轮询
useEffect(() => {
  return () => {
    if (statusPollingRef.current) {
      clearInterval(statusPollingRef.current);
    }
  };
}, []);
```

## 测试用例

### 1. 正常流程测试

1. 选择支持的文档格式
2. 文件大小在限制范围内
3. 网络连接正常
4. 验证完整翻译流程

### 2. 异常情况测试

1. 选择不支持的文件格式
2. 上传超大文件
3. 网络断开时的处理
4. 服务器错误响应

### 3. 边界条件测试

1. 空文件
2. 单页文档
3. 多页大文档
4. 特殊字符文件名

## 监控指标

建议监控以下指标：

- 任务创建成功率
- 平均翻译时间
- 轮询失败率
- 下载成功率
- 用户取消率

这些指标可以帮助识别性能瓶颈和用户体验问题。 