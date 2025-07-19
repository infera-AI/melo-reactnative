const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Get audio file path from command line arguments
const audioFilePath = process.argv[2];

if (!audioFilePath) {
  console.log('使用方法: node test-audio-simple.js <音频文件路径>');
  console.log('示例: node test-audio-simple.js ./audio.mp3');
  process.exit(1);
}

// Configuration parameters
const BASE_URL = 'http://123.56.246.44:80';
const WS_URL = BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/conversations/send_audio_message?token=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6Im1lbG9uX3VzZXIiLCJhdXRoX3R5cGUiOiJlbWFpbCIsImlkZW50aWZpZXIiOiIyOTgyODc1NDkyQHFxLmNvbSIsImV4cCI6MTc1MzA2MjcyNX0.bUZYCp4w_zx0OLYQdHMwoXQytI-Afkptp2y9vOZk7wU&conversation_id=1';
const CHUNK_SIZE = 4096; // Size of each chunk in bytes

// Audio parameters
const audioConfig = {
  format: 'mp3',
  sample_rate: 48000,
  source_language: 'zh',
  target_language: 'en'
};

// Function to validate file path
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

// Function to stream audio file in chunks
function streamAudioFile(ws, audioFilePath) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`开始流式传输音频文件: ${audioFilePath}`);
      
      // Read file as binary
      const audioBuffer = fs.readFileSync(audioFilePath);
      
      // Calculate number of chunks
      const numChunks = Math.ceil(audioBuffer.length / CHUNK_SIZE);
      console.log(`文件大小: ${audioBuffer.length} 字节, 将分 ${numChunks} 块发送`);
      
      // Send audio data in chunks with some delay between chunks
      let currentChunk = 0;
      let totalSent = 0;
      
      const sendNextChunk = () => {
        if (currentChunk < numChunks) {
          const start = currentChunk * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, audioBuffer.length);
          const chunk = audioBuffer.slice(start, end);
          
          // Send binary data
          ws.send(chunk);
          
          totalSent += chunk.length;
          currentChunk++;
          
          // Show progress
          const progress = ((totalSent / audioBuffer.length) * 100).toFixed(1);
          process.stdout.write(`\r发送进度: ${progress}% (${totalSent}/${audioBuffer.length} 字节)`);
          
          // Schedule next chunk with a small delay to avoid overwhelming the server
          setTimeout(sendNextChunk, 100);
        } else {
          console.log('\n所有音频数据已发送');
          
          // Send finish signal
          const finishMessage = JSON.stringify({ finish: true });
          console.log('发送结束标记:', finishMessage);
          ws.send(finishMessage);
          
          resolve();
        }
      };
      
      // Start sending chunks
      sendNextChunk();
      
    } catch (error) {
      reject(error);
    }
  });
}

// Main function
async function main() {
  console.log('=== WebSocket 音频流测试 ===\n');
  
  try {
    // Validate file
    const validation = validateAudioFile(audioFilePath);
    if (!validation.valid) {
      console.error(`❌ 文件验证失败: ${validation.error}`);
      process.exit(1);
    }
    
    console.log(`✅ 文件验证通过: ${validation.filePath} (${validation.size} 字节)`);
    console.log('正在连接到服务器...');
    
    // Connect to WebSocket server
    const ws = new WebSocket(WS_URL);
    
    // Handle connection open
    ws.on('open', async () => {
      console.log('✅ 已连接到服务器');
      
      try {
        // Send initial configuration as JSON
        const configMessage = JSON.stringify(audioConfig);
        ws.send(configMessage);
        console.log('📤 发送配置:', configMessage);
        
        // Start streaming audio data after configuration
        console.log('⏳ 等待1秒后开始发送音频数据...');
        setTimeout(async () => {
          try {
            await streamAudioFile(ws, audioFilePath);
            
            // Close connection after a delay to ensure all data is processed
            setTimeout(() => {
              console.log('🔌 关闭连接');
              ws.close();
              process.exit(0);
            }, 2000);
            
          } catch (error) {
            console.error('❌ 流式传输错误:', error);
            ws.close();
            process.exit(1);
          }
        }, 1000);
        
      } catch (error) {
        console.error('❌ 发送配置错误:', error);
        ws.close();
        process.exit(1);
      }
    });
    
    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        // Check if data is Buffer (binary data)
        if (Buffer.isBuffer(data)) {
          // Try to convert buffer to string
          const textData = data.toString('utf8');
          // Try to parse as JSON if it looks like JSON
          if (textData.trim().startsWith('{') || textData.trim().startsWith('[')) {
            try {
              const jsonData = JSON.parse(textData);
              console.log('\n📥 收到JSON响应:', JSON.stringify(jsonData, null, 2));
            } catch (e) {
              console.log('\n📥 收到文本数据 (非JSON):', textData);
            }
          } else {
            console.log('\n📥 收到文本响应:', textData);
          }
        } else {
          // Data is already a string
          console.log('\n📥 收到文本数据:', data.toString());
          
          // Try to parse as JSON
          try {
            const jsonData = JSON.parse(data.toString());
            console.log('\n📥 解析JSON响应:', JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log('\n📥 纯文本响应:', data.toString());
          }
        }
      } catch (error) {
        console.error('❌ 处理消息错误:', error);
        console.log('原始数据:', data);
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
    
  } catch (error) {
    console.error('❌ 程序错误:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n程序被用户中断');
  process.exit(0);
});

// Start the demo
main(); 