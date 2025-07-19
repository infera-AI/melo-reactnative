# WebSocket 音频流测试脚本

这个目录包含了用于测试WebSocket音频流功能的Node.js脚本。

## 文件说明

### 1. `test-audio-stream-demo.js` - 交互式测试脚本
- 支持用户交互输入音频文件路径
- 包含文件验证和确认步骤
- 适合手动测试和调试

### 2. `test-audio-simple.js` - 命令行测试脚本
- 通过命令行参数指定音频文件
- 适合自动化测试和快速验证
- 使用更简单直接

## 使用方法

### 交互式测试
```bash
node test-audio-stream-demo.js
```
然后按提示输入音频文件路径。

### 命令行测试
```bash
node test-audio-simple.js <音频文件路径>
```

示例：
```bash
node test-audio-simple.js ./audio.mp3
node test-audio-simple.js /path/to/your/audio.wav
```

## 支持的音频格式

- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- AAC (.aac)
- OGG (.ogg)

## 测试流程

1. **连接建立**: 连接到WebSocket服务器
2. **配置发送**: 发送音频配置参数
3. **音频流传输**: 分块发送音频数据
4. **结束标记**: 发送完成标记
5. **连接关闭**: 等待响应后关闭连接

## 配置参数

当前配置：
- 服务器地址: `ws://123.56.246.44:80/ws/conversations/send_audio_message`
- 音频格式: MP3
- 采样率: 48000Hz
- 源语言: 中文 (zh)
- 目标语言: 英文 (en)
- 分块大小: 4096字节
- 发送间隔: 100ms

## 输出说明

- ✅ 成功操作
- ❌ 错误信息
- 📤 发送数据
- 📥 接收数据
- ⏳ 等待状态
- 🔌 连接状态

## 注意事项

1. 确保WebSocket服务器正在运行
2. 检查token是否有效
3. 音频文件路径要正确
4. 网络连接要稳定

## 故障排除

### 连接失败
- 检查服务器是否启动
- 验证URL和端口是否正确
- 确认网络连接

### 认证失败
- 检查token是否过期
- 验证token格式是否正确
- 确认用户权限

### 文件错误
- 检查文件是否存在
- 验证文件格式是否支持
- 确认文件路径正确

### 传输中断
- 检查网络稳定性
- 验证服务器负载
- 确认音频文件完整性

## 示例输出

```
=== WebSocket 音频流测试 ===

✅ 文件验证通过: ./test.mp3 (1024000 字节)
正在连接到服务器...
✅ 已连接到服务器
📤 发送配置: {"format":"mp3","sample_rate":48000,"source_language":"zh","target_language":"en"}
⏳ 等待1秒后开始发送音频数据...
开始流式传输音频文件: ./test.mp3
文件大小: 1024000 字节, 将分 250 块发送
发送进度: 100.0% (1024000/1024000 字节)
所有音频数据已发送
发送结束标记: {"finish":true}
📥 收到JSON响应: {"status":"success","translation":"Hello world"}
🔌 关闭连接 - 代码: 1000, 原因: 无
``` 