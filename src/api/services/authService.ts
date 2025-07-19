/**
 * 认证服务 - 处理用户认证相关API接口
 */
import httpClient from '../client';
import { API_ENDPOINTS } from '../config';
import { ApiResponse } from '../types';

// 验证码用途枚举
export type AuthPurpose = 
  | 'register'
  | 'login'
  | 'reset_password'
  | 'verify_identity'
  | 'bind_email'
  | 'bind_phone'
  | 'forgot_password';

// 接收方类型
export type RecipientType = 'email' | 'phone';

// 发送验证码请求参数
export interface SendVerificationCodeRequest {
  /**
   * 验证码用途，可选值: [
   * "register",
   * "login", 
   * "reset_password",
   * "verify_identity",
   * "bind_email",
   * "bind_phone",
   * "forgot_password",
   * ]
   */
  auth_purpose: string;
  /**
   * 邮箱地址/手机号码
   */
  identifier: string;
  /**
   * 登录类型 手机号/邮箱
   */
  recipient_type: string;
  [property: string]: any;
}

// 发送验证码响应结果
export interface SendVerificationCodeResponse {
  /**
   * 自定义状态码
   */
  code: number;
  /**
   * 返回数据
   */
  data: null;
  /**
   * 数据说明
   */
  message: string;
  [property: string]: any;
}

// 验证验证码请求参数
export interface VerifyCodeRequest {
  identifier: string;
  verification_code: string;
  auth_purpose: string;
  recipient_type: string;
}





// 设置密码请求参数
export interface SetPasswordRequest {
  password: string;
  confirm_password: string;
  [property: string]: any;
}

// 修改密码请求参数
export interface ModifyPasswordReq {
  /**
   * 确认新密码
   */
  confirm_password: string;
  /**
   * 新密码
   */
  new_password: string;
  /**
   * 旧密码
   */
  old_password: string;
  [property: string]: any;
}

// 忘记密码重设请求参数
export interface ForgotPasswordResetRequest {
  /**
   * 验证过后后端返回的临时token
   */
  action_token: string;
  /**
   * 可选值: "email" 或 "phone"
   */
  auth_type: string;
  /**
   * 确认新密码
   */
  confirm_password: string;
  /**
   * 邮箱地址或手机号码
   */
  identifier: string;
  /**
   * 新密码
   */
  new_password: string;
  [property: string]: any;
}

// 通用响应结果
export interface CommonResult {
  /**
   * 自定义状态码
   */
  code: number;
  /**
   * 返回数据
   */
  data: null;
  /**
   * 数据说明
   */
  message: string;
  [property: string]: any;
}

// 设备信息
export interface DeviceInfo {
  /**
   * 客户端App版本 (如果是Web应用，可以是浏览器版本或Web App版本)
   */
  app_version: string;
  /**
   * 设备型号 (例如: iPhone 15 Pro Max, Samsung S24, MacBook Pro)
   */
  device_model: string;
  /**
   * 设备指纹哈希
   */
  fingerprint: string;
  /**
   * IP地址类型（公共IP/私有IP/VPN），前端根据判断上传 (可选)
   */
  ip_type: string;
  locale: string;
  network_type: string;
  /**
   * 操作系统类型 (例如: iOS, Android, Windows, macOS, Linux)
   */
  os_type: string;
  /**
   * 操作系统版本
   */
  os_version: string;
  screen_resolution: string;
  timezone: string;
  [property: string]: any;
}

// 新登录请求参数
export interface NewLoginRequest {
  /**
   * 可选值: "email" 或 "phone"
   */
  auth_type: string;
  device_info: DeviceInfo;
  /**
   * 邮箱地址或手机号码
   */
  identifier: string;
  /**
   * 密码
   */
  password: string;
  [property: string]: any;
}



// 应用更新信息
export interface AppUpdateInfo {
  latest_version: string;
  minimum_version: string;
  /**
   * 更新信息说明
   */
  update_message: string;
  /**
   * 更新状态（需要、强制、不需要）
   */
  update_status: string;
  /**
   * APP下载链接
   */
  update_url: string;
  [property: string]: any;
}

