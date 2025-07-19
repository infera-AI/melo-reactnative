/**
 * 使用真实token测试WebSocket连接
 */

const WebSocket = require('ws');

// 服务器配置
const BASE_URL = 'http://123.56.246.44:80';

// 首先获取真实的token
async function getRealToken() {
  try {
    console.log('🔑 尝试获取真实token...');
    
    // 这里我们需要模拟前端获取token的过程
    // 由于这是Node.js环境，我们需要手动提供token
    // 你可以从前端应用的AsyncStorage中获取ACTION_TOKEN
    
    // 临时使用一个测试token，你需要替换为真实的token
    const testToken = 'your_real_action_token_here';
    
    if (testToken === 'your_real_action_token_here') {
      console.log('⚠️ 请替换为真实的ACTION_TOKEN');
      console.log('📱 从前端应用的AsyncStorage中获取ACTION_TOKEN');
      console.log('🔑 或者从浏览器开发者工具中获取');
      return null;
    }
    
    return testToken;
  } catch (error) {
    console.error('❌ 获取token失败:', error);
    return null;
  }
}

async function testWebSocketWithRealToken() {
  const token = await getRealToken();
  
  if (!token) {
    console.log('❌ 无法获取token，测试终止');
    return;
  }
  
  console.log('🔑 获取到token:', token.substring(0, 20) + '...');
  
  // 构建WebSocket URL
  const WS_URL = BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + 
    `/ws/conversations/send_audio_message?token=${encodeURIComponent(token)}&conversation_id=test_${Date.now()}`;
  
  console.log('🔗 WebSocket URL:', WS_URL);
  
  return new Promise((resolve) => {
    const ws = new WebSocket(WS_URL);
    
    const timeout = setTimeout(() => {
      console.log('⏰ 连接超时');
      ws.close();
      resolve({ success: false, error: 'timeout' });
    }, 10000);
    
    ws.on('open', () => {
      clearTimeout(timeout);
      console.log('✅ WebSocket连接成功！');
      
      // 发送配置信息
      const config = {
        format: 'wav',
        sample_rate: 16000,
        source_language: 'zh',
        target_language: 'en'
      };
      
      console.log('📤 发送配置:', JSON.stringify(config));
      ws.send(JSON.stringify(config));
      
      // 等待1秒后发送测试音频数据
      setTimeout(() => {
        // 创建模拟音频数据
        const audioData = Buffer.alloc(512);
        for (let i = 0; i < audioData.length; i++) {
          audioData[i] = Math.floor(Math.random() * 256);
        }
        
        console.log('🎵 发送测试音频数据，大小:', audioData.length, 'bytes');
        ws.send(audioData);
        
        // 等待1秒后发送结束标记
        setTimeout(() => {
          const finishMessage = { finish: true };
          console.log('🏁 发送结束标记:', JSON.stringify(finishMessage));
          ws.send(JSON.stringify(finishMessage));
          
          // 等待响应后关闭
          setTimeout(() => {
            ws.close();
            resolve({ success: true });
          }, 2000);
        }, 1000);
      }, 1000);
    });
    
    ws.on('message', (data) => {
      console.log('📥 收到服务器响应:');
      if (Buffer.isBuffer(data)) {
        console.log('🎵 音频数据，大小:', data.length, 'bytes');
      } else {
        console.log('📝 文本数据:', data.toString());
      }
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.log('❌ WebSocket错误:', error.message);
      resolve({ success: false, error: error.message });
    });
    
    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      console.log('🔌 连接关闭 - 代码:', code, '原因:', reason);
      resolve({ success: false, error: `closed with code ${code}` });
    });
  });
}

// 运行测试
async function runTest() {
  console.log('🚀 开始真实token WebSocket测试...');
  console.log('🔗 服务器地址:', BASE_URL);
  
  const result = await testWebSocketWithRealToken();
  
  console.log('\n📊 测试结果:');
  if (result.success) {
    console.log('✅ 测试成功！WebSocket连接和音频数据传输正常');
  } else {
    console.log('❌ 测试失败:', result.error);
    console.log('\n🔍 可能的原因:');
    console.log('1. Token无效或已过期');
    console.log('2. 服务器端WebSocket路径不正确');
    console.log('3. 认证方式不正确');
    console.log('4. 服务器不支持WebSocket');
  }
}

runTest().catch(console.error); 