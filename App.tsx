import React, { useState, useEffect } from 'react';
import { StatusBar, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { userService, postService } from './src/api';
import {
  DebugPanel,
  FloatingDebugButton,
  LanguageSelector,
  LoadingScreen,
  BluetoothPairingScreen,
  RegisterScreen,
  SplashScreen,
  WelcomeScreen,
  BasicPermissionScreen,
  VoiceprintCollectionIntroScreen,
  VoiceprintRecordingScreen,
  VoiceprintGenerationScreen,
  VoiceprintPreviewScreen,
  OnboardingCompleteScreen,
  TranslationHomeScreen,
  HeadphoneTranslationScreen,
  OnlineCallTranslationScreen,
  ListenModeScreen,
  SpeakerModeScreen,
  DocumentTranslationScreen,
  AudioTranslationScreen,
  ImageTranslationScreen,
  LingoAssistantScreen,
  ContactsListScreen,
  HummingRecordingScreen,
  LyricsInputScreen,
  MusicLibraryScreen,
  SongDetailScreen,
  CombinedHomeScreen,
  SongConfigScreen,
  MusicHomeScreen,
  RecreateMusicScreen,
} from './src/components';
import AudioTestDemoScreen from './src/components/main/AudioTestDemoScreen';
import { CreateRoleScreen, RoleDetailScreen, EditRoleScreen } from './src/components/contacts';
import {
  LoginScreen,
  ForgotPasswordFlow,
  VerificationLoginFlow,
} from './src/components/auth';
import { Logger } from './src/utils/logger';
import { useI18n } from './src/hooks/useI18n';
import UserStore from './src/stores/UserStore';

// 初始化i18n
import './src/i18n';
import LyricsCreateMusicScreen from './src/components/music/LyricsCreateMusicScreen';

// 创建全局UserStore实例
const userStore = new UserStore();

function App() {
  const [loading, setLoading] = useState(false);
  const [apiResult, setApiResult] = useState<string>('');
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [debugPanelVisible, setDebugPanelVisible] = useState(false);
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);
  const [showBluetoothPairing, setShowBluetoothPairing] = useState(false);
  const [showRegisterScreen, setShowRegisterScreen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerificationLogin, setShowVerificationLogin] = useState(false);
  const [showBasicPermission, setShowBasicPermission] = useState(false);
  const [showVoiceprintCollection, setShowVoiceprintCollection] = useState(false);
  const [showVoiceprintRecording, setShowVoiceprintRecording] = useState(false);
  const [showVoiceprintGeneration, setShowVoiceprintGeneration] = useState(false);
  const [showVoiceprintPreview, setShowVoiceprintPreview] = useState(false);
  const [showOnboardingComplete, setShowOnboardingComplete] = useState(false);
  const [showTranslationHome, setShowTranslationHome] = useState(false);
  const [showHeadphoneTranslation, setShowHeadphoneTranslation] = useState(false);
  const [showOnlineCallTranslation, setShowOnlineCallTranslation] = useState(false);
  const [showListenMode, setShowListenMode] = useState(false);
  const [showSpeakerMode, setShowSpeakerMode] = useState(false);
  const [showDocumentTranslation, setShowDocumentTranslation] = useState(false);
  const [showAudioTranslation, setShowAudioTranslation] = useState(false);
  const [showImageTranslation, setShowImageTranslation] = useState(false);
  const [showLingoAssistant, setShowLingoAssistant] = useState(false);
  const [showContactsList, setShowContactsList] = useState(false);
  const [showAudioTestDemo, setShowAudioTestDemo] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showRoleDetail, setShowRoleDetail] = useState(false);
  const [showEditRole, setShowEditRole] = useState(false);
  const [showMusicHome, setShowMusicHome] = useState(false);
  const [lyricsText, setLyricsText] = useState('');
  const [geners, setGeners] = useState<string[]>([]);
  const [showHummingRecording, setShowHummingRecording] = useState(false);
  const [showLyricsInput, setShowLyricsInput] = useState(false);
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);
  const [showRecreateMusic, setShowRecreateMusic] = useState(false);
  const [showSongDetail, setShowSongDetail] = useState(false);
  const [showSongConfig, setShowSongConfig] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | undefined>(undefined);
  const [selectedRole, setSelectedRole] = useState<any>(undefined);
  const [checkingLoginStatus, setCheckingLoginStatus] = useState(true);
  const [showLyricsCreateMusic, setShowLyricsCreateMusic] = useState(false);
  const [songData, setSongData] = useState<any>(null);

  const { t, getCurrentLanguage, isChinese, isReady } = useI18n();

  // 获取当前语言的显示名称
  const getCurrentLanguageDisplayName = () => {
    const language = getCurrentLanguage();
    switch (language) {
      case 'zh':
        return '中文';
      case 'en':
        return 'English';
      case 'ja':
        return '日本語';
      case 'fr':
        return 'Français';
      case 'es':
        return 'Español';
      default:
        return '中文';
    }
  };

  // 组件挂载时的初始化
  useEffect(() => {
    if (isReady) {
      Logger.info('App initialized with language:', getCurrentLanguage());
      console.log('🚀 应用初始化完成，开始检查登录状态...');
      
      // 设置全局登录跳转处理器
      global.loginRedirectHandler = handleLoginRedirect;
      
      checkLoginStatus();
    }
  }, [getCurrentLanguage, isReady]);

  // 处理登录跳转
  const handleLoginRedirect = () => {
    console.log('🔒 触发登录跳转，清除所有页面状态...');
    
    // 清除所有页面状态
    setShowSplash(false);
    setShowWelcome(false);
    setShowLogin(false);
    setShowForgotPassword(false);
    setShowVerificationLogin(false);
    setShowBasicPermission(false);
    setShowVoiceprintCollection(false);
    setShowVoiceprintRecording(false);
    setShowVoiceprintGeneration(false);
    setShowVoiceprintPreview(false);
    setShowOnboardingComplete(false);
    setShowTranslationHome(false);
    setShowHeadphoneTranslation(false);
    setShowOnlineCallTranslation(false);
    setShowListenMode(false);
    setShowSpeakerMode(false);
    setShowDocumentTranslation(false);
    setShowAudioTranslation(false);
    setShowImageTranslation(false);
    setShowLingoAssistant(false);
    setShowContactsList(false);
    setShowAudioTestDemo(false);
    setShowCreateRole(false);
    setShowRoleDetail(false);
    setShowEditRole(false);
    setShowMusicHome(false);
    setShowHummingRecording(false);
    setShowLyricsInput(false);
    setShowMusicLibrary(false);
    setShowSongDetail(false);
    
    // 显示登录页面
    setShowLogin(true);
    
    // 显示提示
    Alert.alert(
      '登录已过期',
      '您的登录已过期，请重新登录',
      [{ text: '确定', style: 'default' }]
    );
  };

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      setCheckingLoginStatus(true);
      console.log('🔑 开始检查登录状态...');
      
      // 先检查是否有存储的token
      const storedToken = await userStore.getStoredToken();
      console.log('🔑 检查到的存储Token:', storedToken);
      
      // 尝试恢复登录状态
      const hasLoginState = await userStore.restoreLoginState();
      
      if (hasLoginState && userStore.isLoggedIn) {
        console.log('检测到已登录用户');
        console.log('🔑 当前用户登录状态有效');
        
        // 检查引导是否已完成
        const onboardingCompleted = await userStore.checkOnboardingCompleted();
        
        if (onboardingCompleted) {
          console.log('用户已完成引导流程，直接进入翻译主界面');
          // 如果已完成引导，直接跳转到翻译主界面
          setShowSplash(false);
          setShowWelcome(false);
          setShowLogin(false);
          setShowTranslationHome(true);
        } else {
          console.log('用户未完成引导流程，跳转到基础权限页面');
          // 如果未完成引导，跳转到基础权限页面
          setShowSplash(false);
          setShowWelcome(false);
          setShowLogin(false);
          setShowBasicPermission(true);
        }
      } else {
        console.log('未检测到登录状态，显示正常启动流程');
        console.log('🔑 无有效的登录Token');
        // 如果未登录，按正常流程显示启动页
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      // 发生错误时按正常流程显示启动页
    } finally {
      setCheckingLoginStatus(false);
    }
  };

  // 如果i18n还没准备好或正在检查登录状态，显示加载屏幕
  if (!isReady || checkingLoginStatus) {
    return <LoadingScreen />;
  }

  // 测试用户登录API
  const testLogin = async () => {
    setLoading(true);
    try {
      Logger.info(t('api.test.login'));
      
      const response = await userService.login({
        username: 'Bret', // JSONPlaceholder中的真实用户名
        password: 'password123',
      });
      
      setApiResult(`${t('api.result.loginSuccess')}: ${JSON.stringify(response, null, 2)}`);
      Alert.alert(t('common.success'), t('api.result.loginSuccess'));
      Logger.info(t('api.result.loginSuccess'));
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      setApiResult(`${t('api.result.loginFailed')}: ${errorMessage}`);
      Alert.alert(t('common.failed'), `${t('api.result.loginFailed')}: ${errorMessage}`);
      Logger.error(t('api.result.loginFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  // 测试获取文章列表API
  const testGetPosts = async () => {
    setLoading(true);
    try {
      Logger.info(t('api.test.getPosts'));
      
      const response = await postService.getPostList(1, 10);
      
      setApiResult(`${t('api.result.getPostsSuccess')}: ${JSON.stringify(response, null, 2)}`);
      Alert.alert(t('common.success'), t('api.result.getPostsSuccess'));
      Logger.info(t('api.result.getPostsSuccess'));
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      setApiResult(`${t('api.result.getPostsFailed')}: ${errorMessage}`);
      Alert.alert(t('common.failed'), `${t('api.result.getPostsFailed')}: ${errorMessage}`);
      Logger.error(t('api.result.getPostsFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  // 测试创建文章API
  const testCreatePost = async () => {
    setLoading(true);
    try {
      Logger.info(t('api.test.createPost'));
      
      const response = await postService.createPost({
        title: isChinese() ? '测试文章标题' : 'Test Article Title',
        content: isChinese() ? '这是一篇测试文章的内容...' : 'This is test article content...',
        status: 'draft',
      });
      
      setApiResult(`${t('api.result.createPostSuccess')}: ${JSON.stringify(response, null, 2)}`);
      Alert.alert(t('common.success'), t('api.result.createPostSuccess'));
      Logger.info(t('api.result.createPostSuccess'));
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      setApiResult(`${t('api.result.createPostFailed')}: ${errorMessage}`);
      Alert.alert(t('common.failed'), `${t('api.result.createPostFailed')}: ${errorMessage}`);
      Logger.error(t('api.result.createPostFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  // 测试Token存储
  const testTokenStorage = async () => {
    setLoading(true);
    try {
      Logger.info('测试Token存储功能');
      
      // 导入tokenStorage
      const tokenStorage = await import('./src/utils/tokenStorage');
      
      // 测试保存token
      const testToken = `test_token_${Date.now()}`;
      await tokenStorage.default.saveActionToken(testToken);
      console.log('🔑 测试Token已保存:', testToken);
      
      // 测试获取token
      const retrievedToken = await tokenStorage.default.getActionToken();
      console.log('🔑 获取到的Token:', retrievedToken);
      
      // 测试调试功能
      await tokenStorage.default.debugAllTokens();
      
      if (retrievedToken === testToken) {
        setApiResult(`Token存储测试成功: ${testToken}`);
        Alert.alert('成功', 'Token存储测试成功');
      } else {
        throw new Error('Token不匹配');
      }
      
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      setApiResult(`Token存储测试失败: ${errorMessage}`);
      Alert.alert('失败', `Token存储测试失败: ${errorMessage}`);
      Logger.error('Token存储测试失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试Token过期处理
  const testTokenExpired = async () => {
    setLoading(true);
    try {
      Logger.info('测试Token过期处理');
      
      // 模拟一个返回code为1003的响应
      const mockResponse = {
        code: 1003,
        message: 'Token已过期',
        data: null
      };
      
      console.log('🔒 模拟Token过期响应:', mockResponse);
      
      // 手动触发token过期处理
      if (global.loginRedirectHandler) {
        global.loginRedirectHandler();
      }
      
      setApiResult('Token过期处理测试完成');
      Alert.alert('成功', 'Token过期处理测试完成，请查看登录跳转效果');
      
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      setApiResult(`Token过期处理测试失败: ${errorMessage}`);
      Alert.alert('失败', `Token过期处理测试失败: ${errorMessage}`);
      Logger.error('Token过期处理测试失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试文件上传接口
  const testFileUpload = async () => {
    setLoading(true);
    try {
      Logger.info('测试文件上传接口');
      
      // 导入translateService
      const translateService = await import('./src/api/services/translateService');
      
      // 创建一个模拟的文件
      const mockFileContent = '这是一个测试文档的内容\n包含中文和English内容\n用于测试文档翻译功能';
      const mockFile = new Blob([mockFileContent], { type: 'text/plain' } as any);
      
      console.log('📄 创建模拟文件:', mockFile);
      
      // 构造上传参数
      const uploadParams = {
        source_language: 'zh',
        target_language: 'en',
        file: {
          uri: 'mock://test.txt',
          name: 'test.txt',
          type: 'text/plain',
        },
      };
      
      console.log('📤 开始上传文件...');
      
      // 调用文档翻译接口
      const response = await translateService.default.translateDocument(uploadParams);
      
      console.log('📤 文件上传响应:', response);
      
      if (response.code === 200 && response.data.success === 'true') {
        setApiResult(`文件上传成功！\n任务ID: ${response.data.task_id}\n状态: ${response.data.status}`);
        Alert.alert('成功', `文件上传成功！\n任务ID: ${response.data.task_id}`);
      } else {
        throw new Error(response.message || '文件上传失败');
      }
      
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      setApiResult(`文件上传测试失败: ${errorMessage}`);
      Alert.alert('失败', `文件上传测试失败: ${errorMessage}`);
      Logger.error('文件上传测试失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 网络诊断测试
  const testNetworkDiagnostic = async () => {
    setLoading(true);
    try {
      Logger.info('开始网络诊断测试');
      
      // 导入网络测试工具
      const NetworkTest = await import('./src/utils/networkTest');
      
      // 运行完整诊断
      const results = await NetworkTest.default.runFullDiagnostic();
      
      // 生成诊断报告
      const report = NetworkTest.default.generateDiagnosticReport(results);
      
      setApiResult(report);
      
      // 显示摘要
      Alert.alert(
        '网络诊断完成', 
        results.summary,
        [
          { text: '查看详细报告', style: 'default' },
          { text: '确定', style: 'cancel' }
        ]
      );
      
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      setApiResult(`网络诊断失败: ${errorMessage}`);
      Alert.alert('失败', `网络诊断失败: ${errorMessage}`);
      Logger.error('网络诊断失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 测试图片翻译接口
  const testImageTranslation = async () => {
    setLoading(true);
    try {
      Logger.info('测试图片翻译接口');
      
      // 导入translateService
      const translateService = await import('./src/api/services/translateService');
      
      // 创建模拟的图片文件
      const mockImageContent1 = '模拟图片1内容';
      const mockImageContent2 = '模拟图片2内容';
      const mockImage1 = new Blob([mockImageContent1], { type: 'image/png' } as any);
      const mockImage2 = new Blob([mockImageContent2], { type: 'image/jpeg' } as any);
      
      console.log('🖼️ 创建模拟图片文件:', mockImage1, mockImage2);
      
      // 构造上传参数
      const uploadParams = {
        source_language: 'zh',
        target_language: 'en',
        img_files: [
          {
            uri: 'mock://image1.png',
            name: 'image1.png',
            type: 'image/png',
          },
          {
            uri: 'mock://image2.jpg',
            name: 'image2.jpg',
            type: 'image/jpeg',
          },
        ],
      };
      
      console.log('📤 开始上传图片...');
      
      // 调用图片翻译接口
      const response = await translateService.default.translateImage(uploadParams);
      
      console.log('📤 图片翻译响应:', response);
      
      if (response.code === 200 && response.data.task_id) {
        setApiResult(`图片翻译成功！\n任务ID: ${response.data.task_id}\n状态: ${response.data.status || 'processing'}`);
        Alert.alert('成功', `图片翻译成功！\n任务ID: ${response.data.task_id}`);
      } else {
        throw new Error(response.message || '图片翻译失败');
      }
      
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      setApiResult(`图片翻译测试失败: ${errorMessage}`);
      Alert.alert('失败', `图片翻译测试失败: ${errorMessage}`);
      Logger.error('图片翻译测试失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 清除结果
  const clearResult = () => {
    setApiResult('');
    Logger.info(t('api.result.clearResult'));
  };

  // 渲染当前页面内容
  const renderCurrentPage = () => {
    // 如果显示启动页，返回启动页组件
    if (showSplash) {
      return <SplashScreen onFinish={() => {
        setShowSplash(false);
        setShowWelcome(true);
      }} />;
    }

    // 如果显示欢迎页面
    if (showWelcome) {
      return (
        <WelcomeScreen 
          onRegister={() => {
            setShowWelcome(false);
            setShowRegisterScreen(true);
          }}
          onLogin={() => {
            setShowWelcome(false);
            setShowLogin(true);
          }}
        />
      );
    }

    // 如果显示登录页面
    if (showLogin) {
      return (
        <LoginScreen 
          onBack={() => {
            setShowLogin(false);
            setShowWelcome(true);
          }}
          onLoginSuccess={(userStatus, deviceActivated) => {
            console.log('登录成功，用户状态:', userStatus, '设备激活状态:', deviceActivated);
            
            // 登录成功后跳转到基础权限页面
            setShowLogin(false);
            setShowBasicPermission(true);
          }}
          onForgotPassword={() => {
            setShowLogin(false);
            setShowForgotPassword(true);
          }}
          onVerificationLogin={() => {
            setShowLogin(false);
            setShowVerificationLogin(true);
          }}
        />
      );
    }

    // 如果显示验证码登录页面
    if (showVerificationLogin) {
      return (
        <VerificationLoginFlow 
          onBack={() => {
            setShowVerificationLogin(false);
            setShowLogin(true);
          }}
          onLoginSuccess={(userStatus, deviceActivated) => {
            console.log('验证码登录成功，用户状态:', userStatus, '设备激活状态:', deviceActivated);
            
            // 登录成功后跳转到基础权限页面
            setShowVerificationLogin(false);
            setShowBasicPermission(true);
          }}
        />
      );
    }

    // 如果显示基础权限页面
    if (showBasicPermission) {
      return (
        <BasicPermissionScreen
          onNext={() => {
            // 权限设置完成后跳转到AI声纹采集页面
            setShowBasicPermission(false);
            setShowVoiceprintCollection(true);
          }}
          onSkip={() => {
            // 跳过权限设置，直接跳转到蓝牙配对页面
            setShowBasicPermission(false);
            setShowTranslationHome(true);
          }}
        />
      );
    }

    // 如果显示AI声纹采集页面
    if (showVoiceprintCollection) {
      return (
        <VoiceprintCollectionIntroScreen
          onStartRecording={() => {
            // 开始录制，跳转到页面 4.2 - AI声纹采集录制分段进行中
            console.log('开始AI声纹录制');
            setShowVoiceprintCollection(false);
            setShowVoiceprintRecording(true);
          }}
          onSkip={() => {
            // 跳过声纹采集，直接跳转到蓝牙配对页面
            setShowVoiceprintCollection(false);
            setShowTranslationHome(true);
          }}
        />
      );
    }

    // 如果显示AI声纹录制页面
    if (showVoiceprintRecording) {
      return (
        <VoiceprintRecordingScreen
          onBack={() => {
            // 返回到AI声纹采集引导页面
            setShowVoiceprintRecording(false);
            setShowVoiceprintCollection(true);
          }}
          onComplete={() => {
            // 录制完成，跳转到页面 4.3 - AI声纹生成音色中
            console.log('AI声纹录制完成，开始生成音色');
            setShowVoiceprintRecording(false);
            setShowVoiceprintGeneration(true);
          }}
          onSkip={() => {
            // 跳过录制，直接跳转到蓝牙配对页面
            setShowVoiceprintRecording(false);
            setShowTranslationHome(true);
          }}
        />
      );
    }

    // 如果显示AI声纹生成页面
    if (showVoiceprintGeneration) {
      return (
        <VoiceprintGenerationScreen
          onComplete={() => {
            // 生成完成，跳转到音色预览页面
            console.log('AI声纹生成完成');
            setShowVoiceprintGeneration(false);
            setShowVoiceprintPreview(true);
          }}
          onError={() => {
            // 生成失败，跳转到蓝牙配对页面
            console.log('AI声纹生成失败');
            setShowVoiceprintGeneration(false);
            setShowTranslationHome(true);
          }}
        />
      );
    }

    // 如果显示音色预览页面
    if (showVoiceprintPreview) {
      return (
        <VoiceprintPreviewScreen
          onBack={() => {
            // 返回到生成页面
            setShowVoiceprintPreview(false);
            setShowVoiceprintGeneration(true);
          }}
          onRetry={() => {
            // 重新录制，返回到页面4.1
            setShowVoiceprintPreview(false);
            setShowVoiceprintGeneration(false);
            setShowVoiceprintRecording(false);
            setShowVoiceprintCollection(true);
          }}
          onConfirm={async () => {
            // 确认音色完成，标记引导完成并直接进入翻译主界面
            console.log('确认音色完成，标记引导完成');
            
            try {
              // 标记引导流程已完成
              await userStore.markOnboardingCompleted();
              
              // 直接跳转到翻译主界面
              setShowVoiceprintPreview(false);
              setShowTranslationHome(true);
              
              console.log('引导流程完成，已进入翻译主界面');
            } catch (error) {
              console.error('标记引导完成失败:', error);
              // 如果标记失败，仍然跳转到翻译主界面
              setShowVoiceprintPreview(false);
              setShowTranslationHome(true);
            }
          }}
        />
      );
    }

    // 如果显示引导完成页面
    if (showOnboardingComplete) {
      return (
        <OnboardingCompleteScreen
          onEnterApp={() => {
            // 进入应用主界面（翻译主页）
            console.log('进入Lingo翻译主界面');
            setShowOnboardingComplete(false);
            setShowTranslationHome(true);
          }}
        />
      );
    }

    // 如果显示翻译主页面
    if (showTranslationHome) {
      return (
        <TranslationHomeScreen
          onNavigateToMode={(mode) => {
            console.log(`导航到${mode}模式`);
            // 导航到具体模式页面
            if (mode === '耳机模式') {
              setShowTranslationHome(false);
              setShowHeadphoneTranslation(true);
            } else if (mode === '线上对话') {
              setShowTranslationHome(false);
              setShowOnlineCallTranslation(true);
            } else if (mode === '单向聆听') {
              setShowTranslationHome(false);
              setShowListenMode(true);
            } else if (mode === '外放模式') {
              setShowTranslationHome(false);
              setShowSpeakerMode(true);
            } else if (mode === '文档翻译') {
              setShowTranslationHome(false);
              setShowDocumentTranslation(true);
            } else {
              Alert.alert('功能提示', `${mode}功能正在开发中`);
            }
          }}
          onNavigateToTool={(tool) => {
            console.log(`导航到${tool}工具`);
            // 导航到具体工具页面
            if (tool === '文档翻译') {
              setShowTranslationHome(false);
              setShowDocumentTranslation(true);
            } else if (tool === '录音翻译') {
              setShowTranslationHome(false);
              setShowAudioTranslation(true);
            } else if (tool === '图像翻译') {
              setShowTranslationHome(false);
              setShowImageTranslation(true);
            } else {
              Alert.alert('功能提示', `${tool}功能正在开发中`);
            }
          }}
          onNavigateToAssistant={() => {
            console.log('导航到Lingo助手');
            setShowTranslationHome(false);
            setShowLingoAssistant(true);
          }}
          onNavigateToMusic={() => {
            console.log('导航到AI音乐主页');
            setShowTranslationHome(false);
            setShowMusicHome(true);
          }}
          onTabSwitch={(tab) => {
            console.log(`切换到${tab}标签`);
            if (tab === 'contacts') {
              setShowTranslationHome(false);
              setShowContactsList(true);
            } else if (tab === 'profile') {
              // 跳转到我的页面
              Alert.alert('功能提示', '我的页面功能正在开发中');
            }
          }}
        />
      );
    }

    // 如果显示耳机模式页面
    if (showHeadphoneTranslation) {
      return (
        <HeadphoneTranslationScreen
          contactName={selectedContact}
          onBack={() => {
            setShowHeadphoneTranslation(false);
            setShowTranslationHome(true);
          }}
          onTabSwitch={(tab) => {
            console.log(`耳机模式页面切换到${tab}标签`);
            if (tab === 'contacts') {
              setShowHeadphoneTranslation(false);
              setShowContactsList(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            } else if (tab === 'translation') {
              setShowHeadphoneTranslation(false);
              setShowTranslationHome(true);
            } else if (tab === 'music') {
              setShowHeadphoneTranslation(false);
              setShowMusicHome(true);
            }
          }}
          onRemoveContact={() => {
            setSelectedContact(undefined);
            // 移除联系人后保持在耳机模式页面，但清空联系人信息
          }}
        />
      );
    }

    // 如果显示线上通话翻译页面
    if (showOnlineCallTranslation) {
      return (
        <OnlineCallTranslationScreen
          onBack={() => {
            setShowOnlineCallTranslation(false);
            setShowTranslationHome(true);
          }}
          onTabSwitch={(tab) => {
            console.log(`线上通话页面切换到${tab}标签`);
            if (tab === 'contacts') {
              setShowOnlineCallTranslation(false);
              setShowContactsList(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            } else if (tab === 'translation') {
              setShowOnlineCallTranslation(false);
              setShowTranslationHome(true);
            } else if (tab === 'music') {
              setShowOnlineCallTranslation(false);
              setShowMusicHome(true);
            }
          }}
        />
      );
    }

    // 如果显示聆听模式页面
    if (showListenMode) {
      return (
        <ListenModeScreen
          onBack={() => {
            setShowListenMode(false);
            setShowTranslationHome(true);
          }}
          onTabSwitch={(tab) => {
            console.log(`聆听模式页面切换到${tab}标签`);
            if (tab === 'contacts') {
              setShowListenMode(false);
              setShowContactsList(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            } else if (tab === 'translation') {
              setShowListenMode(false);
              setShowTranslationHome(true);
            } else if (tab === 'music') {
              setShowListenMode(false);
              setShowMusicHome(true);
            }
          }}
        />
      );
    }

    // 如果显示外放模式页面
    if (showSpeakerMode) {
      return (
        <SpeakerModeScreen
          onBack={() => {
            setShowSpeakerMode(false);
            setSelectedContact(undefined);
            setShowTranslationHome(true);
          }}
          onTabSwitch={(tab) => {
            console.log(`外放模式页面切换到${tab}标签`);
            if (tab === 'contacts') {
              setShowSpeakerMode(false);
              setShowContactsList(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            } else if (tab === 'translation') {
              setShowSpeakerMode(false);
              setShowTranslationHome(true);
            } else if (tab === 'music') {
              setShowSpeakerMode(false);
              setShowMusicHome(true);
            }
          }}
          contactName={selectedContact}
        />
      );
    }

    // 如果显示文档翻译页面
    if (showDocumentTranslation) {
      return (
        <DocumentTranslationScreen
          onBack={() => {
            setShowDocumentTranslation(false);
            setShowTranslationHome(true);
          }}
          onTabSwitch={(tab) => {
            console.log(`文档翻译页面切换到${tab}标签`);
            if (tab === 'contacts') {
              setShowDocumentTranslation(false);
              setShowContactsList(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            } else if (tab === 'translation') {
              setShowDocumentTranslation(false);
              setShowTranslationHome(true);
            } else if (tab === 'music') {
              setShowDocumentTranslation(false);
              setShowMusicHome(true);
            }
          }}
        />
      );
    }

    // 如果显示音频翻译页面
    if (showAudioTranslation) {
      return (
        <AudioTranslationScreen
          onBack={() => {
            setShowAudioTranslation(false);
            setShowTranslationHome(true);
          }}
          onTabSwitch={(tab) => {
            console.log(`音频翻译页面切换到${tab}标签`);
            if (tab === 'contacts') {
              setShowAudioTranslation(false);
              setShowContactsList(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            } else if (tab === 'translation') {
              setShowAudioTranslation(false);
              setShowTranslationHome(true);
            } else if (tab === 'music') {
              setShowAudioTranslation(false);
              setShowMusicHome(true);
            }
          }}
        />
      );
    }

    // 如果显示图像翻译页面
    if (showImageTranslation) {
      return (
        <ImageTranslationScreen
          onBack={() => {
            setShowImageTranslation(false);
            setShowTranslationHome(true);
          }}
          onTabSwitch={(tab) => {
            console.log(`图像翻译页面切换到${tab}标签`);
            if (tab === 'contacts') {
              setShowImageTranslation(false);
              setShowContactsList(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            } else if (tab === 'translation') {
              setShowImageTranslation(false);
              setShowTranslationHome(true);
            } else if (tab === 'music') {
              setShowImageTranslation(false);
              setShowMusicHome(true);
            }
          }}
        />
      );
    }

    // 如果显示Lingo助手页面
    if (showLingoAssistant) {
      return (
        <LingoAssistantScreen
          onBack={() => {
            setShowLingoAssistant(false);
            setShowTranslationHome(true);
          }}
        />
      );
    }

    // 如果显示音频测试Demo页面
    if (showAudioTestDemo) {
      return (
        <AudioTestDemoScreen
          onBack={() => {
            setShowAudioTestDemo(false);
            setShowTranslationHome(true);
          }}
        />
      );
    }

    // 如果显示创建角色页面
    if (showCreateRole) {
      return (
        <CreateRoleScreen
          onBack={() => {
            console.log('返回通讯录列表页面 T2.1');
            setShowCreateRole(false);
            setShowContactsList(true);
          }}
          onSave={(roleData) => {
            console.log('保存新创建的角色信息:', roleData);
            // 这里可以添加保存角色到本地存储或后端的逻辑
            setShowCreateRole(false);
            setShowContactsList(true);
          }}
        />
      );
    }

    // 如果显示角色详情页面
    if (showRoleDetail) {
      return (
        <RoleDetailScreen
          role={selectedRole}
          onBack={() => {
            console.log('返回通讯录列表页面 T2.1');
            setShowRoleDetail(false);
            setSelectedRole(undefined);
            setShowContactsList(true);
          }}
          onEdit={(roleId) => {
            console.log('进入角色编辑页面，角色ID:', roleId);
            setShowRoleDetail(false);
            setShowEditRole(true);
          }}
          onVoiceprintManagement={(roleId) => {
            console.log('进入声纹管理页面 T2.3.3，角色ID:', roleId);
            Alert.alert('功能提示', '声纹管理功能正在开发中');
          }}
          onKnowledgeManagement={(roleId) => {
            console.log('进入知识管理页面 T2.3.4，角色ID:', roleId);
            Alert.alert('功能提示', '知识管理功能正在开发中');
          }}
          onHistoryConversations={(roleId) => {
            console.log('跳转到历史会话页面 T2.3.1，角色ID:', roleId);
            Alert.alert('功能提示', '历史会话功能正在开发中');
          }}
          onSimulateChat={(roleId) => {
            console.log('进入模拟对话练习 T2.4.1，角色ID:', roleId);
            Alert.alert('功能提示', '模拟对话功能正在开发中');
          }}
          onStartChat={(roleId) => {
            console.log('跳转到实时翻译主界面 T1.1.1，角色ID:', roleId);
            // 设置选中的联系人并跳转到耳机模式
            setSelectedContact(selectedRole?.name || roleId);
            setShowRoleDetail(false);
            setSelectedRole(undefined);
            setShowHeadphoneTranslation(true);
          }}
          onDeleteRole={(roleId) => {
            console.log('删除角色，角色ID:', roleId);
            Alert.alert('删除成功', '角色已删除', [
              {
                text: '确定',
                onPress: () => {
                  setShowRoleDetail(false);
                  setSelectedRole(undefined);
                  setShowContactsList(true);
                }
              }
            ]);
          }}
        />
      );
    }

    // 如果显示角色编辑页面
    if (showEditRole) {
      return (
        <EditRoleScreen
          role={selectedRole}
          onBack={() => {
            console.log('返回角色Agent详情页面 T2.3');
            setShowEditRole(false);
            setShowRoleDetail(true);
          }}
          onSave={(roleData) => {
            console.log('保存修改后的角色信息:', roleData);
            // 这里可以添加保存角色到本地存储或后端的逻辑
            // 更新selectedRole数据
            setSelectedRole({
              ...selectedRole,
              name: roleData.name,
              tags: roleData.tags.map(tag => tag.name),
            });
            setShowEditRole(false);
            setShowRoleDetail(true);
          }}
        />
      );
    }


    // 如果显示AI音乐主页 (使用CombinedHomeScreen)
    if (showMusicHome) {
      return (
        <MusicHomeScreen
          onNavigateToRecreateMusic={(text) => {
              console.log('歌词生成歌曲页面');
              setShowMusicHome(false);
              setShowLyricsCreateMusic(true);
              setLyricsText(text);
            }}
          onTabSwitch={(tab) => {
            console.log(`综合主页切换到${tab}标签`);
            if (tab === 'translation') {
              setShowMusicHome(false);
              setShowTranslationHome(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            }
          }}
          onNavigateToMyWorks={() => {
            console.log('导航到我的作品页面');
            setShowMusicHome(false);
            setShowMusicLibrary(true);
          }}
          onNavigateToHumming={() => {
            console.log('导航到哼鸣歌唱页面');
            setShowMusicHome(false);
            setShowHummingRecording(true);
          }}
        />
      );
    }

    // 如果显示歌曲配置与生成页面
    if (showSongConfig) {
      return (
        <SongConfigScreen
          songData={songData}
          onBack={() => {
            console.log('从歌曲配置页面返回到综合主页');
            setShowSongConfig(false);
            setShowMusicHome(true);
          }}
          onNavigateToMyWorks={() => {
            console.log('导航到我的作品页面');
            setShowSongConfig(false);
            setShowMusicLibrary(true);
          }}
        />
      );
    }

    // 显示歌词生成歌曲页面
    if (showLyricsCreateMusic) {
      return (
        <LyricsCreateMusicScreen
          lyricsText={lyricsText}
          geners={geners}
          onNavigateToSongConfig={(data) => {
            setShowLyricsCreateMusic(false);
            setShowSongConfig(true);
            setSongData(data);
          }}
          onBack={() => {
            setShowLyricsCreateMusic(false);
            setShowMusicHome(true);
          }}
        />
      );
    }

    // 如果显示哼唱录制页面
    if (showHummingRecording) {
      return (
        <HummingRecordingScreen
        onNavigateToLyricsCreateMusic={(data) => {
          setShowHummingRecording(false);
          setShowLyricsCreateMusic(true);
          setLyricsText(data.work_lyrics);
          setGeners(data.work_genres);
          console.log('哼唱成曲成功:', data.work_lyrics, data.work_genres);
        }}
          onBack={() => {
            console.log('返回AI音乐主页');
            setShowHummingRecording(false);
            setShowMusicHome(true);
          }}
          onRecordingComplete={(audioData) => {
            console.log('哼唱录制完成，音频数据:', audioData);
            // 这里应该跳转到M1.3页面
            Alert.alert('录制完成', '音高分析完成，即将进入下一步', [
              {
                text: '确定',
                onPress: () => {
                  setShowHummingRecording(false);
                  setShowMusicHome(true);
                }
              }
            ]);
          }}
          onUploadAudio={() => {
            console.log('上传音频功能');
            Alert.alert('功能提示', '上传音频功能正在开发中');
          }}
          onNextStep={() => {
            console.log('下一步功能');
            Alert.alert('功能提示', '下一步功能正在开发中');
          }}
          onTabSwitch={(tab) => {
            console.log(`哼唱录制页面切换到${tab}标签`);
            if (tab === 'translation') {
              setShowHummingRecording(false);
              setShowTranslationHome(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            }
            // music tab 保持在当前音乐功能模块中
          }}
        />
      );
    }

    // 如果显示歌词输入页面
    if (showLyricsInput) {
      return (
        <LyricsInputScreen
          onBack={() => {
            console.log('返回AI音乐主页');
            setShowLyricsInput(false);
            setShowMusicHome(true);
          }}
          onNextStep={(lyricsData) => {
            console.log('歌词输入完成，数据:', lyricsData);
            // 这里应该跳转到M1.3页面
            Alert.alert('歌词输入完成', '即将进入下一步', [
              {
                text: '确定',
                onPress: () => {
                  setShowLyricsInput(false);
                  setShowMusicHome(true);
                }
              }
            ]);
          }}
          onTabSwitch={(tab) => {
            console.log(`歌词输入页面切换到${tab}标签`);
            if (tab === 'translation') {
              setShowLyricsInput(false);
              setShowTranslationHome(true);
            } else if (tab === 'contacts') {
              setShowLyricsInput(false);
              setShowContactsList(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            } else if (tab === 'shortplay') {
              Alert.alert('功能提示', '短剧功能正在开发中');
            }
          }}
        />
      );
    }

    // 如果显示音乐库页面
    if (showMusicLibrary) {
      return (
        <MusicLibraryScreen
        onNavigateToRecreateMusic={(songId) => {
            setShowMusicLibrary(false);
            setShowRecreateMusic(true); 
            setSelectedSongId(songId);
          }}
          onBack={() => {
            setShowMusicLibrary(false);
            setShowMusicHome(true);
          }}
          onNavigateToSongDetail={(songId) => {
            setShowMusicLibrary(false);
            setShowSongDetail(true);
            setSelectedSongId(songId);
          }}
          onNavigateToHome={() => {
            setShowMusicLibrary(false);
            setShowMusicHome(true);
          }}
        />
      );
    }
    // 如果显示歌曲重置页面
    if (showRecreateMusic) {
      return (
        <RecreateMusicScreen  
          onRegenerate={() => {
            setShowRecreateMusic(false);
            setShowMusicLibrary(true);
          }}
          workId = {selectedSongId}
          onBack={() => {
            setShowRecreateMusic(false);
            setShowMusicLibrary(true);  
          }}
          onNavigateToSongConfig={(data) => {
            console.log('导航到歌曲配置与生成页面');
            setShowRecreateMusic(false);
            setShowSongConfig(true);
            setSongData(data);
          }}
        />
      );
    }

    // 如果显示歌曲详情页面
    if (showSongDetail) {
      return (
        <SongDetailScreen
          onBack={() => {
            setShowSongDetail(false);
            setShowMusicLibrary(true);
          }}
          songId={selectedSongId}
        />
      );
    }

    // 如果显示通讯录页面
    if (showContactsList) {
      return (
        <ContactsListScreen
          onCreateRole={() => {
            console.log('跳转到创建新角色页面 T2.2');
            setShowContactsList(false);
            setShowCreateRole(true);
          }}
          onConversationPractice={() => {
            console.log('跳转到会话练习功能 T2.4');
            Alert.alert('功能提示', '会话练习功能正在开发中');
          }}
          onContactChat={(contactId) => {
            console.log('跳转到实时翻译主界面 T1.1.1, 联系人ID:', contactId);
            // 设置选中的联系人并跳转到耳机模式
            setSelectedContact(contactId);
            setShowContactsList(false);
            setShowHeadphoneTranslation(true);
          }}
          onContactDetail={(contactId) => {
            console.log('跳转到角色Agent详情页面 T2.3, 联系人ID:', contactId);
            // 设置模拟角色数据并跳转到详情页面
            const mockRole = {
              id: contactId,
              name: contactId.includes('Alice') ? 'Alice Johnson' : 
                    contactId.includes('Ville') ? 'Ville' :
                    contactId.includes('李明') ? '李明' : 'Ville',
              tags: contactId.includes('Alice') ? ['合作伙伴', '英语'] :
                    contactId.includes('李明') ? ['朋友', '中文'] : ['合作伙伴', '英语'],
            };
            setSelectedRole(mockRole);
            setShowContactsList(false);
            setShowRoleDetail(true);
          }}
          onTabSwitch={(tab) => {
            console.log(`通讯录页面切换到${tab}标签`);
            if (tab === 'translation') {
              setShowContactsList(false);
              setShowTranslationHome(true);
            } else if (tab === 'profile') {
              Alert.alert('功能提示', '我的页面功能正在开发中');
            } else if (tab === 'music') {
              setShowContactsList(false);
              setShowMusicHome(true);
            }
          }}
        />
      );
    }

    // 如果显示蓝牙配对页面
    if (showBluetoothPairing) {
      return (
        <BluetoothPairingScreen onClose={() => setShowBluetoothPairing(false)} />
      );
    }

    // 如果显示注册页面
    if (showRegisterScreen) {
      return (
        <RegisterScreen onClose={() => {
          setShowRegisterScreen(false);
          setShowWelcome(true);
        }} />
      );
    }

    // 如果显示忘记密码页面
    if (showForgotPassword) {
      return (
        <ForgotPasswordFlow 
          onBack={() => {
            setShowForgotPassword(false);
            setShowLogin(true);
          }}
          onComplete={() => {
            console.log('密码重置完成');
            Alert.alert('重置成功', '您的密码已成功重置，请使用新密码登录', [
              {
                text: '确定',
                onPress: () => {
                  setShowForgotPassword(false);
                  setShowLogin(true);
                }
              }
            ]);
          }}
        />
      );
    }

    // 默认显示主页面
    return (
      <ScrollView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        <View style={styles.header}>
          <Text style={styles.title}>
            🔥 {t('app.title')}
          </Text>
          <Text style={styles.subtitle}>
            {t('app.subtitle')} ⚡
          </Text>
          
          {/* 状态指示器 */}
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {t('app.status')}
            </Text>
          </View>

          {/* 语言切换按钮 */}
          <TouchableOpacity 
            style={styles.languageButton}
            onPress={() => setLanguageSelectorVisible(true)}
          >
            <Text style={styles.languageButtonText}>
              🌍 {getCurrentLanguageDisplayName()}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.loginButton, loading && styles.disabledButton]} 
            onPress={testLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('api.test.requesting') : `🔐 ${t('api.test.login')}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.postButton, loading && styles.disabledButton]} 
            onPress={testGetPosts}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('api.test.requesting') : `📄 ${t('api.test.getPosts')}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.createButton, loading && styles.disabledButton]} 
            onPress={testCreatePost}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('api.test.requesting') : `✍️ ${t('api.test.createPost')}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.createButton, loading && styles.disabledButton]} 
            onPress={testTokenStorage}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('api.test.requesting') : `🔑 测试Token存储`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.createButton, loading && styles.disabledButton]} 
            onPress={testTokenExpired}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('api.test.requesting') : `🔒 测试Token过期`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.createButton, loading && styles.disabledButton]} 
            onPress={testFileUpload}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('api.test.requesting') : `📄 测试文件上传`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.diagnosticButton, loading && styles.disabledButton]} 
            onPress={testNetworkDiagnostic}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('api.test.requesting') : `🔧 网络诊断`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.imageTranslationButton, loading && styles.disabledButton]} 
            onPress={testImageTranslation}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('api.test.requesting') : `🖼️ 测试图片翻译`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.welcomeButton]} 
            onPress={() => setShowWelcome(true)}
          >
            <Text style={styles.buttonText}>
              🏠 返回欢迎页面
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={clearResult}
          >
            <Text style={styles.buttonText}>
              🗑️ {t('api.result.clearResult')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.debugButton]} 
            onPress={() => setDebugPanelVisible(true)}
          >
            <Text style={styles.buttonText}>
              🔧 {t('debug.title')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.bluetoothButton]} 
            onPress={() => setShowBluetoothPairing(true)}
          >
            <Text style={styles.buttonText}>
              🎧 {t('bluetooth.title')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.registerButton]} 
            onPress={() => setShowRegisterScreen(true)}
          >
            <Text style={styles.buttonText}>
              📝 {t('register.title')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.splashButton]} 
            onPress={() => setShowSplash(true)}
          >
            <Text style={styles.buttonText}>
              🚀 查看启动页
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.permissionButton]} 
            onPress={() => setShowBasicPermission(true)}
          >
            <Text style={styles.buttonText}>
              🔐 基础权限页面
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.voiceprintButton]} 
            onPress={() => setShowVoiceprintCollection(true)}
          >
            <Text style={styles.buttonText}>
              🎤 AI声纹采集
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.recordingButton]} 
            onPress={() => setShowVoiceprintRecording(true)}
          >
            <Text style={styles.buttonText}>
              🎙️ 声纹录制页面
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.generationButton]} 
            onPress={() => setShowVoiceprintGeneration(true)}
          >
            <Text style={styles.buttonText}>
              🎵 声纹生成页面
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.previewButton]} 
            onPress={() => setShowVoiceprintPreview(true)}
          >
            <Text style={styles.buttonText}>
              🎭 音色预览页面
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.completeButton]} 
            onPress={() => setShowOnboardingComplete(true)}
          >
            <Text style={styles.buttonText}>
              🎉 引导完成页面
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.translationHomeButton]} 
            onPress={() => setShowTranslationHome(true)}
          >
            <Text style={styles.buttonText}>
              🏠 翻译主界面
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.musicHomeButton]} 
            onPress={() => setShowMusicHome(true)}
          >
            <Text style={styles.buttonText}>
              🎵 AI音乐主页
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.hummingRecordingButton]} 
            onPress={() => setShowHummingRecording(true)}
          >
            <Text style={styles.buttonText}>
              🎤 哼唱录制页面
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.lyricsInputButton]} 
            onPress={() => setShowLyricsInput(true)}
          >
            <Text style={styles.buttonText}>
              ✍️ 歌词输入页面
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.headphoneButton]} 
            onPress={() => setShowHeadphoneTranslation(true)}
          >
            <Text style={styles.buttonText}>
              🎧 耳机模式页面
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.headphoneWithContactButton]} 
            onPress={() => {
              setSelectedContact('小野秀夫');
              setShowHeadphoneTranslation(true);
            }}
          >
            <Text style={styles.buttonText}>
              👤 耳机模式(联系人)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.audioTestButton]} 
            onPress={() => setShowAudioTestDemo(true)}
          >
            <Text style={styles.buttonText}>
              🧪 音频测试Demo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.onlineCallButton]} 
            onPress={() => setShowOnlineCallTranslation(true)}
          >
            <Text style={styles.buttonText}>
              📞 线上通话翻译
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.listenModeButton]} 
            onPress={() => setShowListenMode(true)}
          >
            <Text style={styles.buttonText}>
              👂 聆听模式
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.speakerModeButton]} 
            onPress={() => setShowSpeakerMode(true)}
          >
            <Text style={styles.buttonText}>
              📢 外放模式
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.speakerModeWithContactButton]} 
            onPress={() => {
              setSelectedContact('小野秀夫');
              setShowSpeakerMode(true);
            }}
          >
            <Text style={styles.buttonText}>
              📢 外放模式(联系人)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.documentTranslationButton]} 
            onPress={() => setShowDocumentTranslation(true)}
          >
            <Text style={styles.buttonText}>
              📄 文档翻译
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.audioTranslationButton]} 
            onPress={() => setShowAudioTranslation(true)}
          >
            <Text style={styles.buttonText}>
              🎵 音频翻译
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.imageTranslationButton]} 
            onPress={() => setShowImageTranslation(true)}
          >
            <Text style={styles.buttonText}>
              📷 图像翻译
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.resetOnboardingButton]} 
            onPress={async () => {
              Alert.alert(
                '重置引导状态',
                '您确定要重置引导状态吗？这将让您重新体验完整的引导流程。',
                [
                  { text: '取消', style: 'cancel' },
                  { 
                    text: '确定', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await userStore.clearOnboardingStatus();
                        Alert.alert('重置成功', '引导状态已重置，下次登录将重新进入引导流程');
                      } catch (error) {
                        Alert.alert('重置失败', '重置引导状态时出现错误');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.buttonText}>
              🔄 重置引导状态
            </Text>
          </TouchableOpacity>

          {/* 登出按钮 - 仅在已登录时显示 */}
          {userStore.isLoggedIn && (
            <TouchableOpacity 
              style={[styles.button, styles.logoutButton]} 
              onPress={async () => {
                Alert.alert(
                  '确认登出',
                  '您确定要登出当前账户吗？',
                  [
                    { text: '取消', style: 'cancel' },
                    { 
                      text: '确定', 
                      style: 'destructive',
                      onPress: async () => {
                        await userStore.logout();
                        // 重置所有页面状态，返回欢迎页面
                        setShowBasicPermission(false);
                        setShowVoiceprintCollection(false);
                        setShowVoiceprintRecording(false);
                        setShowVoiceprintGeneration(false);
                        setShowVoiceprintPreview(false);
                        setShowOnboardingComplete(false);
                        setShowTranslationHome(false);
                        setShowHeadphoneTranslation(false);
                        setShowOnlineCallTranslation(false);
                        setShowListenMode(false);
                        setShowSpeakerMode(false);
                        setShowDocumentTranslation(false);
                        setShowAudioTranslation(false);
                        setShowImageTranslation(false);
                        setShowMusicHome(false);
                        setShowHummingRecording(false);
                        setShowLyricsInput(false);
                        setShowBluetoothPairing(false);
                        setSelectedContact(undefined);
                        setShowWelcome(true);
                        Alert.alert('登出成功', '您已成功登出账户');
                      }
                    }
                  ]
                );
              }}
            >
              <Text style={styles.buttonText}>
                🚪 登出账户
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {apiResult ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>📊 {t('api.result.title')}</Text>
            <ScrollView style={styles.resultScroll}>
              <Text style={styles.resultText}>{apiResult}</Text>
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 {t('features.title')}</Text>
          
          {/* 功能列表 */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, {backgroundColor: '#3b82f6'}]} />
              <Text style={styles.featureText}>{t('features.list.httpClient')}</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, {backgroundColor: '#10b981'}]} />
              <Text style={styles.featureText}>{t('features.list.tokenManagement')}</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, {backgroundColor: '#8b5cf6'}]} />
              <Text style={styles.featureText}>{t('features.list.errorHandling')}</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, {backgroundColor: '#f59e0b'}]} />
              <Text style={styles.featureText}>{t('features.list.typescript')}</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, {backgroundColor: '#ef4444'}]} />
              <Text style={styles.featureText}>{t('features.list.logging')}</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, {backgroundColor: '#06b6d4'}]} />
              <Text style={styles.featureText}>{t('features.list.debugTools')}</Text>
            </View>
          </View>

          {/* 状态展示 */}
          <View style={styles.statusCard}>
            <Text style={styles.statusCardText}>
              ✅ {t('features.status')}
            </Text>
          </View>
        </View>

        <LanguageSelector
          visible={languageSelectorVisible}
          onClose={() => setLanguageSelectorVisible(false)}
        />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* 渲染当前页面 */}
      {renderCurrentPage()}

      {/* 悬浮调试按钮 - 在所有页面都显示 */}
      <FloatingDebugButton 
        onPress={() => setDebugPanelVisible(true)}
        visible={true}
      />

      {/* 调试面板 - 在所有页面都可用 */}
      <DebugPanel 
        visible={debugPanelVisible} 
        onClose={() => setDebugPanelVisible(false)} 
      />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center' as const,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center' as const,
  },
  statusIndicator: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500' as const,
  },
  languageButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500' as const,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center' as const,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
  },
  postButton: {
    backgroundColor: '#10b981',
  },
  createButton: {
    backgroundColor: '#8b5cf6',
  },
  diagnosticButton: {
    backgroundColor: '#dc2626',
  },
  clearButton: {
    backgroundColor: '#f59e0b',
  },
  debugButton: {
    backgroundColor: '#6b7280',
  },
  bluetoothButton: {
    backgroundColor: '#3b82f6',
  },
  registerButton: {
    backgroundColor: '#10b981',
  },
  splashButton: {
    backgroundColor: '#8b5cf6',
  },
  welcomeButton: {
    backgroundColor: '#22c55e',
  },
  permissionButton: {
    backgroundColor: '#f59e0b',
  },
  voiceprintButton: {
    backgroundColor: '#ec4899',
  },
  recordingButton: {
    backgroundColor: '#8b5cf6',
  },
  generationButton: {
    backgroundColor: '#10b981',
  },
  previewButton: {
    backgroundColor: '#8b5cf6',
  },
  completeButton: {
    backgroundColor: '#22c55e',
  },
  translationHomeButton: {
    backgroundColor: '#3b82f6',
  },
  musicHomeButton: {
    backgroundColor: '#ec4899',
  },
  hummingRecordingButton: {
    backgroundColor: '#f59e0b',
  },
  lyricsInputButton: {
    backgroundColor: '#8b5cf6',
  },
  headphoneButton: {
    backgroundColor: '#8b5cf6',
  },
  headphoneWithContactButton: {
    backgroundColor: '#06b6d4',
  },
  audioTestButton: {
    backgroundColor: '#f59e0b',
  },
  onlineCallButton: {
    backgroundColor: '#3b82f6',
  },
  listenModeButton: {
    backgroundColor: '#8b5cf6',
  },
  speakerModeButton: {
    backgroundColor: '#f97316',
  },
  speakerModeWithContactButton: {
    backgroundColor: '#10b981',
  },
  documentTranslationButton: {
    backgroundColor: '#06b6d4',
  },
  audioTranslationButton: {
    backgroundColor: '#8b5cf6',
  },
  imageTranslationButton: {
    backgroundColor: '#f59e0b',
  },
  resetOnboardingButton: {
    backgroundColor: '#f59e0b',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  resultContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 12,
  },
  resultScroll: {
    maxHeight: 160,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
  },
  resultText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'monospace',
  },
  infoBox: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1e293b',
    marginBottom: 12,
  },
  featureList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#475569',
  },
  statusCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  statusCardText: {
    textAlign: 'center' as const,
    color: '#0369a1',
    fontWeight: '500' as const,
  },
};

export default App;
