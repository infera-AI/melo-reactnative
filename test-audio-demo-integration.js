/**
 * 音频测试Demo集成测试
 * 验证AudioTestDemoScreen是否正确集成到应用中
 */

console.log('=== 音频测试Demo集成验证 ===\n');

// 检查必要的依赖
const requiredDependencies = [
  'react-native-fs',
  '@react-native-documents/picker',
  'ws'
];

console.log('📦 检查依赖项...');
requiredDependencies.forEach(dep => {
  try {
    require(dep);
    console.log(`✅ ${dep} - 已安装`);
  } catch (error) {
    console.log(`❌ ${dep} - 未安装`);
  }
});

console.log('\n📁 检查文件结构...');

const fs = require('fs');
const path = require('path');

// 检查AudioTestDemoScreen文件是否存在
const audioTestDemoPath = './src/components/main/AudioTestDemoScreen.tsx';
if (fs.existsSync(audioTestDemoPath)) {
  console.log('✅ AudioTestDemoScreen.tsx - 文件存在');
} else {
  console.log('❌ AudioTestDemoScreen.tsx - 文件不存在');
}

// 检查App.tsx是否包含音频测试demo的导入
const appTsxPath = './App.tsx';
if (fs.existsSync(appTsxPath)) {
  const appContent = fs.readFileSync(appTsxPath, 'utf8');
  if (appContent.includes('AudioTestDemoScreen')) {
    console.log('✅ App.tsx - 包含AudioTestDemoScreen导入');
  } else {
    console.log('❌ App.tsx - 缺少AudioTestDemoScreen导入');
  }
  
  if (appContent.includes('showAudioTestDemo')) {
    console.log('✅ App.tsx - 包含音频测试demo状态管理');
  } else {
    console.log('❌ App.tsx - 缺少音频测试demo状态管理');
  }
  
  if (appContent.includes('audioTestButton')) {
    console.log('✅ App.tsx - 包含音频测试demo按钮');
  } else {
    console.log('❌ App.tsx - 缺少音频测试demo按钮');
  }
} else {
  console.log('❌ App.tsx - 文件不存在');
}

// 检查main/index.ts是否导出AudioTestDemoScreen
const mainIndexPath = './src/components/main/index.ts';
if (fs.existsSync(mainIndexPath)) {
  const mainIndexContent = fs.readFileSync(mainIndexPath, 'utf8');
  if (mainIndexContent.includes('AudioTestDemoScreen')) {
    console.log('✅ main/index.ts - 导出AudioTestDemoScreen');
  } else {
    console.log('❌ main/index.ts - 缺少AudioTestDemoScreen导出');
  }
} else {
  console.log('❌ main/index.ts - 文件不存在');
}

console.log('\n🎯 集成验证完成！');
console.log('\n📱 使用方法:');
console.log('1. 启动React Native应用');
console.log('2. 点击悬浮调试按钮');
console.log('3. 在调试面板中点击"🧪 音频测试Demo"按钮');
console.log('4. 在音频测试界面中选择音频文件进行测试');
console.log('\n🔧 功能特性:');
console.log('- 支持多种音频格式 (MP3, WAV, M4A, AAC, OGG)');
console.log('- 实时WebSocket连接状态显示');
console.log('- 音频文件上传和验证');
console.log('- 测试进度显示');
console.log('- 测试结果记录和查看');
console.log('- 连接状态监控'); 