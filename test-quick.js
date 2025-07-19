const WebSocket = require('ws');

// Configuration parameters
const BASE_URL = 'http://123.56.246.44:80';
const WS_URL = BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/conversations/send_audio_message?token=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6Im1lbG9uX3VzZXIiLCJhdXRoX3R5cGUiOiJlbWFpbCIsImlkZW50aWZpZXIiOiIyOTgyODc1NDkyQHFxLmNvbSIsImV4cCI6MTc1MzA2MjcyNX0.bUZYCp4w_zx0OLYQdHMwoXQytI-Afkptp2y9vOZk7wU&conversation_id=1';

// Audio parameters
const audioConfig = {
  format: 'mp3',
  sample_rate: 48000,
  source_language: 'zh',
  target_language: 'en'
};

console.log('=== WebSocket 快速连接测试 ===\n');
console.log('正在连接到服务器...');

// Connect to WebSocket server
const ws = new WebSocket(WS_URL);

// Handle connection open
ws.on('open', () => {
  console.log('✅ 已连接到服务器');
  
  // Send initial configuration as JSON
  const configMessage = JSON.stringify(audioConfig);
  ws.send(configMessage);
  console.log('📤 发送配置:', configMessage);
  
  // Send a small test audio chunk (simulated)
  const testAudioData = Buffer.from('test audio data');
  ws.send(testAudioData);
  console.log('📤 发送测试音频数据:', testAudioData.length, '字节');
  
  // Send finish signal
  const finishMessage = JSON.stringify({ finish: true });
  ws.send(finishMessage);
  console.log('📤 发送结束标记:', finishMessage);
  
  // Close connection after a delay
  setTimeout(() => {
    console.log('🔌 关闭连接');
    ws.close();
    process.exit(0);
  }, 3000);
});

// Handle incoming messages
ws.on('message', (data) => {
  try {
    if (Buffer.isBuffer(data)) {
      const textData = data.toString('utf8');
      if (textData.trim().startsWith('{') || textData.trim().startsWith('[')) {
        try {
          const jsonData = JSON.parse(textData);
          console.log('📥 收到JSON响应:', JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log('📥 收到文本数据:', textData);
        }
      } else {
        console.log('📥 收到文本响应:', textData);
      }
    } else {
      console.log('📥 收到数据:', data.toString());
    }
  } catch (error) {
    console.error('❌ 处理消息错误:', error);
  }
});

// Handle errors
ws.on('error', (error) => {
  console.error('❌ WebSocket错误:', error);
  process.exit(1);
});

// Handle connection close
ws.on('close', (code, reason) => {
  console.log(`🔌 连接已关闭 - 代码: ${code}, 原因: ${reason || '无'}`);
  process.exit(0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n程序被用户中断');
  ws.close();
  process.exit(0);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ 连接超时');
  ws.close();
  process.exit(1);
}, 10000); 