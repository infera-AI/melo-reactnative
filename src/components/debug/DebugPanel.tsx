/**
 * 调试面板 - 网络监控、设备信息和性能分析工具
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
  Share,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
// import DeviceInfo from 'react-native-device-info';
import { networkMonitor } from '../../utils/networkMonitor';
import { Logger } from '../../utils/logger';
import { useI18n } from '../../hooks/useI18n';
import authService from '../../api/services/authService';
import NetworkDiagnostic from './NetworkDiagnostic';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ visible, onClose }) => {
  const { t, isReady } = useI18n();
  const [activeTab, setActiveTab] = useState<'network' | 'device' | 'logs' | 'performance' | 'api-test'>('network');
  const [deviceInfo, setDeviceInfo] = useState<any>({});
  const [networkStats, setNetworkStats] = useState<any>({});
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestDetail, setShowRequestDetail] = useState(false);

  // API测试相关状态
  const [testIdentifier, setTestIdentifier] = useState('test@example.com');
  const [testRecipientType, setTestRecipientType] = useState<'email' | 'phone'>('email');
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  // 网络诊断相关状态
  const [showNetworkDiagnostic, setShowNetworkDiagnostic] = useState(false);

  useEffect(() => {
    if (visible && isReady) {
      loadDeviceInfo();
      loadNetworkData();
    }
  }, [visible, isReady]);

  const loadDeviceInfo = async () => {
    try {
      const info = {
        platform: require('react-native').Platform.OS,
        platformVersion: require('react-native').Platform.Version,
        screenWidth: Dimensions.get('screen').width,
        screenHeight: Dimensions.get('screen').height,
        windowWidth: Dimensions.get('window').width,
        windowHeight: Dimensions.get('window').height,
        timestamp: new Date().toISOString(),
        debugMode: __DEV__ ? 'Development' : 'Production',
        // 模拟设备信息
        deviceName: 'React Native Device',
        brand: require('react-native').Platform.OS === 'ios' ? 'Apple' : 'Android',
        model: 'Simulator/Emulator',
        version: '1.0.0',
        isEmulator: true,
      };
      setDeviceInfo(info);
    } catch (error) {
      Logger.error('Failed to load device info:', error);
    }
  };

  const loadNetworkData = () => {
    const stats = networkMonitor.getStats();
    const allRequests = networkMonitor.getRequests();
    setNetworkStats(stats);
    setRequests(allRequests.slice(0, 20)); // 显示最近20个请求
  };

  const clearNetworkData = () => {
    networkMonitor.clearRequests();
    loadNetworkData();
    Logger.info(t('debug.network.networkCleared'));
  };

  const exportNetworkData = async () => {
    try {
      const data = networkMonitor.exportData();
      await Share.share({
        message: data,
        title: t('debug.network.exportTitle'),
      });
    } catch (error) {
      Alert.alert(t('debug.network.exportFailed'), t('debug.network.exportError'));
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatJson = (data: any) => {
    if (!data) return t('common.empty') || 'Empty';
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  };

  const openRequestDetail = (request: any) => {
    setSelectedRequest(request);
    setShowRequestDetail(true);
  };

  const closeRequestDetail = () => {
    setShowRequestDetail(false);
    setSelectedRequest(null);
  };

  const renderNetworkTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>📊 {t('debug.network.stats')}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{networkStats.total}</Text>
            <Text style={styles.statLabel}>{t('debug.network.total')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{networkStats.success}</Text>
            <Text style={styles.statLabel}>{t('debug.network.success')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{networkStats.failed}</Text>
            <Text style={styles.statLabel}>{t('debug.network.failed')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{networkStats.averageTime}ms</Text>
            <Text style={styles.statLabel}>{t('debug.network.avgTime')}</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={loadNetworkData}>
            <Text style={styles.buttonText}>🔄 {t('debug.network.refresh')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={clearNetworkData}>
            <Text style={styles.buttonText}>🗑️ {t('debug.network.clear')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={exportNetworkData}>
            <Text style={styles.buttonText}>📤 {t('debug.network.export')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.diagnosticButton]} 
            onPress={() => setShowNetworkDiagnostic(true)}
          >
            <Text style={styles.buttonText}>🔧 网络诊断</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.requestsContainer}>
        <Text style={styles.sectionTitle}>📋 {t('debug.network.recentRequests')}</Text>
        {requests.map((request) => {
          const hasError = request.error || (request.responseStatus && request.responseStatus >= 400);
          const isSuccess = request.responseStatus && request.responseStatus >= 200 && request.responseStatus < 300;
          
          return (
            <TouchableOpacity 
              key={request.id} 
              style={[
                styles.requestItem,
                hasError && styles.requestItemError,
                isSuccess && styles.requestItemSuccess
              ]}
              onPress={() => openRequestDetail(request)}
            >
              <View style={styles.requestHeader}>
                <Text style={styles.requestMethod}>{request.method}</Text>
                <Text style={styles.requestUrl} numberOfLines={2}>{request.url}</Text>
                <Text style={[
                  styles.requestStatus,
                  { color: hasError ? '#ef4444' : isSuccess ? '#10b981' : '#f59e0b' }
                ]}>
                  {request.error ? 'ERROR' : request.responseStatus || 'PENDING'}
                </Text>
              </View>
              
              {request.duration && (
                <Text style={styles.requestDuration}>⏱️ {formatDuration(request.duration)}</Text>
              )}
              
              {/* 显示详细的错误信息 */}
              {request.error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>❌ 请求错误:</Text>
                  <Text style={styles.errorMessage}>{request.error}</Text>
                  {request.errorDetails && (
                    <Text style={styles.errorDetails}>详情: {JSON.stringify(request.errorDetails, null, 2)}</Text>
                  )}
                </View>
              )}
              
              {/* 显示HTTP错误状态码的详细信息 */}
              {!request.error && request.responseStatus >= 400 && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>⚠️ HTTP错误 {request.responseStatus}:</Text>
                  <Text style={styles.errorMessage}>
                    {getHttpStatusMessage(request.responseStatus)}
                  </Text>
                  {request.responseData && (
                    <Text style={styles.errorDetails} numberOfLines={3}>
                      响应: {typeof request.responseData === 'string' 
                        ? request.responseData 
                        : JSON.stringify(request.responseData, null, 2)}
                    </Text>
                  )}
                </View>
              )}
              
              <Text style={styles.tapToViewText}>👆 {t('common.tapToView') || '点击查看详情'}</Text>
            </TouchableOpacity>
          );
        })}
        
        {requests.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭 暂无网络请求记录</Text>
            <Text style={styles.emptySubText}>发起API请求后将在这里显示</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // 获取HTTP状态码对应的错误消息
  const getHttpStatusMessage = (status: number): string => {
    const statusMessages: { [key: number]: string } = {
      400: '请求参数错误',
      401: '身份验证失败',
      403: '权限不足',
      404: '资源不存在',
      405: '请求方法不允许',
      408: '请求超时',
      409: '资源冲突',
      422: '请求参数验证失败',
      429: '请求频率过高',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务不可用',
      504: '网关超时',
    };
    
    return statusMessages[status] || `HTTP ${status} 错误`;
  };

  const renderDeviceTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.deviceContainer}>
        <Text style={styles.sectionTitle}>📱 {t('debug.device.info')}</Text>
        {Object.entries(deviceInfo).map(([key, value]) => (
          <View key={key} style={styles.deviceItem}>
            <Text style={styles.deviceLabel}>{key}:</Text>
            <Text style={styles.deviceValue}>
              {typeof value === 'number' && key.includes('Memory') 
                ? formatBytes(value as number)
                : typeof value === 'number' && key === 'batteryLevel'
                ? `${Math.round((value as number) * 100)}%`
                : String(value)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderPerformanceTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.performanceContainer}>
        <Text style={styles.sectionTitle}>⚡ {t('debug.performance.title')}</Text>
        <View style={styles.memoryInfo}>
          <Text style={styles.memoryText}>
            {t('debug.performance.memoryUsage')}: {formatBytes(deviceInfo.usedMemory || 0)} / {formatBytes(deviceInfo.totalMemory || 0)}
          </Text>
          <Text style={styles.memoryText}>
            {t('debug.performance.batteryLevel')}: {Math.round((deviceInfo.batteryLevel || 0) * 100)}%
          </Text>
        </View>
        
        <Text style={styles.sectionTitle}>🐌 {t('debug.performance.slowRequests')}</Text>
        {networkMonitor.getSlowRequests().map((request) => (
          <View key={request.id} style={styles.slowRequestItem}>
            <Text style={styles.slowRequestUrl}>{request.method} {request.url}</Text>
            <Text style={styles.slowRequestTime}>⏱️ {formatDuration(request.duration || 0)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderRequestDetailModal = () => {
    if (!selectedRequest) return null;

    const hasError = selectedRequest.error || (selectedRequest.responseStatus && selectedRequest.responseStatus >= 400);

    return (
      <Modal
        visible={showRequestDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeRequestDetail}
      >
        <View style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>
              {t('common.requestDetails')} - {selectedRequest.method} {selectedRequest.responseStatus || 'PENDING'}
            </Text>
            <TouchableOpacity onPress={closeRequestDetail} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={true}>
            {/* 基本信息 */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📋 基本信息</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>完整URL:</Text>
                <Text style={[styles.detailValue, styles.urlText]} numberOfLines={0}>
                  {selectedRequest.url}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>方法:</Text>
                <Text style={styles.detailValue}>{selectedRequest.method}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>状态:</Text>
                <Text style={[
                  styles.detailValue,
                  { color: hasError ? '#ef4444' : '#10b981' }
                ]}>
                  {selectedRequest.error ? `ERROR: ${selectedRequest.error}` : 
                   selectedRequest.responseStatus || 'PENDING'}
                </Text>
              </View>
              {selectedRequest.duration && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>耗时:</Text>
                  <Text style={styles.detailValue}>{formatDuration(selectedRequest.duration)}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>时间:</Text>
                <Text style={styles.detailValue}>
                  {new Date(selectedRequest.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* 成功响应信息 */}
            {!hasError && selectedRequest.responseStatus && selectedRequest.responseStatus >= 200 && selectedRequest.responseStatus < 300 && (
              <View style={[styles.detailSection, styles.successSection]}>
                <Text style={styles.detailSectionTitle}>✅ 请求成功</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>状态码:</Text>
                  <Text style={[styles.detailValue, { color: '#10b981' }]}>
                    {selectedRequest.responseStatus}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>状态含义:</Text>
                  <Text style={styles.detailValue}>
                    {getHttpStatusMessage(selectedRequest.responseStatus)}
                  </Text>
                </View>
              </View>
            )}

            {/* 错误详情信息 */}
            {hasError && (
              <View style={[styles.detailSection, styles.errorSection]}>
                <Text style={styles.detailSectionTitle}>🚨 错误详情</Text>
                
                {/* 网络错误详情 */}
                {selectedRequest.error && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>错误类型:</Text>
                      <Text style={styles.errorDetailValue}>
                        {getErrorType(selectedRequest.error)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>错误消息:</Text>
                      <Text style={[styles.errorDetailValue, styles.errorMessageText]} numberOfLines={0}>
                        {selectedRequest.error}
                      </Text>
                    </View>
                    {selectedRequest.errorDetails && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>技术详情:</Text>
                        <Text style={[styles.errorDetailValue, styles.jsonText]} numberOfLines={0}>
                          {JSON.stringify(selectedRequest.errorDetails, null, 2)}
                        </Text>
                      </View>
                    )}
                  </>
                )}
                
                {/* HTTP错误详情 */}
                {!selectedRequest.error && selectedRequest.responseStatus >= 400 && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>HTTP状态码:</Text>
                      <Text style={styles.errorDetailValue}>{selectedRequest.responseStatus}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>错误含义:</Text>
                      <Text style={styles.errorDetailValue}>
                        {getHttpStatusMessage(selectedRequest.responseStatus)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>建议解决方案:</Text>
                      <Text style={styles.errorDetailValue}>
                        {getErrorSolution(selectedRequest.responseStatus)}
                      </Text>
                    </View>
                  </>
                )}
                
                {/* 超时信息 */}
                {selectedRequest.duration && selectedRequest.duration > 10000 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>性能问题:</Text>
                    <Text style={styles.errorDetailValue}>
                      请求耗时过长 ({formatDuration(selectedRequest.duration)})，可能存在网络或服务器性能问题
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 请求头 */}
            {selectedRequest.requestHeaders && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>📤 {t('common.requestHeaders')}</Text>
                <View style={styles.jsonContainer}>
                  <Text style={styles.jsonText} numberOfLines={0}>
                    {formatJson(selectedRequest.requestHeaders)}
                  </Text>
                </View>
              </View>
            )}

            {/* 请求参数 */}
            {selectedRequest.requestData && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>📝 {t('common.requestParams')}</Text>
                <View style={styles.jsonContainer}>
                  <Text style={styles.jsonText} numberOfLines={0}>
                    {formatJson(selectedRequest.requestData)}
                  </Text>
                </View>
              </View>
            )}

            {/* 响应头 */}
            {selectedRequest.responseHeaders && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>📥 {t('common.responseHeaders')}</Text>
                <View style={styles.jsonContainer}>
                  <Text style={styles.jsonText} numberOfLines={0}>
                    {formatJson(selectedRequest.responseHeaders)}
                  </Text>
                </View>
              </View>
            )}

            {/* 响应数据 */}
            {selectedRequest.responseData && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>📄 {t('common.responseData')}</Text>
                <View style={styles.jsonContainer}>
                  <Text style={styles.jsonText} numberOfLines={0}>
                    {formatJson(selectedRequest.responseData)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // 获取错误类型
  const getErrorType = (error: string): string => {
    if (error.includes('Network Error') || error.includes('网络错误')) {
      return '网络连接错误';
    } else if (error.includes('timeout') || error.includes('超时')) {
      return '请求超时';
    } else if (error.includes('ECONNREFUSED') || error.includes('连接被拒绝')) {
      return '服务器拒绝连接';
    } else if (error.includes('DNS') || error.includes('域名')) {
      return 'DNS解析失败';
    } else if (error.includes('SSL') || error.includes('certificate')) {
      return 'SSL证书错误';
    } else if (error.includes('CORS')) {
      return '跨域请求错误';
    } else {
      return '未知错误';
    }
  };

  // 获取错误解决方案
  const getErrorSolution = (status: number): string => {
    const solutions: { [key: number]: string } = {
      400: '检查请求参数格式和必填字段',
      401: '检查登录状态和认证token',
      403: '检查用户权限或联系管理员',
      404: '检查API路径是否正确',
      405: '检查HTTP请求方法是否匹配',
      408: '检查网络连接并重试',
      409: '检查数据冲突，可能需要刷新数据',
      422: '检查参数类型和格式要求',
      429: '降低请求频率，稍后重试',
      500: '联系后端开发人员检查服务器日志',
      502: '检查服务器网关配置',
      503: '服务器维护中，稍后重试',
      504: '增加超时时间或检查服务器性能',
    };
    
    return solutions[status] || '联系技术支持获取帮助';
  };

  // 测试sendRegisterCode接口
  const testSendRegisterCode = async () => {
    if (!testIdentifier.trim()) {
      Alert.alert('错误', '请输入测试的邮箱或手机号');
      return;
    }

    setIsTesting(true);
    setTestResult('🔄 正在发送请求...\n');

    try {
      const startTime = Date.now();
      
      // 记录详细的调试信息
      let debugInfo = `🔍 开始诊断测试...\n`;
      debugInfo += `📋 测试参数:\n`;
      debugInfo += `  - identifier: ${testIdentifier}\n`;
      debugInfo += `  - recipient_type: ${testRecipientType}\n`;
      debugInfo += `  - auth_purpose: register\n\n`;

      // 检查httpClient配置
      debugInfo += `🔧 检查HTTP客户端配置:\n`;
      try {
        const { httpClient } = require('../api/httpClient');
        debugInfo += `  ✅ httpClient导入成功\n`;
        debugInfo += `  - 基础配置: ${JSON.stringify(httpClient.defaults?.baseURL || 'undefined')}\n`;
      } catch (error) {
        debugInfo += `  ❌ httpClient导入失败: ${error}\n`;
      }

      // 检查API配置
      debugInfo += `🌐 检查API配置:\n`;
      try {
        const { API_ENDPOINTS, CURRENT_API_CONFIG } = require('../api/config');
        debugInfo += `  ✅ API_ENDPOINTS导入成功\n`;
        debugInfo += `  - 端点路径: ${API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE}\n`;
        debugInfo += `  - 基础URL: ${CURRENT_API_CONFIG.BASE_URL}\n`;
        debugInfo += `  - 超时设置: ${CURRENT_API_CONFIG.TIMEOUT}ms\n`;
        
        // 检查URL格式
        if (CURRENT_API_CONFIG.BASE_URL.includes('https:') && CURRENT_API_CONFIG.BASE_URL.includes(':80')) {
          debugInfo += `  ⚠️ 警告: HTTPS协议不应使用80端口\n`;
        }
        if (CURRENT_API_CONFIG.BASE_URL.includes('http:') && CURRENT_API_CONFIG.BASE_URL.includes(':443')) {
          debugInfo += `  ⚠️ 警告: HTTP协议不应使用443端口\n`;
        }
      } catch (error) {
        debugInfo += `  ❌ API_ENDPOINTS导入失败: ${error}\n`;
      }

      // 网络连通性测试
      debugInfo += `🔗 测试网络连通性:\n`;
      try {
        const { CURRENT_API_CONFIG } = require('../api/config');
        const testUrl = CURRENT_API_CONFIG.BASE_URL;
        debugInfo += `  🎯 目标服务器: ${testUrl}\n`;
        debugInfo += `  📡 正在测试连接...\n`;
      } catch (error) {
        debugInfo += `  ❌ 无法获取服务器配置: ${error}\n`;
      }

      setTestResult(debugInfo + `\n🚀 发送API请求...\n`);
      
      Logger.info('开始测试sendRegisterCode接口', {
        identifier: testIdentifier,
        recipient_type: testRecipientType
      });

      const response = await authService.sendRegisterCode({
        identifier: testIdentifier,
        recipient_type: testRecipientType
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      let result = debugInfo;
      result += `\n✅ 接口调用成功！\n`;
      result += `⏱️ 响应时间: ${duration}ms\n`;
      result += `📥 服务器响应:\n`;
      result += JSON.stringify(response, null, 2);

      setTestResult(result);
      Logger.info('sendRegisterCode测试成功', response);

    } catch (error: any) {
      const endTime = Date.now();
      const duration = endTime - Date.now();

      let result = `❌ 接口调用失败！\n`;
      result += `⏱️ 失败时间: ${duration}ms\n\n`;
      
      // 详细的错误诊断
      result += `🚨 错误详细诊断:\n`;
      result += `📋 请求参数:\n`;
      result += `  - identifier: ${testIdentifier}\n`;
      result += `  - recipient_type: ${testRecipientType}\n`;
      result += `  - auth_purpose: register\n\n`;

      // 检查错误类型
      if (error.response) {
        // HTTP错误响应 (状态码 4xx, 5xx)
        result += `🌐 HTTP响应错误:\n`;
        result += `  - 状态码: ${error.response.status}\n`;
        result += `  - 状态消息: ${error.response.statusText || '未知错误'}\n`;
        result += `  - 响应头: ${JSON.stringify(error.response.headers, null, 2)}\n`;
        result += `  - 响应数据: ${JSON.stringify(error.response.data, null, 2)}\n\n`;
        
        result += `💡 可能原因:\n`;
        if (error.response.status >= 400 && error.response.status < 500) {
          result += `  - 客户端请求问题 (4xx错误)\n`;
          result += `  - 检查请求参数格式和必填字段\n`;
          result += `  - 检查API路径是否正确\n`;
        } else if (error.response.status >= 500) {
          result += `  - 服务器内部错误 (5xx错误)\n`;
          result += `  - 联系后端开发人员检查服务器状态\n`;
        }

      } else if (error.request) {
        // 网络错误 (请求发出但无响应)
        result += `🌐 网络连接错误:\n`;
        result += `  - 错误类型: 无法连接到服务器\n`;
        result += `  - 请求对象: ${JSON.stringify(error.request, null, 2)}\n\n`;
        
        result += `💡 可能原因:\n`;
        result += `  - 服务器未启动或无法访问\n`;
        result += `  - 网络连接问题\n`;
        result += `  - 防火墙阻止连接\n`;
        result += `  - API基础URL配置错误\n`;
        result += `  - CORS跨域问题\n`;

      } else {
        // 客户端错误 (请求配置等问题)
        result += `💻 客户端配置错误:\n`;
        result += `  - 错误消息: ${error.message}\n`;
        result += `  - 错误堆栈: ${error.stack}\n\n`;
        
        result += `💡 可能原因:\n`;
        result += `  - httpClient配置错误\n`;
        result += `  - API端点路径配置错误\n`;
        result += `  - 请求参数序列化问题\n`;
        result += `  - authService代码逻辑错误\n`;
        result += `  - 网络库导入或初始化问题\n\n`;

        result += `🔧 建议检查:\n`;
        result += `  1. 检查 src/api/config.ts 中的 BASE_URL\n`;
        result += `  2. 检查 src/api/httpClient.ts 的配置\n`;
        result += `  3. 检查 authService.ts 的实现\n`;
        result += `  4. 检查网络库 (axios) 是否正确安装\n`;
      }

      // 添加通用调试建议
      result += `\n🛠️ 通用调试步骤:\n`;
      result += `  1. 检查网络连接状态\n`;
      result += `  2. 确认服务器地址和端口\n`;
      result += `  3. 查看浏览器/模拟器的网络控制台\n`;
      result += `  4. 尝试使用Postman等工具直接测试API\n`;
      result += `  5. 检查服务器端的日志输出\n`;

      setTestResult(result);
      Logger.error('sendRegisterCode测试失败', error);
    } finally {
      setIsTesting(false);
    }
  };

  const renderApiTestTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.apiTestContainer}>
        <Text style={styles.sectionTitle}>🧪 API接口测试</Text>
        
        {/* sendRegisterCode接口测试 */}
        <View style={styles.testSection}>
          <Text style={styles.testSectionTitle}>📤 发送注册验证码 (sendRegisterCode)</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>接收方类型:</Text>
            <View style={styles.switchContainer}>
              <Text style={[styles.switchLabel, testRecipientType === 'email' && styles.activeSwitchLabel]}>邮箱</Text>
              <Switch
                value={testRecipientType === 'phone'}
                onValueChange={(value) => {
                  setTestRecipientType(value ? 'phone' : 'email');
                  setTestIdentifier(value ? '+8613800000000' : 'test@example.com');
                }}
                thumbColor={testRecipientType === 'phone' ? '#3b82f6' : '#e2e8f0'}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
              />
              <Text style={[styles.switchLabel, testRecipientType === 'phone' && styles.activeSwitchLabel]}>手机</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              {testRecipientType === 'email' ? '邮箱地址:' : '手机号码:'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={testIdentifier}
              onChangeText={setTestIdentifier}
              placeholder={testRecipientType === 'email' ? '请输入邮箱地址' : '请输入手机号码'}
              keyboardType={testRecipientType === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.testButton, isTesting && styles.testButtonDisabled]}
            onPress={testSendRegisterCode}
            disabled={isTesting}
          >
            <Text style={styles.testButtonText}>
              {isTesting ? '🔄 测试中...' : '🚀 开始测试'}
            </Text>
          </TouchableOpacity>

          {testResult ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>📋 测试结果:</Text>
              <ScrollView style={styles.resultScroll} nestedScrollEnabled>
                <Text style={styles.resultText}>{testResult}</Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setTestResult('')}
              >
                <Text style={styles.clearButtonText}>🗑️ 清除结果</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );

  // 如果i18n还没准备好，不显示模态框
  if (!isReady) {
    return null;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🔧 {t('debug.panel.title')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'network' && styles.activeTab]}
            onPress={() => setActiveTab('network')}
          >
            <Text style={[styles.tabText, activeTab === 'network' && styles.activeTabText]}>
              {t('debug.panel.network')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'device' && styles.activeTab]}
            onPress={() => setActiveTab('device')}
          >
            <Text style={[styles.tabText, activeTab === 'device' && styles.activeTabText]}>
              {t('debug.panel.device')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'performance' && styles.activeTab]}
            onPress={() => setActiveTab('performance')}
          >
            <Text style={[styles.tabText, activeTab === 'performance' && styles.activeTabText]}>
              {t('debug.panel.performance')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'api-test' && styles.activeTab]}
            onPress={() => setActiveTab('api-test')}
          >
            <Text style={[styles.tabText, activeTab === 'api-test' && styles.activeTabText]}>
              API测试
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'network' && renderNetworkTab()}
        {activeTab === 'device' && renderDeviceTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'api-test' && renderApiTestTab()}
      </View>
      
      {renderRequestDetailModal()}
      
      {/* 网络诊断工具 */}
      <NetworkDiagnostic 
        visible={showNetworkDiagnostic}
        onClose={() => setShowNetworkDiagnostic(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  statsContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  requestsContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  requestItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
  },
  requestItemError: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    paddingLeft: 12,
  },
  requestItemSuccess: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    paddingLeft: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestMethod: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3b82f6',
    width: 50,
  },
  requestUrl: {
    flex: 1,
    fontSize: 12,
    color: '#1e293b',
    marginHorizontal: 8,
  },
  requestStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestDuration: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  requestError: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 2,
  },
  errorContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 11,
    color: '#92400e',
    marginBottom: 4,
  },
  errorDetails: {
    fontSize: 10,
    color: '#92400e',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  deviceContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  deviceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  deviceValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  performanceContainer: {
    margin: 16,
  },
  memoryInfo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  memoryText: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  slowRequestItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
  },
  slowRequestUrl: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  slowRequestTime: {
    fontSize: 11,
    color: '#f59e0b',
    marginTop: 4,
  },
  tapToViewText: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // 详情模态框样式
  detailContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1e293b',
    paddingTop: 50,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  detailContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    minWidth: 60,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  jsonContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#475569',
  },
  errorSection: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  errorDetailValue: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  errorMessageText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  urlText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },
  successSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  errorMessageText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  urlText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },
  successSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  // API测试样式
  apiTestContainer: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  testSection: {
    marginBottom: 20,
  },
  testSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 4,
  },
  switchLabel: {
    fontSize: 14,
    color: '#64748b',
    paddingHorizontal: 10,
  },
  activeSwitchLabel: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
    color: '#1e293b',
  },
  testButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#a5b4fc',
    opacity: 0.7,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  resultScroll: {
    maxHeight: 200,
  },
  resultText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  clearButton: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  diagnosticButton: {
    backgroundColor: '#007bff',
  },
});

export default DebugPanel; 