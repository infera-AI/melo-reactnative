/**
 * 忘记密码设置新密码页面 - 引导用户设置新密码以完成密码重置流程
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useI18n } from '../../hooks/useI18n';
import authService, { ForgotPasswordResetRequest } from '../../api/services/authService';

interface ForgotPasswordResetScreenProps {
  onBack: () => void;
  onResetSuccess: () => void;
  actionToken: string; // 验证码验证成功后返回的临时token
  contactInfo: string; // 手机号或邮箱
  contactType: 'phone' | 'email'; // 联系方式类型
}

const ForgotPasswordResetScreen: React.FC<ForgotPasswordResetScreenProps> = ({
  onBack,
  onResetSuccess,
  actionToken,
  contactInfo,
  contactType,
}) => {
  const { t } = useI18n();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // 验证密码强度
  const validatePassword = (password: string): boolean => {
    // 密码长度6-20位，包含字母和数字
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,20}$/;
    return passwordRegex.test(password);
  };

  // 检查是否可以提交
  const canSubmit = (): boolean => {
    return (
      newPassword.length > 0 &&
      confirmPassword.length > 0 &&
      newPassword === confirmPassword &&
      validatePassword(newPassword)
    );
  };

  // 获取密码强度提示文本
  const getPasswordStrengthText = (): string => {
    if (newPassword.length === 0) {
      return '密码长度6-20位，包含字母和数字';
    }
    if (newPassword.length < 6) {
      return '密码长度至少6位';
    }
    if (newPassword.length > 20) {
      return '密码长度不能超过20位';
    }
    if (!validatePassword(newPassword)) {
      return '密码必须包含字母和数字';
    }
    return '密码强度符合要求';
  };

  // 获取密码确认状态文本
  const getPasswordConfirmText = (): string => {
    if (confirmPassword.length === 0) {
      return '请再次输入密码';
    }
    if (newPassword !== confirmPassword) {
      return '两次输入的密码不一致';
    }
    return '密码确认正确';
  };

  // 处理密码重置
  const handleResetPassword = async () => {
    if (!canSubmit()) return;

    setIsResetting(true);

    try {
      const resetParams: ForgotPasswordResetRequest = {
        action_token: actionToken,
        auth_type: contactType,
        identifier: contactInfo,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };

      const response = await authService.forgotPasswordReset(resetParams);

      if (response.code === 200) {
        // 密码重置成功，直接回调给流程管理器
        onResetSuccess();
      } else {
        Alert.alert(
          t('common.error') || '重置失败',
          response.message || '密码重置失败，请重试'
        );
      }
    } catch (error: any) {
      console.error('密码重置失败:', error);
      Alert.alert(
        t('common.error') || '重置失败',
        error.message || '网络错误，请重试'
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>设置新密码</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 页面描述 */}
        <Text style={styles.description}>
          请为您的Lingo账号设置一个安全的登录密码。
        </Text>

        {/* 新密码输入区域 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>新密码</Text>
          <View style={styles.passwordInputWrapper}>
                         <TextInput
               style={styles.passwordInput}
               placeholder="请输入新密码 (6-20位，包含字母和数字)"
               value={newPassword}
               onChangeText={setNewPassword}
               secureTextEntry={!showNewPassword}
               autoCapitalize="none"
               editable={!isResetting}
             />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showNewPassword ? '👁' : '👁‍🗨'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[
            styles.hintText,
            newPassword.length > 0 && validatePassword(newPassword) ? styles.hintTextSuccess : 
            newPassword.length > 0 ? styles.hintTextError : styles.hintTextNormal
          ]}>
            {getPasswordStrengthText()}
          </Text>
        </View>

        {/* 确认密码输入区域 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>确认新密码</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="请再次输入新密码"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!isResetting}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showConfirmPassword ? '👁' : '👁‍🗨'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[
            styles.hintText,
            confirmPassword.length > 0 && newPassword === confirmPassword ? styles.hintTextSuccess : 
            confirmPassword.length > 0 ? styles.hintTextError : styles.hintTextNormal
          ]}>
            {getPasswordConfirmText()}
          </Text>
        </View>
      </View>

      {/* 底部按钮区域 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            canSubmit() && !isResetting ? styles.submitButtonActive : styles.submitButtonDisabled,
          ]}
          onPress={handleResetPassword}
          disabled={!canSubmit() || isResetting}
        >
          <Text style={[
            styles.submitButtonText,
            canSubmit() && !isResetting ? styles.submitButtonTextActive : styles.submitButtonTextDisabled,
                     ]}>
             {isResetting ? '修改中...' : '完成修改'}
           </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#374151',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
  hintText: {
    fontSize: 14,
    marginTop: 8,
  },
  hintTextNormal: {
    color: '#6b7280',
  },
  hintTextSuccess: {
    color: '#10b981',
  },
  hintTextError: {
    color: '#ef4444',
  },
  bottomContainer: {
    padding: 20,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#3b82f6',
  },
  submitButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextActive: {
    color: '#ffffff',
  },
  submitButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default ForgotPasswordResetScreen; 