const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 服务器配置
const BASE_URL = 'http://123.56.246.44:80';

// 音频配置
const audioConfig = {
  format: 'mp3',
  sample_rate: 48000,
  source_language: 'zh',
  target_language: 'en'
};

// 获取用户输入
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// 验证音频文件
function validateAudioFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: '文件不存在' };
  }
  
  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    return { valid: false, error: '路径不是文件' };
  }
  
  const ext = path.extname(filePath).toLowerCase();
  const supportedFormats = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
  if (!supportedFormats.includes(ext)) {
    return { valid: false, error: `不支持的音频格式: ${ext}。支持的格式: ${supportedFormats.join(', ')}` };
  }
  
  return { valid: true, filePath, size: stats.size };
}

// 流式传输音频文件
function streamAudioFile(ws, audioFilePath) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`开始流式传输音频文件: ${audioFilePath}`);
      
      const audioBuffer = fs.readFileSync(audioFilePath);
      const CHUNK_SIZE = 4096;
      const numChunks = Math.ceil(audioBuffer.length / CHUNK_SIZE);
      console.log(`文件大小: ${audioBuffer.length} 字节, 将分 ${numChunks} 块发送`);
      
      let currentChunk = 0;
      let totalSent = 0;
      
      const sendNextChunk = () => {
        if (currentChunk < numChunks) {
          const start = currentChunk * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, audioBuffer.length);
          const chunk = audioBuffer.slice(start, end);
          
          ws.send(chunk);
          
          totalSent += chunk.length;
          currentChunk++;
          
          const progress = ((totalSent / audioBuffer.length) * 100).toFixed(1);
          process.stdout.write(`\r发送进度: ${progress}% (${totalSent}/${audioBuffer.length} 字节)`);
          
          setTimeout(sendNextChunk, 100);
        } else {
          console.log('\n所有音频数据已发送');
          
          const finishMessage = JSON.stringify({ finish: true });
          console.log('发送结束标记:', finishMessage);
          ws.send(finishMessage);
          
          resolve();
        }
      };
      
      sendNextChunk();
      
    } catch (error) {
      reject(error);
    }
  });
}

// 主函数
async function main() {
  console.log('=== WebSocket 自定义Token测试 ===\n');
  
  try {
    // 获取token
    const token = await askQuestion('请输入您的认证token (不包含"Bearer "前缀): ');
    if (!token.trim()) {
      console.log('❌ Token不能为空');
      rl.close();
      return;
    }
    
    // 获取音频文件路径
    const audioFilePath = await askQuestion('请输入音频文件路径 (可选，直接回车跳过): ');
    
    // 构建WebSocket URL
    const wsUrl = BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + 
      `/ws/conversations/send_audio_message?token=${encodeURIComponent('Bearer ' + token)}&conversation_id=test_${Date.now()}`;
    
    console.log('\n🔗 连接URL:', wsUrl);
    
    // 验证音频文件（如果提供）
    if (audioFilePath.trim()) {
      const validation = validateAudioFile(audioFilePath);
      if (!validation.valid) {
        console.error(`❌ 文件验证失败: ${validation.error}`);
        rl.close();
        return;
      }
      console.log(`✅ 文件验证通过: ${validation.filePath} (${validation.size} 字节)`);
    }
    
    console.log('\n正在连接到服务器...');
    
    // 连接WebSocket
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', async () => {
      console.log('✅ 已连接到服务器');
      
      try {
        // 发送配置
        const configMessage = JSON.stringify(audioConfig);
        ws.send(configMessage);
        console.log('📤 发送配置:', configMessage);
        
        if (audioFilePath.trim()) {
          // 发送音频文件
          console.log('⏳ 等待1秒后开始发送音频数据...');
          setTimeout(async () => {
            try {
              await streamAudioFile(ws, audioFilePath);
              
              setTimeout(() => {
                console.log('🔌 关闭连接');
                ws.close();
                rl.close();
              }, 2000);
              
            } catch (error) {
              console.error('❌ 流式传输错误:', error);
              ws.close();
              rl.close();
            }
          }, 1000);
        } else {
          // 只发送测试数据
          const testAudioData = Buffer.from('test audio data');
          ws.send(testAudioData);
          console.log('📤 发送测试音频数据:', testAudioData.length, '字节');
          
          const finishMessage = JSON.stringify({ finish: true });
          ws.send(finishMessage);
          console.log('📤 发送结束标记:', finishMessage);
          
          setTimeout(() => {
            console.log('🔌 关闭连接');
            ws.close();
            rl.close();
          }, 3000);
        }
        
      } catch (error) {
        console.error('❌ 发送配置错误:', error);
        ws.close();
        rl.close();
      }
    });
    
    ws.on('message', (data) => {
      try {
        if (Buffer.isBuffer(data)) {
          const textData = data.toString('utf8');
          if (textData.trim().startsWith('{') || textData.trim().startsWith('[')) {
            try {
              const jsonData = JSON.parse(textData);
              console.log('\n📥 收到JSON响应:', JSON.stringify(jsonData, null, 2));
            } catch (e) {
              console.log('\n📥 收到文本数据:', textData);
            }
          } else {
            console.log('\n📥 收到文本响应:', textData);
          }
        } else {
          console.log('\n📥 收到数据:', data.toString());
        }
      } catch (error) {
        console.error('❌ 处理消息错误:', error);
      }
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket错误:', error.message);
      rl.close();
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🔌 连接已关闭 - 代码: ${code}, 原因: ${reason || '无'}`);
      rl.close();
    });
    
  } catch (error) {
    console.error('❌ 程序错误:', error);
    rl.close();
  }
}

// 处理进程终止
process.on('SIGINT', () => {
  console.log('\n\n程序被用户中断');
  rl.close();
  process.exit(0);
});

// 启动程序
main(); 