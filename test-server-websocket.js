/**
 * 测试服务器WebSocket支持
 */

const WebSocket = require('ws');

// 服务器配置
const BASE_URL = 'http://123.56.246.44:80';
const WS_URL = BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/conversations/send_audio_message';

console.log('🚀 开始测试服务器WebSocket支持...');
console.log('🔗 基础URL:', BASE_URL);
console.log('🔗 WebSocket URL:', WS_URL);

// 测试不同的连接方式
const testCases = [
  {
    name: '基本连接测试',
    url: WS_URL + '?token=test_token&conversation_id=test_123',
    description: '使用简单的测试token'
  },
  {
    name: '完整token测试',
    url: WS_URL + '?token=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6Im1lbG9uX3VzZXIiLCJhdXRoX3R5cGUiOiJlbWFpbCIsImmlkZW50aWZpZXIiOiIyOTgyODc1NDkyQHFxLmNvbSIsImV4cCI6MTc1MzA2MjcyNX0.bUZYCp4w_zx0OLYQdHMwoXQytI-Afkptp2y9vOZk7wU&conversation_id=test_123',
    description: '使用完整的JWT token'
  }
];

async function testWebSocketConnection(testCase) {
  return new Promise((resolve) => {
    console.log(`\n🧪 ${testCase.name}:`);
    console.log(`📝 ${testCase.description}`);
    console.log(`🔗 URL: ${testCase.url}`);
    
    const ws = new WebSocket(testCase.url);
    
    const timeout = setTimeout(() => {
      console.log('⏰ 连接超时');
      ws.close();
      resolve({ success: false, error: 'timeout' });
    }, 10000);
    
    ws.on('open', () => {
      clearTimeout(timeout);
      console.log('✅ 连接成功！');
      
      // 发送简单的测试消息
      const testMessage = { type: 'ping', timestamp: Date.now() };
      ws.send(JSON.stringify(testMessage));
      console.log('📤 发送测试消息:', JSON.stringify(testMessage));
      
      // 等待响应
      setTimeout(() => {
        ws.close();
        resolve({ success: true });
      }, 2000);
    });
    
    ws.on('message', (data) => {
      console.log('📥 收到响应:', data.toString());
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.log('❌ 连接错误:', error.message);
      resolve({ success: false, error: error.message });
    });
    
    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      console.log('🔌 连接关闭 - 代码:', code, '原因:', reason);
      resolve({ success: false, error: `closed with code ${code}` });
    });
  });
}

async function runTests() {
  console.log('=' * 50);
  console.log('🧪 WebSocket服务器测试');
  console.log('=' * 50);
  
  for (const testCase of testCases) {
    const result = await testWebSocketConnection(testCase);
    console.log(`\n📊 测试结果: ${result.success ? '✅ 成功' : '❌ 失败'}`);
    if (!result.success) {
      console.log(`❌ 错误: ${result.error}`);
    }
    console.log('-'.repeat(50));
  }
  
  console.log('\n🏁 测试完成');
}

// 运行测试
runTests().catch(console.error); 