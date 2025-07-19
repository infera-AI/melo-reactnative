/**
 * 音频文件选择错误诊断脚本
 * 帮助排查HeadphoneTranslationScreen中音频文件选择的错误
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 音频文件选择错误诊断');
console.log('=' .repeat(50));

// 检查环境
function checkEnvironment() {
  console.log('\n📱 环境检查:');
  
  // 检查Node.js版本
  const nodeVersion = process.version;
  console.log(`✅ Node.js版本: ${nodeVersion}`);
  
  // 检查平台
  const platform = process.platform;
  console.log(`✅ 运行平台: ${platform}`);
  
  // 检查工作目录
  const cwd = process.cwd();
  console.log(`✅ 工作目录: ${cwd}`);
  
  // 检查是否存在package.json
  const packageJsonPath = path.join(cwd, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    console.log('✅ package.json存在');
  } else {
    console.log('❌ package.json不存在');
  }
}

// 检查依赖项
function checkDependencies() {
  console.log('\n📦 依赖项检查:');
  
  const dependencies = [
    '@react-native-documents/picker',
    'react-native-fs',
    'react-native'
  ];
  
  dependencies.forEach(dep => {
    try {
      const depPath = require.resolve(dep);
      console.log(`✅ ${dep} - 已安装 (${depPath})`);
    } catch (error) {
      console.log(`❌ ${dep} - 未安装或路径错误`);
    }
  });
}

// 检查文件权限
function checkFilePermissions() {
  console.log('\n🔐 文件权限检查:');
  
  const testPaths = [
    process.cwd(),
    path.join(process.cwd(), 'node_modules'),
    path.join(process.cwd(), 'src')
  ];
  
  testPaths.forEach(testPath => {
    try {
      fs.accessSync(testPath, fs.constants.R_OK);
      console.log(`✅ ${testPath} - 可读`);
    } catch (error) {
      console.log(`❌ ${testPath} - 不可读: ${error.message}`);
    }
    
    try {
      fs.accessSync(testPath, fs.constants.W_OK);
      console.log(`✅ ${testPath} - 可写`);
    } catch (error) {
      console.log(`❌ ${testPath} - 不可写: ${error.message}`);
    }
  });
}

// 模拟DocumentPicker错误
function simulateDocumentPickerErrors() {
  console.log('\n🧪 DocumentPicker错误模拟:');
  
  const errorScenarios = [
    {
      name: '权限被拒绝',
      error: {
        code: 'PERMISSION_DENIED',
        message: '用户拒绝了文件访问权限'
      }
    },
    {
      name: '文件不存在',
      error: {
        code: 'FILE_NOT_FOUND',
        message: '选择的文件不存在'
      }
    },
    {
      name: '网络错误',
      error: {
        code: 'NETWORK_ERROR',
        message: '网络连接失败'
      }
    },
    {
      name: '未知错误',
      error: {
        code: 'UNKNOWN_ERROR',
        message: '发生未知错误'
      }
    },
    {
      name: '用户取消',
      error: {
        code: 'DOCUMENT_PICKER_CANCELED',
        message: '用户取消了文件选择'
      }
    }
  ];
  
  errorScenarios.forEach(scenario => {
    console.log(`\n📋 ${scenario.name}:`);
    console.log(`   错误代码: ${scenario.error.code}`);
    console.log(`   错误信息: ${scenario.error.message}`);
    
    // 模拟错误处理逻辑
    if (scenario.error.code === 'DOCUMENT_PICKER_CANCELED') {
      console.log('   ✅ 正确处理: 用户取消，不显示错误');
    } else {
      console.log('   ⚠️ 应该显示: Alert.alert("选择失败", "无法选择音频文件，请重试")');
    }
  });
}

// 检查Alert.alert可能的问题
function checkAlertIssues() {
  console.log('\n🔔 Alert.alert问题检查:');
  
  const alertIssues = [
    {
      issue: 'React Native环境问题',
      description: 'Alert.alert在开发环境中可能不稳定',
      solution: '使用try-catch包装Alert.alert调用'
    },
    {
      issue: '异步调用问题',
      description: '在异步函数中调用Alert.alert可能有问题',
      solution: '确保在主线程中调用Alert.alert'
    },
    {
      issue: '重复调用问题',
      description: '快速连续调用Alert.alert可能导致问题',
      solution: '添加防抖机制或状态检查'
    },
    {
      issue: '内存问题',
      description: '大量Alert.alert调用可能导致内存泄漏',
      solution: '限制Alert.alert的调用频率'
    }
  ];
  
  alertIssues.forEach(issue => {
    console.log(`\n⚠️ ${issue.issue}:`);
    console.log(`   描述: ${issue.description}`);
    console.log(`   解决方案: ${issue.solution}`);
  });
}

// 提供解决方案
function provideSolutions() {
  console.log('\n💡 解决方案建议:');
  
  const solutions = [
    {
      step: '1. 检查依赖项',
      action: '确保@react-native-documents/picker已正确安装',
      command: 'npm install @react-native-documents/picker --save'
    },
    {
      step: '2. 清理缓存',
      action: '清理React Native缓存',
      command: 'npx react-native start --reset-cache'
    },
    {
      step: '3. 重新安装依赖',
      action: '删除node_modules并重新安装',
      command: 'rm -rf node_modules && npm install'
    },
    {
      step: '4. 检查权限',
      action: '确保应用有文件访问权限',
      command: '检查Android/iOS权限设置'
    },
    {
      step: '5. 调试模式',
      action: '启用详细日志输出',
      command: '在代码中添加更多console.log'
    },
    {
      step: '6. 错误处理改进',
      action: '使用try-catch包装Alert.alert',
      command: '参考已修改的代码'
    }
  ];
  
  solutions.forEach(solution => {
    console.log(`\n${solution.step}: ${solution.action}`);
    console.log(`   命令: ${solution.command}`);
  });
}

// 生成测试代码
function generateTestCode() {
  console.log('\n📝 测试代码生成:');
  
  const testCode = `
// 改进的音频文件选择函数
const handleSelectAudioFile = async () => {
  try {
    console.log('📁 开始选择音频文件...');
    
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.audio],
      copyTo: 'cachesDirectory',
    });

    if (result && result.length > 0) {
      const file = result[0];
      console.log('✅ 文件选择成功:', file);
      
      // 验证文件格式
      const fileExtension = file.name?.split('.').pop()?.toLowerCase();
      if (!fileExtension || !supportedAudioFormats.includes(fileExtension)) {
        console.warn('⚠️ 不支持的格式:', fileExtension);
        try {
          Alert.alert('格式不支持', \`请选择支持的音频格式: \${supportedAudioFormats.join(', ')}\`);
        } catch (alertError) {
          console.error('❌ Alert显示失败:', alertError);
        }
        return;
      }

      // 设置文件信息
      setSelectedAudioFile({
        name: file.name || '未知文件',
        size: file.size || 0,
        type: fileExtension,
        uri: file.uri || '',
      });
      
      console.log('✅ 文件信息已设置');
    }
  } catch (error) {
    console.error('❌ 文件选择失败:', error);
    console.error('❌ 错误详情:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
      try {
        Alert.alert('选择失败', '无法选择音频文件，请重试');
      } catch (alertError) {
        console.error('❌ 错误Alert显示失败:', alertError);
      }
    } else {
      console.log('ℹ️ 用户取消选择');
    }
  }
};
`;

  console.log(testCode);
}

// 运行诊断
function runDiagnosis() {
  console.log('🚀 开始错误诊断...\n');
  
  checkEnvironment();
  checkDependencies();
  checkFilePermissions();
  simulateDocumentPickerErrors();
  checkAlertIssues();
  provideSolutions();
  generateTestCode();
  
  console.log('\n✅ 诊断完成！');
  console.log('\n📋 总结:');
  console.log('   • 检查了环境配置');
  console.log('   • 验证了依赖项安装');
  console.log('   • 分析了可能的错误原因');
  console.log('   • 提供了解决方案');
  console.log('   • 生成了改进的测试代码');
  console.log('\n🔧 建议按照解决方案步骤逐一排查问题。');
}

// 主函数
function main() {
  runDiagnosis();
}

// 运行诊断
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironment,
  checkDependencies,
  checkFilePermissions,
  simulateDocumentPickerErrors,
  checkAlertIssues,
  provideSolutions,
  generateTestCode,
  runDiagnosis
}; 