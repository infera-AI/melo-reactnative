/**
 * 日志配置工具
 */
import { logger, consoleTransport, configLoggerType } from 'react-native-logs';

// 日志级别配置
const defaultConfig: configLoggerType = {
  severity: __DEV__ ? 'debug' : 'error',
  transport: [consoleTransport],
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
  },
};

// 创建日志实例
const log = logger.createLogger(defaultConfig);

// 日志方法封装
export const Logger = {
  /**
   * 调试日志
   */
  debug: (message: string, ...args: any[]) => {
    log.debug(`🔍 ${message}`, ...args);
  },

  /**
   * 信息日志
   */
  info: (message: string, ...args: any[]) => {
    log.info(`ℹ️ ${message}`, ...args);
  },

  /**
   * 警告日志
   */
  warn: (message: string, ...args: any[]) => {
    log.warn(`⚠️ ${message}`, ...args);
  },

  /**
   * 错误日志
   */
  error: (message: string, error?: any) => {
    log.error(`❌ ${message}`, error);
  },

  /**
   * API请求日志
   */
  api: (method: string, url: string, data?: any) => {
    log.debug(`🚀 API ${method.toUpperCase()}: ${url}`, data);
  },

  /**
   * API响应日志
   */
  apiResponse: (method: string, url: string, status: number, data?: any) => {
    const emoji = status >= 200 && status < 300 ? '✅' : '❌';
    log.debug(`${emoji} API Response ${method.toUpperCase()}: ${url} [${status}]`, data);
  },

  /**
   * 性能日志
   */
  performance: (label: string, time: number) => {
    log.debug(`⏱️ Performance: ${label} took ${time}ms`);
  },

  /**
   * 用户行为日志
   */
  userAction: (action: string, params?: any) => {
    log.info(`👤 User Action: ${action}`, params);
  },
};

// 全局错误处理
const setupGlobalErrorHandler = () => {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    Logger.error('Console Error:', args);
    originalConsoleError(...args);
  };

  // React Native错误边界处理
  if (global.ErrorUtils) {
    const originalErrorHandler = global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      Logger.error(`Global Error (Fatal: ${isFatal}):`, error);
      originalErrorHandler(error, isFatal);
    });
  }
};

// 开发环境下设置全局错误处理
if (__DEV__) {
  setupGlobalErrorHandler();
}

export default Logger; 