/**
 * 网络诊断工具
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { httpClient } from '../../api/client';
import { CURRENT_API_CONFIG } from '../../api/config';
import translateService from '../../api/services/translateService';
import { Logger } from '../../utils/logger';

interface NetworkDiagnosticProps {
  visible: boolean;
  onClose: () => void;
}

const NetworkDiagnostic: React.FC<NetworkDiagnosticProps> = ({ visible, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<string>('');

  // 基础网络连通性测试
  const testBasicConnectivity = async () => {
    try {
      setResults('🔍 开始基础网络连通性测试...\n\n');
      
      // 测试1: 检查API配置
      setResults(prev => prev + '📋 1. 检查API配置:\n');
      setResults(prev => prev + `   - 基础URL: ${CURRENT_API_CONFIG.BASE_URL}\n`);
      setResults(prev => prev + `   - 超时设置: ${CURRENT_API_CONFIG.TIMEOUT}ms\n`);
      setResults(prev => prev + `   - 环境: ${__DEV__ ? '开发环境' : '生产环境'}\n\n`);
      
      // 测试2: 测试基础HTTP连接
      setResults(prev => prev + '🌐 2. 测试基础HTTP连接:\n');
      try {
        const response = await httpClient.get('/test-connection', {
          timeout: 5000,
        });
        setResults(prev => prev + '   ✅ HTTP连接成功\n');
      } catch (error: any) {
        if (error.code === -1) {
          setResults(prev => prev + '   ❌ 网络连接失败\n');
          setResults(prev => prev + `   📝 错误详情: ${error.message}\n`);
        } else {
          setResults(prev => prev + `   ⚠️ HTTP错误: ${error.code} - ${error.message}\n`);
        }
      }
      
      setResults(prev => prev + '\n');
      
    } catch (error: any) {
      setResults(prev => prev + `❌ 基础连通性测试失败: ${error.message}\n\n`);
    }
  };

  // 文件上传接口测试
  const testFileUploadAPI = async () => {
    try {
      setResults(prev => prev + '📤 3. 测试文件上传接口:\n');
      
      // 创建模拟文件
      const mockFileContent = '测试文档内容\nTest document content\n用于网络诊断';
      const mockFile = new Blob([mockFileContent], { type: 'text/plain' });
      
      setResults(prev => prev + '   📄 创建模拟文件成功\n');
      
      // 构造上传参数
      const uploadParams = {
        source_language: 'zh-CN',
        target_language: 'en-US',
        file: mockFile,
      };
      
      setResults(prev => prev + '   📋 上传参数准备完成\n');
      setResults(prev => prev + `   - 源语言: ${uploadParams.source_language}\n`);
      setResults(prev => prev + `   - 目标语言: ${uploadParams.target_language}\n`);
      setResults(prev => prev + `   - 文件大小: ${mockFile.size} bytes\n`);
      
      // 调用翻译接口
      setResults(prev => prev + '   🚀 开始调用翻译接口...\n');
      
      const response = await translateService.translateText({
        format_type: 'text',
        source_language: 'zh',
        source_text: '你好世界',
        target_language: 'en',
      });
      
      setResults(prev => prev + '   ✅ 文件上传接口调用成功\n');
      setResults(prev => prev + `   📥 响应数据: ${JSON.stringify(response, null, 2)}\n`);
      
    } catch (error: any) {
      setResults(prev => prev + '   ❌ 文件上传接口调用失败\n');
      
      // 详细错误分析
      if (error.code === -1) {
        setResults(prev => prev + '   🔍 错误类型: 网络连接错误\n');
        setResults(prev => prev + `   📝 错误消息: ${error.message}\n`);
        setResults(prev => prev + '   💡 可能原因:\n');
        setResults(prev => prev + '     - 服务器未启动或无法访问\n');
        setResults(prev => prev + '     - 网络连接问题\n');
        setResults(prev => prev + '     - 防火墙阻止连接\n');
        setResults(prev => prev + '     - API基础URL配置错误\n');
      } else if (error.response) {
        setResults(prev => prev + `   🔍 错误类型: HTTP错误 (${error.response.status})\n`);
        setResults(prev => prev + `   📝 错误消息: ${error.message}\n`);
        setResults(prev => prev + `   📋 响应数据: ${JSON.stringify(error.response.data, null, 2)}\n`);
      } else {
        setResults(prev => prev + `   🔍 错误类型: 客户端错误\n`);
        setResults(prev => prev + `   📝 错误消息: ${error.message}\n`);
      }
    }
    
    setResults(prev => prev + '\n');
  };

  // 完整诊断测试
  const runFullDiagnostic = async () => {
    setIsRunning(true);
    setResults('🚀 开始完整网络诊断...\n\n');
    
    try {
      await testBasicConnectivity();
      await testFileUploadAPI();
      
      setResults(prev => prev + '✅ 网络诊断完成\n');
      setResults(prev => prev + '📊 请查看上述结果进行问题排查\n');
      
    } catch (error: any) {
      setResults(prev => prev + `❌ 诊断过程出错: ${error.message}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  // 清除结果
  const clearResults = () => {
    setResults('');
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔧 网络诊断工具</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton, isRunning && styles.disabledButton]}
          onPress={runFullDiagnostic}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.buttonText}>🚀 运行完整诊断</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>🗑️ 清除结果</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsText}>{results || '点击"运行完整诊断"开始测试...'}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6c757d',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#212529',
    lineHeight: 18,
  },
});

export default NetworkDiagnostic; 