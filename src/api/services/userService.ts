/**
 * 用户相关API服务
 */
import httpClient from '../client';
import { API_ENDPOINTS } from '../config';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  ApiResponse,
} from '../types';

class UserService {
  /**
   * 用户登录 - 使用JSONPlaceholder模拟登录
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      // JSONPlaceholder没有真实的登录端点，我们模拟登录过程
      // 获取用户列表并找到匹配的用户名
      const usersResponse = await httpClient.get<any[]>(API_ENDPOINTS.USER.LOGIN);
      
      // 在实际的JSONPlaceholder响应中直接返回用户数组
      const users = Array.isArray(usersResponse) ? usersResponse : usersResponse.data || [];
      
      // 查找用户名匹配的用户（模拟登录验证）
      const user = users.find((u: any) => 
        u.username === data.username || u.email === data.username
      );
      
      if (user) {
        // 模拟成功的登录响应
        const mockLoginResponse: LoginResponse = {
          accessToken: `mock_token_${user.id}_${Date.now()}`,
          refreshToken: `mock_refresh_${user.id}_${Date.now()}`,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: `https://i.pravatar.cc/150?img=${user.id}`, // 模拟头像
          },
        };
        
        // 保存模拟的token
        await httpClient.setActionToken(mockLoginResponse.accessToken);
        
                 // 返回模拟的成功响应
         return {
           success: true,
           code: 200,
           data: mockLoginResponse,
           message: '登录成功',
         };
      } else {
        throw new Error('用户名或密码错误');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      // 返回格式化的错误
      throw {
        success: false,
        message: error.message || '登录失败',
        data: null,
      };
    }
  }

  /**
   * 用户注册 - 使用JSONPlaceholder模拟注册
   */
  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    try {
      // JSONPlaceholder的POST请求会返回模拟的创建结果
      const response = await httpClient.post<any>(API_ENDPOINTS.USER.REGISTER, {
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone || '',
      });
      
      // 处理JSONPlaceholder的响应格式
      const userData = response.data || response;
      
      const user: User = {
        id: userData.id || 101, // JSONPlaceholder通常返回id 101 for新创建的项目
        username: userData.username,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        avatar: `https://i.pravatar.cc/150?img=${userData.id || 101}`,
      };
      
             return {
         success: true,
         code: 201,
         data: user,
         message: '注册成功',
       };
    } catch (error: any) {
      console.error('Register failed:', error);
      throw {
        success: false,
        message: error.message || '注册失败',
        data: null,
      };
    }
  }

  /**
   * 用户登出
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      // 清除本地token（JSONPlaceholder不需要真实的登出请求）
      await httpClient.clearToken();
      
             return {
         success: true,
         code: 200,
         data: null,
         message: '登出成功',
       };
     } catch (error: any) {
       console.error('Logout failed:', error);
       // 即使失败，也要清除本地token
       await httpClient.clearToken();
       return {
         success: true,
         code: 200,
         data: null,
         message: '登出成功',
       };
    }
  }

  /**
   * 获取用户信息
   */
  async getProfile(userId: number = 1): Promise<ApiResponse<User>> {
    try {
      const response = await httpClient.get<any>(`${API_ENDPOINTS.USER.PROFILE}/${userId}`);
      
      // 处理JSONPlaceholder的用户数据格式
      const userData = response.data || response;
      
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        avatar: `https://i.pravatar.cc/150?img=${userData.id}`,
      };
      
             return {
         success: true,
         code: 200,
         data: user,
         message: '获取用户信息成功',
       };
    } catch (error: any) {
      console.error('Get profile failed:', error);
      throw {
        success: false,
        message: error.message || '获取用户信息失败',
        data: null,
      };
    }
  }

  /**
   * 更新用户信息
   */
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await httpClient.put<any>(
        `${API_ENDPOINTS.USER.UPDATE_PROFILE}/1`, 
        data
      );
      
      const userData = response.data || response;
      
      const user: User = {
        id: userData.id || 1,
        username: userData.username,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        avatar: userData.avatar || `https://i.pravatar.cc/150?img=${userData.id || 1}`,
      };
      
             return {
         success: true,
         code: 200,
         data: user,
         message: '更新用户信息成功',
       };
     } catch (error: any) {
       console.error('Update profile failed:', error);
       throw {
         success: false,
         code: 500,
         message: error.message || '更新用户信息失败',
         data: null,
       };
     }
   }
 
   /**
    * 获取所有用户列表（JSONPlaceholder特有）
    */
   async getAllUsers(): Promise<ApiResponse<User[]>> {
     try {
       const response = await httpClient.get<any[]>(API_ENDPOINTS.USER.LOGIN);
       
       const users = Array.isArray(response) ? response : response.data || [];
       
       const formattedUsers: User[] = users.map((userData: any) => ({
         id: userData.id,
         username: userData.username,
         email: userData.email,
         name: userData.name,
         phone: userData.phone,
         avatar: `https://i.pravatar.cc/150?img=${userData.id}`,
       }));
       
       return {
         success: true,
         code: 200,
         data: formattedUsers,
         message: '获取用户列表成功',
       };
    } catch (error: any) {
      console.error('Get all users failed:', error);
      throw {
        success: false,
        message: error.message || '获取用户列表失败',
        data: null,
      };
    }
  }
}

export const userService = new UserService();
export default userService; 