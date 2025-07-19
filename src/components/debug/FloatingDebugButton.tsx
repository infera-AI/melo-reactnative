/**
 * 悬浮调试按钮 - 固定在屏幕右下角的调试入口
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

interface FloatingDebugButtonProps {
  onPress: () => void;
  visible?: boolean;
}

const FloatingDebugButton: React.FC<FloatingDebugButtonProps> = ({ 
  onPress, 
  visible = true 
}) => {
  // 只在开发环境下显示
  if (!__DEV__ || !visible) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>🔧</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 180, // 距离底部180像素，避免遮挡其他按钮
    right: 20,   // 距离右边20像素
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 999, // 确保悬浮在所有内容之上
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
});

export default FloatingDebugButton; 