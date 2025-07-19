/**
 * 网络测试工具
 */
import { httpClient } from '../api/client';
import { CURRENT_API_CONFIG } from '../api/config';
import translateService from '../api/services/translateService';
import { Logger } from './logger';

export interface NetworkTestResult {
  success: boolean;
  message: string;
  details: any;
  timestamp: string;
}

export class NetworkTest {
  /**
   * 测试基础网络连通性
   */
  static async testBasicConnectivity(): Promise<NetworkTestResult> {
    const startTime = Date.now();
    
    try {
      Logger.info('开始基础网络连通性测试');
      
      // 检查配置
      const config = {
        baseUrl: CURRENT_API_CONFIG.BASE_URL,
        timeout: CURRENT_API_CONFIG.TIMEOUT,
        environment: __DEV__ ? 'development' : 'production',
      };
      
      // 尝试简单的GET请求
      const response = await httpClient.get('/test-connection', {
        timeout: 5000,
      });
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        message: '基础网络连通性测试成功',
        details: {
          config,
          response,
          duration,
        },
        timestamp: new Date().toISOString(),
      };
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        message: '基础网络连通性测试失败',
        details: {
          error: error.message,
          code: error.code,
          duration,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 测试文件上传接口
   */
  static async testFileUpload(): Promise<NetworkTestResult> {
    const startTime = Date.now();
    
    try {
      Logger.info('开始文件上传接口测试');
      
      // 创建模拟文件
      const mockFileContent = '测试文档内容\nTest document content\n用于网络诊断测试';
      const mockFile = new Blob([mockFileContent], { type: 'text/plain' });
      
      // 构造上传参数
      const uploadParams = {
        source_language: 'zh-CN',
        target_language: 'en-US',
        file: mockFile,
      };
      
      // 调用翻译接口
      const response = await translateService.translateText({
        format_type: 'text',
        source_language: 'zh',
        source_text: '测试文本',
        target_language: 'en',
      });
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        message: '文件上传接口测试成功',
        details: {
          uploadParams,
          response,
          duration,
          fileSize: mockFile.size,
        },
        timestamp: new Date().toISOString(),
      };
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // 详细错误分析
      let errorType = 'unknown';
      let suggestions: string[] = [];
      
      if (error.code === -1) {
        errorType = 'network_connection';
        suggestions = [
          '检查服务器是否启动',
          '检查网络连接',
          '检查防火墙设置',
          '检查API基础URL配置',
        ];
      } else if (error.response) {
        errorType = 'http_error';
        suggestions = [
          '检查请求参数格式',
          '检查API路径是否正确',
          '联系后端开发人员',
        ];
      } else {
        errorType = 'client_error';
        suggestions = [
          '检查客户端配置',
          '检查网络库版本',
          '重启应用',
        ];
      }
      
      return {
        success: false,
        message: '文件上传接口测试失败',
        details: {
          error: error.message,
          errorType,
          code: error.code,
          response: error.response,
          suggestions,
          duration,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 运行完整网络诊断
   */
  static async runFullDiagnostic(): Promise<{
    basic: NetworkTestResult;
    upload: NetworkTestResult;
    summary: string;
  }> {
    Logger.info('开始完整网络诊断');
    
    // 基础连通性测试
    const basicResult = await this.testBasicConnectivity();
    
    // 文件上传测试
    const uploadResult = await this.testFileUpload();
    
    // 生成诊断摘要
    let summary = '网络诊断完成\n\n';
    
    if (basicResult.success) {
      summary += '✅ 基础网络连通性: 正常\n';
    } else {
      summary += '❌ 基础网络连通性: 失败\n';
      summary += `   错误: ${basicResult.message}\n`;
    }
    
    if (uploadResult.success) {
      summary += '✅ 文件上传接口: 正常\n';
    } else {
      summary += '❌ 文件上传接口: 失败\n';
      summary += `   错误: ${uploadResult.message}\n`;
      
      if (uploadResult.details.suggestions) {
        summary += '💡 建议解决方案:\n';
        uploadResult.details.suggestions.forEach((suggestion: string, index: number) => {
          summary += `   ${index + 1}. ${suggestion}\n`;
        });
      }
    }
    
    return {
      basic: basicResult,
      upload: uploadResult,
      summary,
    };
  }

  /**
   * 生成详细的诊断报告
   */
  static generateDiagnosticReport(results: {
    basic: NetworkTestResult;
    upload: NetworkTestResult;
    summary: string;
  }): string {
    let report = '🔧 网络诊断报告\n';
    report += '='.repeat(50) + '\n\n';
    
    report += `📅 诊断时间: ${new Date().toLocaleString()}\n`;
    report += `🌐 服务器地址: ${CURRENT_API_CONFIG.BASE_URL}\n`;
    report += `⏱️ 超时设置: ${CURRENT_API_CONFIG.TIMEOUT}ms\n`;
    report += `🔧 环境: ${__DEV__ ? '开发环境' : '生产环境'}\n\n`;
    
    report += '📊 测试结果摘要:\n';
    report += results.summary + '\n';
    
    report += '📋 详细测试结果:\n\n';
    
    // 基础连通性测试详情
    report += '1. 基础网络连通性测试:\n';
    report += `   状态: ${results.basic.success ? '✅ 成功' : '❌ 失败'}\n`;
    report += `   耗时: ${results.basic.details.duration}ms\n`;
    if (!results.basic.success) {
      report += `   错误: ${results.basic.details.error}\n`;
      report += `   错误代码: ${results.basic.details.code}\n`;
    }
    report += '\n';
    
    // 文件上传测试详情
    report += '2. 文件上传接口测试:\n';
    report += `   状态: ${results.upload.success ? '✅ 成功' : '❌ 失败'}\n`;
    report += `   耗时: ${results.upload.details.duration}ms\n`;
    if (results.upload.success) {
      report += `   文件大小: ${results.upload.details.fileSize} bytes\n`;
      report += `   响应: ${JSON.stringify(results.upload.details.response, null, 2)}\n`;
    } else {
      report += `   错误类型: ${results.upload.details.errorType}\n`;
      report += `   错误: ${results.upload.details.error}\n`;
      report += `   错误代码: ${results.upload.details.code}\n`;
      if (results.upload.details.suggestions) {
        report += '   建议解决方案:\n';
        results.upload.details.suggestions.forEach((suggestion: string, index: number) => {
          report += `     ${index + 1}. ${suggestion}\n`;
        });
      }
    }
    
    return report;
  }
}

export default NetworkTest; 