// 登录响应数据
export interface LoginRes {
  app_update_info: AppUpdateInfo;
  token: string;
  [property: string]: any;
}

// 登录响应结果
export interface LoginResponse {
  /**
   * 自定义状态码
   */
  code: number;
  /**
   * 返回数据
   */
  data: LoginRes;
  /**
   * 数据说明
   */
  message: string;
  [property: string]: any;
}

// 新版注册请求参数
export interface NewRegisterRequest {
  /**
   * 可选值: "email" 或 "phone"
   */
  auth_type: string;
  /**
   * 邮箱地址或手机号码
   */
  identifier: string;
  /**
   * 验证过后后端返回的临时token
   */
  action_token: string;
  /**
   * 用户所在国际区号
   */
  country_code: string;
}

class AuthService {

  /**
   * 发送注册验证码
   * @param params 验证码发送参数
   * @param params.identifier 邮箱地址/手机号码
   * @param params.recipient_type 接收方类型
   * @returns 发送结果
   */
  async sendRegisterCode({ identifier, recipient_type }: { identifier: string; recipient_type: RecipientType }): Promise<ApiResponse<SendVerificationCodeResponse>> {
    return await httpClient.post<SendVerificationCodeResponse>(
      API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE,
      {
        auth_purpose: 'register',
        identifier,
        recipient_type
      }
    );
  }

  /**
   * 发送登录验证码
   * @param params 验证码发送参数
   * @param params.identifier 邮箱地址/手机号码
   * @param params.recipient_type 接收方类型
   * @returns 发送结果
   */
  async sendLoginCode({ identifier, recipient_type }: { identifier: string; recipient_type: RecipientType }): Promise<ApiResponse<SendVerificationCodeResponse>> {
    return await httpClient.post<SendVerificationCodeResponse>(
      API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE,
      {
        auth_purpose: 'login',
        identifier,
        recipient_type
      }
    );
  }

  /**
   * 发送重置密码验证码
   * @param params 验证码发送参数
   * @param params.identifier 邮箱地址/手机号码
   * @param params.recipient_type 接收方类型
   * @returns 发送结果
   */
  async sendResetPasswordCode({ identifier, recipient_type }: { identifier: string; recipient_type: RecipientType }): Promise<ApiResponse<SendVerificationCodeResponse>> {
    return await httpClient.post<SendVerificationCodeResponse>(
      API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE,
      {
        auth_purpose: 'reset_password',
        identifier,
        recipient_type
      }
    );
  }

  /**
   * 发送身份验证验证码
   * @param params 验证码发送参数
   * @param params.identifier 邮箱地址/手机号码
   * @param params.recipient_type 接收方类型
   * @returns 发送结果
   */
  async sendVerifyIdentityCode({ identifier, recipient_type }: { identifier: string; recipient_type: RecipientType }): Promise<ApiResponse<SendVerificationCodeResponse>> {
    return await httpClient.post<SendVerificationCodeResponse>(
      API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE,
      {
        auth_purpose: 'verify_identity',
        identifier,
        recipient_type
      }
    );
  }

  /**
   * 发送绑定邮箱验证码
   * @param params 验证码发送参数
   * @param params.identifier 邮箱地址
   * @param params.recipient_type 接收方类型，默认为'email'
   * @returns 发送结果
   */
  async sendBindEmailCode({ identifier, recipient_type = 'email' }: { identifier: string; recipient_type?: RecipientType }): Promise<ApiResponse<SendVerificationCodeResponse>> {
    return await httpClient.post<SendVerificationCodeResponse>(
      API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE,
      {
        auth_purpose: 'bind_email',
        identifier,
        recipient_type
      }
    );
  }

  /**
   * 发送绑定手机验证码
   * @param params 验证码发送参数
   * @param params.identifier 手机号码
   * @param params.recipient_type 接收方类型，默认为'phone'
   * @returns 发送结果
   */
  async sendBindPhoneCode({ identifier, recipient_type = 'phone' }: { identifier: string; recipient_type?: RecipientType }): Promise<ApiResponse<SendVerificationCodeResponse>> {
    return await httpClient.post<SendVerificationCodeResponse>(
      API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE,
      {
        auth_purpose: 'bind_phone',
        identifier,
        recipient_type
      }
    );
  }

