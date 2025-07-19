# API服务说明

## 概述
本项目的API层提供了完整的网络请求和数据处理功能。

## 目录结构
```
src/api/
├── client.ts          # HTTP客户端配置
├── config.ts          # API配置和端点
├── index.ts           # 导出入口
├── types.ts           # 通用类型定义
└── services/          # 具体业务服务
    ├── authService.ts # 认证服务
    ├── userService.ts # 用户服务
    └── postService.ts # 文章服务
```

## 使用方式

### 1. 基础HTTP客户端
```typescript
import { httpClient } from '@/api';

// GET请求
const response = await httpClient.get('/users');

// POST请求
const response = await httpClient.post('/users', userData);
```

### 2. 认证服务

#### 新版登录接口（推荐）
```typescript
import { AuthHelper } from '@/utils/authHelper';

// 自动检测邮箱/手机号登录
const result = await AuthHelper.autoLogin('user@example.com', 'password123');

if (result.success) {
  console.log('登录成功，Token:', result.token);
  
  // 处理应用更新信息
  if (result.updateInfo) {
    const needForceUpdate = AuthHelper.handleAppUpdate(result.updateInfo);
    if (needForceUpdate) {
      // 强制更新，阻止继续操作
      return;
    }
  }
} else {
  console.error('登录失败:', result.error);
}

// 或者手动指定认证类型
const result = await AuthHelper.loginWithDevice(
  '13800138000', 
  'password123', 
  'phone'
);
```

#### 新版注册接口（推荐）
```typescript
import { AuthHelper } from '@/utils/authHelper';

// 使用新版注册接口
const result = await AuthHelper.registerWithToken(
  'user@example.com', 
  'email', 
  'action_token_from_verification'
);

if (result.success) {
  console.log('注册成功:', result.message);
} else {
  console.error('注册失败:', result.error);
}
```

#### 直接使用认证服务
```typescript
import { authService, getDeviceInfo } from '@/api';

// 使用新版登录接口
const deviceInfo = await getDeviceInfo();
const response = await authService.loginWithDevice({
  auth_type: 'email',
  identifier: 'user@example.com',
  password: 'password123',
  device_info: deviceInfo,
});

// 使用新版注册接口
const registerResponse = await authService.registerWithToken({
  auth_type: 'email',
  identifier: 'user@example.com',
  action_token: 'action_token_from_verification',
});

// 发送验证码
await authService.sendVerificationCode({
  phone: '13800138000',
  type: 'login'
});

// 验证验证码
await authService.verifyCode({
  phone: '13800138000',
  verification_code: '123456'
});
```

### 3. 设备信息获取
```typescript
import { getDeviceInfo } from '@/utils/deviceInfo';

// 获取设备信息
const deviceInfo = getDeviceInfo();
console.log('设备信息:', deviceInfo);

// 异步获取（推荐）
const deviceInfo = await getDeviceInfoAsync();
```

### 4. Token管理

系统会自动管理token，无需手动处理：

```typescript
import { httpClient } from '@/api';

// 请求会自动携带token
const response = await httpClient.get('/protected-endpoint');

// 401错误会自动清除token
// 需要重新登录时会自动处理
```

## API接口列表

### 认证接口
- `POST /auth/login` - 新版登录（带设备信息）
- `POST /auth/register` - 新版注册（使用action_token）
- `POST /auth/send_verification_code` - 发送验证码
- `POST /auth/verify_verification_code` - 验证验证码
- `POST /accounts/set_password` - 设置密码

### 用户接口
- `GET /users` - 获取用户列表
- `POST /users` - 创建用户
- `PUT /users/:id` - 更新用户信息

## 新注册接口详情

### 请求参数
```typescript
interface NewRegisterRequest {
  auth_type: 'email' | 'phone';    // 认证类型
  identifier: string;               // 邮箱地址或手机号码
  action_token: string;             // 验证过后后端返回的临时token
}
```

### 响应数据
```typescript
interface RegisterResponse {
  code: number;                     // 状态码
  message: string;                  // 消息
  data: null;                       // 返回数据为空
}
```

## 新登录接口详情

### 请求参数
```typescript
interface NewLoginRequest {
  auth_type: 'email' | 'phone';    // 认证类型
  identifier: string;               // 邮箱地址或手机号码
  password: string;                 // 密码
  device_info: DeviceInfo;          // 设备信息
}

interface DeviceInfo {
  app_version: string;              // 应用版本
  device_model: string;             // 设备型号
  fingerprint: string;              // 设备指纹
  ip_type: string;                  // IP类型
  locale: string;                   // 地区设置
  network_type: string;             // 网络类型
  os_type: string;                  // 操作系统类型
  os_version: string;               // 操作系统版本
  screen_resolution: string;        // 屏幕分辨率
  timezone: string;                 // 时区
}
```

### 响应数据
```typescript
interface LoginResponse {
  code: number;                     // 状态码
  message: string;                  // 消息
  data: {
    token: string;                  // 访问令牌
    app_update_info: {
      latest_version: string;       // 最新版本
      minimum_version: string;      // 最低版本
      update_status: string;        // 更新状态：强制/需要/不需要
      update_message: string;       // 更新说明
      update_url: string;           // 下载链接
    };
  };
}
```

## 注意事项

1. **设备信息获取**：目前使用基础的React Native API，如需更详细的设备信息，建议安装`react-native-device-info`库。

2. **网络状态**：网络类型检测需要安装`@react-native-community/netinfo`库。

3. **token管理**：系统会自动处理token的存储和请求注入，无需手动管理。

4. **应用更新**：登录成功后会返回应用更新信息，根据`update_status`处理相应的更新逻辑。

5. **错误处理**：所有API请求都有统一的错误处理，401错误会自动清除token。

## 开发建议

1. 优先使用`AuthHelper.autoLogin()`进行登录，它会自动处理设备信息获取和认证类型检测。

2. 使用`AuthHelper.registerWithToken()`进行注册，确保action_token的正确传递。

3. 在登录成功后检查应用更新信息，确保用户使用最新版本。

4. 使用TypeScript的类型定义确保API调用的类型安全。

5. 注册流程建议：发送验证码 → 验证验证码获取action_token → 调用注册接口 → 设置密码。 