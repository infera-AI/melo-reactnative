/**
 * 账号注册密码设置页面 - 引导用户为Lingo账号设置登录密码
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

interface SetPasswordScreenProps {
  onBack: () => void;
  onComplete: (password: string) => void;
}

const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({
  onBack,
  onComplete,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 验证密码格式（6-20位，包含字母和数字）
  const validatePassword = (pwd: string): boolean => {
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const validLength = pwd.length >= 6 && pwd.length <= 20;
    return hasLetter && hasNumber && validLength;
  };

  // 检查是否可以完成注册
  const canComplete = (): boolean => {
    return validatePassword(password) && password === confirmPassword && confirmPassword.length > 0;
  };

  // 处理完成注册
  const handleComplete = () => {
    if (!validatePassword(password)) {
      Alert.alert('密码格式错误', '密码必须为6-20位，且包含字母和数字');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('密码不一致', '两次输入的密码不一致，请重新确认');
      return;
    }

    if (canComplete()) {
      onComplete(password);
    }
  };

  // 获取密码强度提示
  const getPasswordHint = (): string => {
    if (password.length === 0) return '';
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const validLength = password.length >= 6 && password.length <= 20;

    if (!validLength) {
      return '密码长度需要6-20位';
    }
    if (!hasLetter) {
      return '密码需要包含字母';
    }
    if (!hasNumber) {
      return '密码需要包含数字';
    }
    return '密码格式正确';
  };

  // 获取确认密码提示
  const getConfirmPasswordHint = (): string => {
    if (confirmPassword.length === 0) return '';
    
    if (password !== confirmPassword) {
      return '两次输入的密码不一致';
    }
    return '密码确认正确';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>设置登录密码</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 引导提示文字 */}
        <Text style={styles.subtitle}>
          请为您的Lingo账号设置一个安全的登录密码。
        </Text>

        {/* 设置密码输入框 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>设置密码</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="请输入密码 (6-20位，包含字母和数字)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>
                {showPassword ? '👁' : '👁‍🗨'}
              </Text>
            </TouchableOpacity>
          </View>
          {password.length > 0 && (
            <Text style={[
              styles.hintText,
              validatePassword(password) ? styles.successHint : styles.errorHint
            ]}>
              {getPasswordHint()}
            </Text>
          )}
        </View>

        {/* 确认密码输入框 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>确认密码</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
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
          {confirmPassword.length > 0 && (
            <Text style={[
              styles.hintText,
              password === confirmPassword ? styles.successHint : styles.errorHint
            ]}>
              {getConfirmPasswordHint()}
            </Text>
          )}
        </View>
      </View>

      {/* 底部按钮区域 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            canComplete() ? styles.completeButtonActive : styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!canComplete()}
        >
          <Text style={[
            styles.completeButtonText,
            canComplete() ? styles.completeButtonTextActive : styles.completeButtonTextDisabled,
          ]}>
            完成注册
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
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
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
    marginLeft: 4,
  },
  successHint: {
    color: '#10b981',
  },
  errorHint: {
    color: '#ef4444',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  completeButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  completeButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  completeButtonTextActive: {
    color: '#ffffff',
  },
  completeButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default SetPasswordScreen; 