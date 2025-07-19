const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== 安装测试依赖 ===\n');

try {
  // 检查是否已安装ws
  try {
    require('ws');
    console.log('✅ ws 依赖已安装');
  } catch (e) {
    console.log('📦 正在安装 ws 依赖...');
    execSync('npm install ws', { stdio: 'inherit' });
    console.log('✅ ws 依赖安装完成');
  }
  
  // 检查是否已安装readline (Node.js内置模块，通常不需要安装)
  console.log('✅ readline 模块可用 (Node.js内置)');
  
  console.log('\n🎉 所有依赖安装完成！');
  console.log('\n现在可以使用以下命令进行测试：');
  console.log('1. 交互式测试: node test-audio-stream-demo.js');
  console.log('2. 命令行测试: node test-audio-simple.js <音频文件路径>');
  
} catch (error) {
  console.error('❌ 安装依赖时出错:', error.message);
  console.log('\n请手动运行以下命令：');
  console.log('npm install ws');
} 