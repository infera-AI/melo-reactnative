/**
 * Token存储管理工具 - 处理各种token的本地存储和获取
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// Token存储键名
const TOKEN_KEYS = {
  ACTION_TOKEN: 'action_token',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export type TokenType = keyof typeof TOKEN_KEYS;

class TokenStorage {
  /**
   * 保存token到本地存储
   * @param tokenType token类型
   * @param token token值
   */
  async saveToken(tokenType: TokenType, token: string): Promise<void> {
    try {
      const key = TOKEN_KEYS[tokenType];
      console.log('🔑 saveToken called for:', tokenType, 'key:', key, 'token length:', token.length);
      await AsyncStorage.setItem(key, token);
      console.log('🔑 Token saved successfully:', tokenType);
      
      // 验证保存是否成功
      const savedToken = await AsyncStorage.getItem(key);
      console.log('🔑 Verification - saved token exists:', savedToken ? 'YES' : 'NO');
    } catch (error) {
      console.error('🔑 Failed to save token', tokenType, ':', error);
      throw error;
    }
  }

  /**
   * 从本地存储获取token
   * @param tokenType token类型
   * @returns token值或null
   */
  async getToken(tokenType: TokenType): Promise<string | null> {
    try {
      const key = TOKEN_KEYS[tokenType];
      console.log('🔑 getToken called for:', tokenType, 'key:', key);
      const token = await AsyncStorage.getItem(key);
      console.log('🔑 getToken result for', tokenType, ':', token ? 'EXISTS' : 'NULL');
      return token;
    } catch (error) {
      console.error(`🔑 Failed to get token ${tokenType}:`, error);
      return null;
    }
  }

  /**
   * 删除指定类型的token
   * @param tokenType token类型
   */
  async removeToken(tokenType: TokenType): Promise<void> {
    try {
      const key = TOKEN_KEYS[tokenType];
      await AsyncStorage.removeItem(key);
      console.log(`Token removed: ${tokenType}`);
    } catch (error) {
      console.error(`Failed to remove token ${tokenType}:`, error);
      throw error;
    }
  }

  /**
   * 清除所有token
   */
  async clearAllTokens(): Promise<void> {
    try {
      const keys = Object.values(TOKEN_KEYS);
      await AsyncStorage.multiRemove(keys);
      console.log('All tokens cleared');
    } catch (error) {
      console.error('Failed to clear all tokens:', error);
      throw error;
    }
  }

  /**
   * 保存action_token（便捷方法）
   * @param token action_token值
   */
  async saveActionToken(token: string): Promise<void> {
    return this.saveToken('ACTION_TOKEN', token);
  }

  /**
   * 获取action_token（便捷方法）
   * @returns action_token值或null
   */
  async getActionToken(): Promise<string | null> {
    console.log('🔑 getActionToken called');
    const token = await this.getToken('ACTION_TOKEN');
    console.log('🔑 getActionToken result:', token ? 'EXISTS' : 'NULL');
    return token;
  }

  /**
   * 保存access_token（便捷方法）
   * @param token access_token值
   */
  async saveAccessToken(token: string): Promise<void> {
    return this.saveToken('ACCESS_TOKEN', token);
  }

  /**
   * 获取access_token（便捷方法）
   * @returns access_token值或null
   */
  async getAccessToken(): Promise<string | null> {
    return this.getToken('ACCESS_TOKEN');
  }

  /**
   * 保存refresh_token（便捷方法）
   * @param token refresh_token值
   */
  async saveRefreshToken(token: string): Promise<void> {
    return this.saveToken('REFRESH_TOKEN', token);
  }

  /**
   * 获取refresh_token（便捷方法）
   * @returns refresh_token值或null
   */
  async getRefreshToken(): Promise<string | null> {
    return this.getToken('REFRESH_TOKEN');
  }

  /**
   * 调试方法：检查所有token的状态
   */
  async debugAllTokens(): Promise<void> {
    try {
      console.log('🔍 === Token Storage Debug ===');
      
      // 检查所有token
      for (const [tokenType, key] of Object.entries(TOKEN_KEYS)) {
        const token = await AsyncStorage.getItem(key);
        console.log(`🔍 ${tokenType} (${key}):`, token ? `EXISTS (${token.length} chars)` : 'NULL');
        if (token) {
          console.log(`🔍 ${tokenType} value:`, token.substring(0, 20) + '...');
        }
      }
      
      // 检查所有AsyncStorage的键
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('🔍 All AsyncStorage keys:', allKeys);
      
      console.log('🔍 === End Token Storage Debug ===');
    } catch (error) {
      console.error('🔍 Debug error:', error);
    }
  }
}

// 导出单例实例
export const tokenStorage = new TokenStorage();
export default tokenStorage; 