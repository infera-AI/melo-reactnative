/**
 * 文档翻译测试脚本
 * 用于测试文档翻译的完整流程
 */

const axios = require('axios');

// 模拟API配置
const API_BASE_URL = 'http://127.0.0.1:8000';
const TEST_TOKEN = 'test_token_123';

// 模拟文件数据
const mockFile = {
  uri: 'file://test-document.pdf',
  name: 'test-document.pdf',
  type: 'application/pdf',
  size: 1024 * 1024, // 1MB
};

// 模拟翻译请求
async function testTranslateDocument() {
  console.log('🧪 开始测试文档翻译流程...');
  
  try {
    // 1. 创建翻译任务
    console.log('📤 步骤1: 创建翻译任务');
    const translateResponse = await axios.post(
      `${API_BASE_URL}/translations/translate/docs`,
      {
        source_language: 'zh-CN',
        target_language: 'en-US',
        file: mockFile,
      },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 300000, // 5分钟超时
      }
    );
    
    console.log('✅ 翻译任务创建成功');
    console.log('📊 响应数据:', JSON.stringify(translateResponse.data, null, 2));
    
    const taskId = translateResponse.data.data.task_id;
    if (!taskId) {
      throw new Error('未获取到任务ID');
    }
    
    console.log('🆔 任务ID:', taskId);
    
    // 2. 轮询任务状态
    console.log('🔄 步骤2: 开始轮询任务状态');
    await pollTaskStatus(taskId);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('❌ 响应状态:', error.response.status);
      console.error('❌ 响应数据:', error.response.data);
    }
  }
}

// 轮询任务状态
async function pollTaskStatus(taskId) {
  let attempts = 0;
  const maxAttempts = 20; // 最多轮询20次（60秒）
  
  const pollInterval = setInterval(async () => {
    attempts++;
    console.log(`🔍 轮询尝试 ${attempts}/${maxAttempts}`);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/translations/translate/docs/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
          },
          timeout: 10000, // 10秒超时
        }
      );
      
      const taskData = response.data.data;
      console.log('📊 任务状态:', taskData.status);
      console.log('📊 页面数:', taskData.page_count);
      console.log('📊 请求ID:', taskData.request_id);
      console.log('📊 翻译文件URL:', taskData.translate_file_url);
      
      // 检查翻译完成状态
      if (taskData.status === 'translated') {
        console.log('✅ 翻译任务完成，状态为translated!');
        console.log('📥 翻译文件URL:', taskData.translate_file_url);
        
        // 3. 下载翻译结果
        if (taskData.translate_file_url) {
          console.log('📥 步骤3: 下载翻译结果');
          await downloadTranslationResult(taskId);
        }
        
        clearInterval(pollInterval);
        return;
        
      } else if (taskData.status === 'failed' || taskData.status === 'error') {
        console.log('❌ 翻译任务失败:', taskData.translate_error_message);
        clearInterval(pollInterval);
        return;
        
      } else {
        console.log('⏳ 任务进行中，继续等待...');
      }
      
    } catch (error) {
      console.error('❌ 轮询失败:', error.message);
      
      if (attempts >= maxAttempts) {
        console.log('⏰ 达到最大轮询次数，停止轮询');
        clearInterval(pollInterval);
      }
    }
  }, 3000); // 每3秒轮询一次
}

// 下载翻译结果
async function downloadTranslationResult(taskId) {
  try {
    console.log('📥 开始下载翻译结果...');
    
    const response = await axios.get(
      `${API_BASE_URL}/translations/translate/docs/${taskId}/download`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
        responseType: 'blob',
        timeout: 60000, // 1分钟超时
      }
    );
    
    console.log('✅ 下载成功');
    console.log('📊 文件大小:', response.data.size, 'bytes');
    console.log('📊 文件类型:', response.headers['content-type']);
    
    // 在实际环境中，这里会将文件保存到本地
    console.log('💾 文件已准备下载（在实际环境中会保存到设备）');
    
  } catch (error) {
    console.error('❌ 下载失败:', error.message);
  }
}

// 测试错误处理
async function testErrorHandling() {
  console.log('\n🧪 测试错误处理...');
  
  try {
    // 测试无效的任务ID
    const response = await axios.get(
      `${API_BASE_URL}/translations/translate/docs/invalid-task-id`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
        },
      }
    );
    
    console.log('📊 错误响应:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('✅ 错误处理正常');
    console.log('📊 错误状态:', error.response?.status);
    console.log('📊 错误消息:', error.response?.data?.message);
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始文档翻译功能测试\n');
  
  // 测试正常流程
  await testTranslateDocument();
  
  // 测试错误处理
  await testErrorHandling();
  
  console.log('\n✅ 测试完成');
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests();
}

module.exports = { 
  testTranslateDocument, 
  pollTaskStatus, 
  downloadTranslationResult,
  testErrorHandling 
}; 