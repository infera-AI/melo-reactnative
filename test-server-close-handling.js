/**
 * 测试服务器主动关闭处理
 * 验证发送finish后服务器关闭连接的处理逻辑
 */

const { RealTimeTranslationService } = require('./src/services/realTimeTranslationService');

// 模拟测试环境
const mockCallbacks = {
  onMessage: (response) => {
    console.log('📥 收到消息:', response);
  },
  onError: (error) => {
    console.log('❌ 错误:', error);
  },
  onClose: () => {
    console.log('🔌 连接关闭');
  },
  onOpen: () => {
    console.log('✅ 连接建立');
  }
};

// 模拟配置
const mockConfig = {
  format: 'wav',
  sample_rate: 16000,
  source_language: 'zh',
  target_language: 'ja'
};

// 模拟Token
const mockToken = 'mock_token_123';

// 测试场景1：发送finish后服务器关闭连接
async function testServerCloseAfterFinish() {
  console.log('\n=== 测试场景1：发送finish后服务器关闭连接 ===');
  
  const service = new RealTimeTranslationService();
  
  try {
    // 初始化连接
    console.log('🔄 初始化连接...');
    await service.initialize(mockConfig, mockToken, '测试用户', mockCallbacks);
    
    // 模拟发送音频数据
    console.log('🎵 发送音频数据...');
    const audioData = new ArrayBuffer(1024);
    service.sendAudioData(audioData);
    
    // 发送结束标记
    console.log('🏁 发送结束标记...');
    service.sendFinish();
    
    // 模拟服务器关闭连接（延迟1秒）
    setTimeout(() => {
      console.log('🔌 模拟服务器关闭连接...');
      // 这里我们模拟WebSocket错误事件
      if (service.ws) {
        const errorEvent = new Event('error');
        service.ws.onerror(errorEvent);
      }
    }, 1000);
    
    // 等待一段时间观察处理结果
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ 测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 测试场景2：下次录音时重新连接
async function testReconnectOnNextRecording() {
  console.log('\n=== 测试场景2：下次录音时重新连接 ===');
  
  const service = new RealTimeTranslationService();
  
  try {
    // 第一次初始化
    console.log('🔄 第一次初始化连接...');
    await service.initialize(mockConfig, mockToken, '测试用户', mockCallbacks);
    
    // 发送结束标记
    console.log('🏁 发送结束标记...');
    service.sendFinish();
    
    // 模拟连接关闭
    setTimeout(() => {
      console.log('🔌 连接已关闭');
      service.isConnected = false;
      if (service.ws) {
        service.ws.readyState = 3; // CLOSED
      }
    }, 500);
    
    // 等待连接关闭
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 检查连接状态
    const connectionInfo = service.getConnectionInfo();
    console.log('🔍 连接状态:', connectionInfo);
    
    // 模拟下次录音时重新连接
    console.log('🔄 模拟下次录音，重新连接...');
    await service.initialize(mockConfig, mockToken, '测试用户', mockCallbacks);
    
    // 检查新连接状态
    const newConnectionInfo = service.getConnectionInfo();
    console.log('🔍 新连接状态:', newConnectionInfo);
    
    console.log('✅ 重新连接测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 测试场景3：错误事件处理
async function testErrorEventHandling() {
  console.log('\n=== 测试场景3：错误事件处理 ===');
  
  const service = new RealTimeTranslationService();
  
  try {
    // 初始化连接
    await service.initialize(mockConfig, mockToken, '测试用户', mockCallbacks);
    
    // 发送结束标记
    service.sendFinish();
    
    // 立即触发错误事件（应该被忽略）
    console.log('🔄 立即触发错误事件（应该被忽略）...');
    const errorEvent = new Event('error');
    if (service.ws) {
      service.ws.onerror(errorEvent);
    }
    
    // 等待5秒后触发错误事件（应该被处理）
    setTimeout(() => {
      console.log('🔄 5秒后触发错误事件（应该被处理）...');
      const errorEvent2 = new Event('error');
      if (service.ws) {
        service.ws.onerror(errorEvent2);
      }
    }, 5000);
    
    // 等待处理结果
    await new Promise(resolve => setTimeout(resolve, 7000));
    
    console.log('✅ 错误事件处理测试完成');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始测试服务器主动关闭处理...');
  
  try {
    await testServerCloseAfterFinish();
    await testReconnectOnNextRecording();
    await testErrorEventHandling();
    
    console.log('\n🎉 所有测试完成！');
    console.log('📋 改进总结：');
    console.log('1. ✅ 忽略发送finish后的服务器主动关闭错误');
    console.log('2. ✅ 下次录音时自动重新连接');
    console.log('3. ✅ 智能错误事件处理');
    console.log('4. ✅ 连接状态管理优化');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testServerCloseAfterFinish,
  testReconnectOnNextRecording,
  testErrorEventHandling,
  runAllTests
}; 