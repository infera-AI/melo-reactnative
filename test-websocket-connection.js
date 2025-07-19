/**
 * WebSocket连接测试脚本
 * 用于验证前端WebSocket连接是否正常工作
 */

const WebSocket = require('ws');

// 配置参数 - 使用正确的服务器地址
const BASE_URL = 'http://123.56.246.44:80';
const WS_URL = BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/conversations/send_audio_message?token=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6Im1lbG9uX3VzZXIiLCJhdXRoX3R5cGUiOiJlbWFpbCIsImmlkZW50aWZpZXIiOiIyOTgyODc1NDkyQHFxLmNvbSIsImV4cCI6MTc1MzA2MjcyNX0.bUZYCp4w_zx0OLYQdHMwoXQytI-Afkptp2y9vOZk7wU&conversation_id=test_123';

// 音频配置
const audioConfig = {
  format: 'wav',
  sample_rate: 16000,
  source_language: 'zh',
  target_language: 'en'
};

// 创建WebSocket连接
const ws = new WebSocket(WS_URL);

// 连接建立
ws.on('open', () => {
  console.log('✅ 连接到服务器成功');
  console.log('🔗 连接URL:', WS_URL);
  
  // 发送配置信息
  const configMessage = JSON.stringify(audioConfig);
  ws.send(configMessage);
  console.log('📤 发送配置:', configMessage);
  
  // 等待1秒后开始测试
  setTimeout(() => {
    testAudioDataSending();
  }, 1000);
});

// 接收消息
ws.on('message', (data) => {
  try {
    console.log('📥 收到消息:');
    console.log('📥 数据类型:', typeof data);
    console.log('📥 是否为Buffer:', Buffer.isBuffer(data));
    console.log('📥 数据大小:', data.length || data.byteLength, 'bytes');
    
    if (Buffer.isBuffer(data)) {
      // 二进制数据
      console.log('🎵 收到音频数据');
    } else {
      // 文本数据
      const textData = data.toString();
      console.log('📝 收到文本数据:', textData);
      
      try {
        const jsonData = JSON.parse(textData);
        console.log('📝 解析为JSON:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('📝 纯文本数据');
      }
    }
  } catch (error) {
    console.error('❌ 处理消息失败:', error);
  }
});

// 错误处理
ws.on('error', (error) => {
  console.error('❌ WebSocket错误:', error);
});

// 连接关闭
ws.on('close', (code, reason) => {
  console.log('🔌 连接关闭');
  console.log('🔌 关闭代码:', code);
  console.log('🔌 关闭原因:', reason);
});

// 测试音频数据发送
function testAudioDataSending() {
  console.log('🧪 开始测试音频数据发送...');
  
  // 创建模拟音频数据（1KB的随机数据）
  const audioData = Buffer.alloc(1024);
  for (let i = 0; i < audioData.length; i++) {
    audioData[i] = Math.floor(Math.random() * 256);
  }
  
  console.log('🎵 创建模拟音频数据，大小:', audioData.length, 'bytes');
  
  // 分块发送音频数据
  const chunkSize = 256;
  const numChunks = Math.ceil(audioData.length / chunkSize);
  let currentChunk = 0;
  
  const sendNextChunk = () => {
    if (currentChunk < numChunks) {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, audioData.length);
      const chunk = audioData.slice(start, end);
      
      console.log(`📤 发送第${currentChunk + 1}/${numChunks}块，大小:`, chunk.length, 'bytes');
      
      try {
        ws.send(chunk);
        console.log(`✅ 第${currentChunk + 1}块发送成功`);
      } catch (error) {
        console.error(`❌ 第${currentChunk + 1}块发送失败:`, error);
      }
      
      currentChunk++;
      
      // 延迟发送下一块
      setTimeout(sendNextChunk, 100);
    } else {
      console.log('✅ 所有音频数据发送完成');
      
      // 发送结束标记
      setTimeout(() => {
        const finishMessage = JSON.stringify({ finish: true });
        console.log('🏁 发送结束标记:', finishMessage);
        
        try {
          ws.send(finishMessage);
          console.log('✅ 结束标记发送成功');
        } catch (error) {
          console.error('❌ 结束标记发送失败:', error);
        }
        
        // 等待2秒后关闭连接
        setTimeout(() => {
          console.log('🔌 测试完成，关闭连接');
          ws.close();
        }, 2000);
      }, 500);
    }
  };
  
  // 开始发送
  sendNextChunk();
}

// 启动测试
console.log('🚀 WebSocket连接测试开始');
console.log('�� 连接地址:', WS_URL); 