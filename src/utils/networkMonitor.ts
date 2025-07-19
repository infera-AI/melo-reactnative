/**
 * 网络请求监控工具
 */
import { Logger } from './logger';

interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  requestHeaders?: Record<string, string>;
  requestData?: any;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseData?: any;
  duration?: number;
  timestamp: number;
  error?: string;
  errorDetails?: any; // 添加错误详情字段
}

class NetworkMonitor {
  private requests: NetworkRequest[] = [];
  private maxRequests = 100; // 最多保存100个请求记录

  /**
   * 记录请求开始
   */
  logRequest(
    id: string,
    method: string,
    url: string,
    headers?: Record<string, string>,
    data?: any
  ): void {
    const request: NetworkRequest = {
      id,
      method: method.toUpperCase(),
      url,
      requestHeaders: headers,
      requestData: data,
      timestamp: Date.now(),
    };

    this.addRequest(request);
    Logger.api(method, url, data);
  }

  /**
   * 记录请求响应
   */
  logResponse(
    id: string,
    status: number,
    headers?: Record<string, string>,
    data?: any,
    duration?: number
  ): void {
    const requestIndex = this.requests.findIndex(req => req.id === id);
    
    if (requestIndex !== -1) {
      const request = this.requests[requestIndex];
      request.responseStatus = status;
      request.responseHeaders = headers;
      request.responseData = data;
      request.duration = duration || Date.now() - request.timestamp;

      Logger.apiResponse(request.method, request.url, status, data);
      
      if (duration) {
        Logger.performance(`${request.method} ${request.url}`, duration);
      }
    }
  }

  /**
   * 记录请求错误
   */
  logError(id: string, error: string, errorDetails?: any): void {
    const requestIndex = this.requests.findIndex(req => req.id === id);
    
    if (requestIndex !== -1) {
      const request = this.requests[requestIndex];
      request.error = error;
      request.errorDetails = errorDetails;
      request.duration = Date.now() - request.timestamp;

      Logger.error(`API Error ${request.method} ${request.url}:`, error, errorDetails);
    }
  }

  /**
   * 获取所有请求记录
   */
  getRequests(): NetworkRequest[] {
    return [...this.requests].reverse(); // 最新的在前面
  }

  /**
   * 获取失败的请求
   */
  getFailedRequests(): NetworkRequest[] {
    return this.requests.filter(req => 
      req.error || (req.responseStatus && req.responseStatus >= 400)
    );
  }

  /**
   * 获取慢请求（超过指定时间）
   */
  getSlowRequests(threshold: number = 2000): NetworkRequest[] {
    return this.requests.filter(req => 
      req.duration && req.duration > threshold
    );
  }

  /**
   * 清除所有请求记录
   */
  clearRequests(): void {
    this.requests = [];
    Logger.info('Network requests cleared');
  }

  /**
   * 获取请求统计信息
   */
  getStats(): {
    total: number;
    success: number;
    failed: number;
    pending: number;
    averageTime: number;
  } {
    const total = this.requests.length;
    const completed = this.requests.filter(req => req.responseStatus !== undefined || req.error);
    const success = this.requests.filter(req => 
      req.responseStatus && req.responseStatus >= 200 && req.responseStatus < 300
    );
    const failed = this.requests.filter(req => 
      req.error || (req.responseStatus && req.responseStatus >= 400)
    );
    const pending = total - completed.length;
    
    const completedWithDuration = completed.filter(req => req.duration);
    const averageTime = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, req) => sum + (req.duration || 0), 0) / completedWithDuration.length
      : 0;

    return {
      total,
      success: success.length,
      failed: failed.length,
      pending,
      averageTime: Math.round(averageTime),
    };
  }

  /**
   * 添加请求到列表
   */
  private addRequest(request: NetworkRequest): void {
    this.requests.push(request);
    
    // 保持最大请求数量限制
    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(-this.maxRequests);
    }
  }

  /**
   * 生成唯一请求ID
   */
  generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 导出请求数据（用于分析）
   */
  exportData(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      requests: this.requests,
    }, null, 2);
  }
}

// 导出单例实例
export const networkMonitor = new NetworkMonitor();
export default networkMonitor; 