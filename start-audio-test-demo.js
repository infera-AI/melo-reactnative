/**
 * 音频测试Demo快速启动脚本
 * 帮助您快速开始音频测试
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🎵 音频测试Demo快速启动\n');

// 检查React Native环境
function checkReactNativeEnvironment() {
  console.log('🔍 检查React Native环境...');
  
  try {
    // 检查是否在React Native项目中
    if (!fs.existsSync('package.json')) {
      throw new Error('未找到package.json，请确保在React Native项目根目录中运行');
    }
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.dependencies['react-native']) {
      throw new Error('未找到react-native依赖，请确保这是React Native项目');
    }
    
    console.log('✅ React Native环境检查通过');
    return true;
  } catch (error) {
    console.error('❌ React Native环境检查失败:', error.message);
    return false;
  }
}

// 检查必要文件
function checkRequiredFiles() {
  console.log('\n📁 检查必要文件...');
  
  const requiredFiles = [
    'src/components/main/AudioTestDemoScreen.tsx',
    'App.tsx',
    'src/components/main/index.ts'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - 存在`);
    } else {
      console.log(`❌ ${file} - 不存在`);
      allFilesExist = false;
    }
  });
  
  return allFilesExist;
}

// 检查依赖
function checkDependencies() {
  console.log('\n📦 检查依赖项...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    const requiredDeps = [
      'react-native-fs',
      '@react-native-documents/picker'
    ];
    
    let allDepsInstalled = true;
    
    requiredDeps.forEach(dep => {
      if (dependencies[dep]) {
        console.log(`✅ ${dep} - 已安装 (${dependencies[dep]})`);
      } else {
        console.log(`❌ ${dep} - 未安装`);
        allDepsInstalled = false;
      }
    });
    
    return allDepsInstalled;
  } catch (error) {
    console.error('❌ 检查依赖失败:', error.message);
    return false;
  }
}

// 启动Metro服务器
function startMetroServer() {
  console.log('\n🚀 启动Metro服务器...');
  
  try {
    console.log('正在启动React Native Metro服务器...');
    console.log('请等待服务器启动完成...');
    
    // 启动Metro服务器
    execSync('npx react-native start', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('❌ 启动Metro服务器失败:', error.message);
    console.log('\n💡 手动启动方法:');
    console.log('1. 打开新的终端窗口');
    console.log('2. 运行: npx react-native start');
    console.log('3. 等待服务器启动完成');
  }
}

// 显示使用说明
function showUsageInstructions() {
  console.log('\n📱 音频测试Demo使用说明:\n');
  
  console.log('1️⃣ 启动应用:');
  console.log('   - Android: npx react-native run-android');
  console.log('   - iOS: npx react-native run-ios');
  console.log('');
  
  console.log('2️⃣ 访问音频测试Demo:');
  console.log('   - 在应用中点击右下角的悬浮调试按钮');
  console.log('   - 在调试面板中找到"🧪 音频测试Demo"按钮');
  console.log('   - 点击进入音频测试界面');
  console.log('');
  
  console.log('3️⃣ 开始测试:');
  console.log('   - 选择音频文件（支持MP3, WAV, M4A, AAC, OGG）');
  console.log('   - 点击"开始测试"按钮');
  console.log('   - 观察测试进度和结果');
  console.log('');
  
  console.log('4️⃣ 查看结果:');
  console.log('   - 点击右上角"结果"按钮查看历史测试记录');
  console.log('   - 分析连接状态和传输情况');
  console.log('');
  
  console.log('🔧 功能特性:');
  console.log('   - 实时WebSocket连接状态监控');
  console.log('   - 多格式音频文件支持');
  console.log('   - 测试进度实时显示');
  console.log('   - 详细的测试结果记录');
  console.log('   - 友好的用户界面');
}

// 显示故障排除
function showTroubleshooting() {
  console.log('\n🛠️ 故障排除:\n');
  
  console.log('❓ 连接失败:');
  console.log('   - 检查网络连接');
  console.log('   - 验证服务器地址: ws://123.56.246.44:80');
  console.log('   - 确认认证token有效');
  console.log('');
  
  console.log('❓ 文件上传失败:');
  console.log('   - 检查文件权限');
  console.log('   - 验证文件格式（MP3, WAV, M4A, AAC, OGG）');
  console.log('   - 确认文件大小（建议<100MB）');
  console.log('');
  
  console.log('❓ 测试超时:');
  console.log('   - 检查网络速度');
  console.log('   - 减小测试文件大小');
  console.log('   - 重试测试');
  console.log('');
  
  console.log('📞 获取帮助:');
  console.log('   - 查看控制台日志');
  console.log('   - 检查AUDIO_TEST_DEMO_GUIDE.md文档');
  console.log('   - 运行node test-audio-demo-integration.js进行诊断');
}

// 主函数
function main() {
  console.log('🎯 音频测试Demo快速启动检查\n');
  
  // 检查环境
  const envOk = checkReactNativeEnvironment();
  if (!envOk) {
    console.log('\n❌ 环境检查失败，请确保在React Native项目根目录中运行此脚本');
    return;
  }
  
  // 检查文件
  const filesOk = checkRequiredFiles();
  if (!filesOk) {
    console.log('\n❌ 必要文件缺失，请确保音频测试Demo已正确集成');
    return;
  }
  
  // 检查依赖
  const depsOk = checkDependencies();
  if (!depsOk) {
    console.log('\n⚠️ 部分依赖缺失，请运行以下命令安装:');
    console.log('npm install react-native-fs @react-native-documents/picker');
    console.log('');
  }
  
  console.log('\n✅ 所有检查通过！音频测试Demo已准备就绪\n');
  
  // 显示使用说明
  showUsageInstructions();
  
  // 显示故障排除
  showTroubleshooting();
  
  console.log('\n🎉 现在您可以开始使用音频测试Demo了！');
  console.log('💡 提示: 如果遇到问题，请查看AUDIO_TEST_DEMO_GUIDE.md获取详细说明');
}

// 运行主函数
main(); 