  /**
   * 发送忘记密码验证码
   * @param params 验证码发送参数
   * @param params.identifier 邮箱地址/手机号码
   * @param params.recipient_type 接收方类型
   * @returns 发送结果
   */
  async sendForgotPasswordCode({ identifier, recipient_type }: { identifier: string; recipient_type: RecipientType }): Promise<ApiResponse<SendVerificationCodeResponse>> {
    return await httpClient.post<SendVerificationCodeResponse>(
      API_ENDPOINTS.AUTH.SEND_VERIFICATION_CODE,
      {
        auth_purpose: 'forgot_password',
        identifier,
        recipient_type
      }
    );
  }

  /**
   * 验证验证码
   * @param params 验证码验证参数
   * @param params.identifier 邮箱地址/手机号码
   * @param params.verification_code 验证码
   * @param params.auth_purpose 验证码用途
   * @param params.recipient_type 接收方类型
   * @returns 验证结果
   */
  async verifyCode({ identifier, verification_code, auth_purpose, recipient_type }: VerifyCodeRequest): Promise<ApiResponse<any>> {
    return await httpClient.post(
      API_ENDPOINTS.AUTH.VERIFY_CODE,
      {
        identifier,
        verification_code,
        auth_purpose,
        recipient_type
      }
    );
  }



  /**
   * 新版登录接口（带设备信息）
   * @param params 登录参数
   * @param params.auth_type 认证类型 ("email" 或 "phone")
   * @param params.identifier 邮箱地址或手机号码
   * @param params.password 密码
   * @param params.device_info 设备信息
   * @returns 登录结果
   */
  async loginWithDevice(params: NewLoginRequest): Promise<ApiResponse<LoginRes>> {
    const response = await httpClient.post<LoginRes>(
      API_ENDPOINTS.AUTH.LOGIN,
      params
    );
    
    // 如果登录成功，保存token到httpClient
    if (response.code === 200 && response.data?.token) {
      console.log('🔑 登录成功，保存action_token:', response.data.token);
      await httpClient.setActionToken(response.data.token);
    }
    
    return response;
  }



  /**
   * 首次设置密码
   * @param params 设置密码参数
   * @param params.password 密码
   * @param params.confirm_password 确认密码
   * @returns 设置结果
   */
  async setPassword(params: SetPasswordRequest): Promise<ApiResponse<CommonResult>> {
    return await httpClient.post<CommonResult>(
      API_ENDPOINTS.AUTH.SET_PASSWORD,
      params
    );
  }

  /**
   * 修改密码
   * @param params 修改密码参数
   * @param params.old_password 旧密码
   * @param params.new_password 新密码
   * @param params.confirm_password 确认新密码
   * @returns 修改结果
   */
  async modifyPassword(params: ModifyPasswordReq): Promise<ApiResponse<CommonResult>> {
    return await httpClient.post<CommonResult>(
      API_ENDPOINTS.AUTH.MODIFY_PASSWORD,
      params
    );
  }



  /**
   * 新版注册接口（使用action_token）
   * @param params 注册参数
   * @param params.auth_type 认证类型 ("email" 或 "phone")
   * @param params.identifier 邮箱地址或手机号码
   * @param params.action_token 验证过后后端返回的临时token
   * @returns 注册结果
   */
  async registerWithToken(params: NewRegisterRequest): Promise<ApiResponse<CommonResult>> {
    return await httpClient.post<CommonResult>(
      API_ENDPOINTS.AUTH.REGISTER,
      params
    );
  }

  /**
   * 忘记密码重设密码
   * @param params 重设密码参数
   * @param params.action_token 验证过后后端返回的临时token
   * @param params.auth_type 认证类型 ("email" 或 "phone")
   * @param params.identifier 邮箱地址或手机号码
   * @param params.new_password 新密码
   * @param params.confirm_password 确认新密码
   * @returns 重设结果
   */
  async forgotPasswordReset(params: ForgotPasswordResetRequest): Promise<ApiResponse<CommonResult>> {
    return await httpClient.post<CommonResult>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET,
      params
    );
  }
}

export const authService = new AuthService();
export default authService; 