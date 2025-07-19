import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  Animated,
  Keyboard,
  ScrollView,
} from 'react-native';

// 标签数据类型
interface Tag {
  id: string;
  name: string;
}

// 角色数据类型
interface Role {
  id: string;
  name: string;
  avatar?: string;
  tags: string[];
}

// 组件Props接口
interface EditRoleScreenProps {
  role?: Role;
  onBack?: () => void;
  onSave?: (roleData: {
    id: string;
    name: string;
    avatar?: string;
    tags: Tag[];
  }) => void;
}

const EditRoleScreen: React.FC<EditRoleScreenProps> = ({
  role,
  onBack,
  onSave,
}) => {
  // 默认角色数据
  const defaultRole: Role = {
    id: '1',
    name: 'Ville',
    tags: ['合作伙伴', '英语'],
  };

  const currentRole = role || defaultRole;

  const [roleName, setRoleName] = useState(currentRole.name);
  const [tags, setTags] = useState<Tag[]>(
    currentRole.tags.map((tag, index) => ({
      id: `${currentRole.id}_tag_${index}`,
      name: tag,
    }))
  );
  const [isAddTagModalVisible, setIsAddTagModalVisible] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const tagInputRef = useRef<TextInput>(null);

  // 动画值
  const slideAnim = useRef(new Animated.Value(300)).current;

  // 组件挂载时初始化数据
  useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setTags(role.tags.map((tag, index) => ({
        id: `${role.id}_tag_${index}`,
        name: tag,
      })));
    }
  }, [role]);

  // 处理返回
  const handleBack = () => {
    console.log('返回角色Agent详情页面 T2.3');
    onBack?.();
  };

  // 处理保存角色
  const handleSave = () => {
    if (!roleName.trim()) {
      Alert.alert('提示', '请输入角色姓名');
      return;
    }

    const roleData = {
      id: currentRole.id,
      name: roleName.trim(),
      avatar: currentRole.avatar,
      tags: tags,
    };

    console.log('保存修改后的角色信息:', roleData);
    Alert.alert('成功', '角色信息已更新！', [
      {
        text: '确定',
        onPress: () => {
          onSave?.(roleData);
          onBack?.();
        }
      }
    ]);
  };

  // 处理头像设置点击
  const handleAvatarPress = () => {
    Alert.alert(
      '设置头像',
      '选择头像来源',
      [
        { text: '取消', style: 'cancel' },
        { text: '拍照', onPress: () => console.log('启动相机拍照') },
        { text: '从相册选择', onPress: () => console.log('打开相册选择') }
      ]
    );
  };

  // 处理添加标签按钮点击
  const handleAddTagPress = () => {
    setIsAddTagModalVisible(true);
    setNewTagText('');
    
    // 启动弹窗动画
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // 动画完成后聚焦输入框
      setTimeout(() => {
        tagInputRef.current?.focus();
      }, 100);
    });
  };

  // 处理关闭标签弹窗
  const handleCloseTagModal = () => {
    Keyboard.dismiss();
    
    // 启动关闭动画
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsAddTagModalVisible(false);
      setNewTagText('');
    });
  };

  // 处理完成添加标签
  const handleCompleteAddTag = () => {
    if (newTagText.trim()) {
      const newTag: Tag = {
        id: `${currentRole.id}_tag_${Date.now()}`,
        name: newTagText.trim(),
      };
      
      // 检查是否已存在相同标签
      const exists = tags.some(tag => tag.name === newTag.name);
      if (exists) {
        Alert.alert('提示', '该标签已存在');
        return;
      }

      setTags(prev => [...prev, newTag]);
      console.log('添加新标签:', newTag);
    }
    
    handleCloseTagModal();
  };

  // 处理删除标签
  const handleRemoveTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  // 检查完成按钮是否可用
  const isCompleteButtonEnabled = newTagText.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>角色编辑</Text>
        
        <TouchableOpacity 
          style={[
            styles.saveButton,
            roleName.trim() ? styles.saveButtonEnabled : styles.saveButtonDisabled
          ]} 
          onPress={handleSave}
          disabled={!roleName.trim()}
        >
          <Text style={[
            styles.saveButtonText,
            roleName.trim() ? styles.saveButtonTextEnabled : styles.saveButtonTextDisabled
          ]}>
            ✓
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 头像设置区域 */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
            activeOpacity={0.7}
          >
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.avatarHint}>点击设置头像</Text>
          </TouchableOpacity>
        </View>

        {/* 角色姓名输入框 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>
            角色姓名 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.nameInput}
            placeholder="请输入角色姓名"
            placeholderTextColor="#94a3b8"
            value={roleName}
            onChangeText={setRoleName}
            maxLength={20}
          />
        </View>

        {/* 标签区域 */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>标签</Text>
          
          {/* 已添加的标签列表 */}
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <View key={tag.id} style={styles.tagItem}>
                  <Text style={styles.tagText}>{tag.name}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => handleRemoveTag(tag.id)}
                  >
                    <Text style={styles.removeTagText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          {/* 添加标签按钮 */}
          <TouchableOpacity 
            style={styles.addTagButton}
            onPress={handleAddTagPress}
            activeOpacity={0.7}
          >
            <Text style={styles.addTagButtonText}>+ 添加标签</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 添加标签弹窗 */}
      <Modal
        visible={isAddTagModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseTagModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={handleCloseTagModal}
          />
          
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* 弹窗头部 */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseTagModal}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>添加标签</Text>
            </View>

            {/* 标签输入框 */}
            <View style={styles.modalBody}>
              <TextInput
                ref={tagInputRef}
                style={styles.tagInput}
                placeholder="请输入标签名称"
                placeholderTextColor="#94a3b8"
                value={newTagText}
                onChangeText={setNewTagText}
                maxLength={10}
                returnKeyType="done"
                onSubmitEditing={isCompleteButtonEnabled ? handleCompleteAddTag : undefined}
              />
              
              {/* 完成按钮 */}
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  isCompleteButtonEnabled ? styles.completeButtonEnabled : styles.completeButtonDisabled
                ]}
                onPress={handleCompleteAddTag}
                disabled={!isCompleteButtonEnabled}
              >
                <Text style={[
                  styles.completeButtonText,
                  isCompleteButtonEnabled ? styles.completeButtonTextEnabled : styles.completeButtonTextDisabled
                ]}>
                  完成
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // 顶部导航栏样式
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonEnabled: {
    backgroundColor: '#3b82f6',
  },
  saveButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButtonTextEnabled: {
    color: '#ffffff',
  },
  saveButtonTextDisabled: {
    color: '#94a3b8',
  },

  // 主要内容区域
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // 头像设置区域样式
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 32,
    marginBottom: 8,
    opacity: 0.6,
  },
  avatarHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },

  // 输入框区域样式
  inputSection: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  required: {
    color: '#ef4444',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },

  // 标签区域样式
  tagsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginRight: 6,
  },
  removeTagButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTagText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  addTagButton: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  addTagButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },

  // 弹窗样式
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // 为iOS底部安全区域留空间
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#64748b',
    fontWeight: 'bold',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginRight: 32, // 平衡关闭按钮的宽度
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tagInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  completeButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeButtonEnabled: {
    backgroundColor: '#3b82f6',
  },
  completeButtonDisabled: {
    backgroundColor: '#f1f5f9',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  completeButtonTextEnabled: {
    color: '#ffffff',
  },
  completeButtonTextDisabled: {
    color: '#94a3b8',
  },
});

export default EditRoleScreen; 