import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const PermissionGrantScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 背景渐变椭圆 */}
      <View style={styles.backgroundEllipse} />
      <View style={styles.yellowEllipse} />
      <View style={styles.blueEllipse} />
      
      {/* 半透明白色背景 */}
      <View style={styles.glassBackground} />
      
      {/* 同心圆背景 */}
      <View style={[styles.circle, styles.circle3]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle1]} />
      
      {/* 主要内容区域 */}
      <Image 
        source={require('../../assets/images/permission_illustration.png')}
        style={styles.illustration}
        resizeMode="contain"
      />
      
      {/* 底部按钮区域 */}
      <View style={styles.bottomContainer}>
        <Text style={styles.hintText}>说话或点击打断</Text>
        <View style={styles.buttonContainer}>
          <View style={styles.buttonWrapper}>
            <View style={styles.buttonBackground} />
            <TouchableOpacity style={styles.button}>
              <Image 
                source={require('../../assets/images/mic_icon.svg')}
                style={styles.micIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton}>
              <Image 
                source={require('../../assets/images/close_icon.svg')}
                style={styles.closeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <View style={styles.indicator} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF4F4',
  },
  backgroundEllipse: {
    position: 'absolute',
    width: 229,
    height: 229,
    left: 73,
    top: 252,
    backgroundColor: '#84EDF0',
    borderRadius: 114.5,
    opacity: 0.8,
  },
  yellowEllipse: {
    position: 'absolute',
    width: 173,
    height: 173,
    left: -14,
    top: 13,
    backgroundColor: 'rgba(255, 233, 64, 0.31)',
    borderRadius: 86.5,
    opacity: 0.2,
  },
  blueEllipse: {
    position: 'absolute',
    width: 173,
    height: 173,
    left: 234,
    top: -34,
    backgroundColor: 'rgba(35, 187, 194, 0.31)',
    borderRadius: 86.5,
    opacity: 0.2,
  },
  glassBackground: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(255, 255, 255, 0.46)',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  circle1: {
    width: 198,
    height: 198,
    left: 86,
    top: 181,
  },
  circle2: {
    width: 244,
    height: 244,
    left: 63,
    top: 158,
  },
  circle3: {
    width: 287,
    height: 287,
    left: 42,
    top: 136,
  },
  illustration: {
    width: 174,
    height: 162,
    position: 'absolute',
    left: 98,
    top: 199,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 131,
    width: '100%',
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#000000',
    fontFamily: 'Inter',
    marginBottom: 20,
  },
  buttonContainer: {
    width: 334,
    height: 44,
    justifyContent: 'center',
  },
  buttonWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBackground: {
    position: 'absolute',
    width: 44,
    height: 44,
    backgroundColor: 'rgba(35, 187, 194, 0.28)',
    borderRadius: 22,
  },
  button: {
    position: 'absolute',
    width: 38,
    height: 38,
    left: 3,
    backgroundColor: '#23BBC2',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#23BBC2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    width: 12,
    height: 17,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    width: 38,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 12,
    height: 12,
    tintColor: '#FF8181',
  },
  indicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#23BBC2',
    borderRadius: 4,
    left: 157,
    top: 13,
  },
});

export default PermissionGrantScreen; 