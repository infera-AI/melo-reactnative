import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  SectionList,
  Keyboard,
} from 'react-native';

// 联系人数据类型
interface Contact {
  id: string;
  name: string;
  avatar?: string;
  category?: string;
  phone?: string;
}

// 组件Props接口
interface ContactsListScreenProps {
  onBack?: () => void;
  onAddContact?: () => void;
  onCreateRole?: () => void;
  onConversationPractice?: () => void;
  onContactChat?: (contactId: string) => void;
  onContactDetail?: (contactId: string) => void;
  onTabSwitch?: (tab: string) => void;
}

// 模拟联系人数据
const mockContacts: Contact[] = [
  { id: '1', name: 'Alice Johnson', category: 'A' },
  { id: '2', name: 'Bob Smith', category: 'B' },
  { id: '3', name: 'Catherine Lee', category: 'C' },
  { id: '4', name: 'David Chen', category: 'D' },
  { id: '5', name: 'Emma Wilson', category: 'E' },
  { id: '6', name: 'Frank Zhang', category: 'F' },
  { id: '7', name: 'Grace Kim', category: 'G' },
  { id: '8', name: 'Henry Liu', category: 'H' },
  { id: '9', name: 'Iris Wang', category: 'I' },
  { id: '10', name: 'Jack Brown', category: 'J' },
  { id: '11', name: 'Kelly Davis', category: 'K' },
  { id: '12', name: 'Lily Martinez', category: 'L' },
  { id: '13', name: 'Mike Taylor', category: 'M' },
  { id: '14', name: 'Nancy Anderson', category: 'N' },
  { id: '15', name: 'Oliver Garcia', category: 'O' },
  { id: '16', name: '李明', category: 'L' },
  { id: '17', name: '李华', category: 'L' },
  { id: '18', name: '张伟', category: 'Z' },
  { id: '19', name: '王芳', category: 'W' },
  { id: '20', name: '陈杰', category: 'C' },
  { id: '21', name: '刘洋', category: 'L' },
  { id: '22', name: '赵敏', category: 'Z' },
];

// A-Z索引字母
const alphabetIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'];

const ContactsListScreen: React.FC<ContactsListScreenProps> = ({
  onBack: _onBack,
  onAddContact,
  onCreateRole,
  onConversationPractice,
  onContactChat,
  onContactDetail,
  onTabSwitch,
}) => {
  const [searchText, setSearchText] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  const searchInputRef = useRef<TextInput>(null);

  // 过滤和分组联系人
  const filteredAndGroupedContacts = useMemo(() => {
    let filtered = mockContacts;
    
    if (searchText) {
      filtered = mockContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 按首字母分组
    const grouped = filtered.reduce((acc, contact) => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      const key = firstLetter.match(/[A-Z]/) ? firstLetter : '#';
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);

    // 转换为SectionList格式
    return Object.keys(grouped)
      .sort()
      .map(letter => ({
        title: letter,
        data: grouped[letter].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [searchText]);

  // 处理搜索框聚焦
  const handleSearchFocus = () => {
    setIsSearchActive(true);
  };

  // 处理搜索框失焦
  const handleSearchBlur = () => {
    if (!searchText) {
      setIsSearchActive(false);
    }
  };

  // 处理搜索取消
  const handleSearchCancel = () => {
    setSearchText('');
    setIsSearchActive(false);
    searchInputRef.current?.blur();
    Keyboard.dismiss();
  };

  // 处理搜索文本变化
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (text && !isSearchActive) {
      setIsSearchActive(true);
    }
  };

  // 处理添加角色
  const handleAddContact = () => {
    console.log('跳转到创建新角色页面 T2.2');
    onCreateRole?.();
  };

  // 处理会话练习
  const handleConversationPractice = () => {
    console.log('跳转到会话练习功能 T2.4');
    onConversationPractice?.();
  };

  // 处理联系人对话
  const handleContactChat = (contactId: string) => {
    console.log('跳转到实时翻译主界面 T1.1.1, 联系人ID:', contactId);
    onContactChat?.(contactId);
  };

  // 处理联系人详情
  const handleContactDetail = (contactId: string) => {
    console.log('跳转到角色Agent详情页面 T2.3, 联系人ID:', contactId);
    onContactDetail?.(contactId);
  };

  // 处理Tab切换
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    onTabSwitch?.(tab);
  };

  // 处理字母索引点击
  const handleIndexPress = (letter: string) => {
    // 这里可以实现滚动到对应字母的功能
    console.log('滚动到字母:', letter);
  };

  // 处理空状态点击 - 引导用户创建第一个角色
  const handleEmptyStatePress = () => {
    console.log('空状态点击 - 引导用户创建第一个角色，跳转到页面 T2.2');
    onCreateRole?.();
  };

  // 渲染空状态组件
  const renderEmptyState = () => (
    <TouchableOpacity 
      style={styles.emptyStateContainer}
      onPress={handleEmptyStatePress}
      activeOpacity={0.7}
    >
      <View style={styles.emptyStateContent}>
        <Text style={styles.emptyStateIcon}>📋</Text>
        <Text style={styles.emptyStateTitle}>您的通讯录还是空的</Text>
        <Text style={styles.emptyStateSubtitle}>点击这里创建您的第一个沟通角色</Text>
      </View>
    </TouchableOpacity>
  );

  // 渲染联系人项
  const renderContactItem = ({ item }: { item: Contact }) => (
    <View style={styles.contactItem}>
      <TouchableOpacity
        style={styles.contactInfo}
        onPress={() => handleContactDetail(item.id)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>头像</Text>
        </View>
        <Text style={styles.contactName}>{item.name}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => handleContactChat(item.id)}
      >
        <Text style={styles.chatButtonText}>对话</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染分组标题
  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>通讯录</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* 搜索框区域 */}
      <View style={styles.searchSection}>
        <View style={[styles.searchRow, isSearchActive && styles.searchRowActive]}>
          <View style={[styles.searchContainer, isSearchActive && styles.searchContainerActive]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="搜索角色名称"
              placeholderTextColor="#999999"
              value={searchText}
              onChangeText={handleSearchTextChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              returnKeyType="search"
            />
          </View>
          {isSearchActive && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleSearchCancel}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 功能入口 - 在搜索激活时隐藏 */}
      {!isSearchActive && (
        <View style={styles.functionSection}>
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={handleConversationPractice}
          >
            <View style={styles.practiceIcon}>
              <Text style={styles.practiceIconText}>💬🔍</Text>
            </View>
            <Text style={styles.practiceButtonText}>会话练习</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 主要内容区域 */}
      <View style={styles.contentArea}>
        {/* 条件渲染：空状态或联系人列表 */}
        {filteredAndGroupedContacts.length === 0 && !searchText ? (
          // 显示空状态
          renderEmptyState()
        ) : (
          <>
            {/* 联系人列表 */}
            <SectionList
              sections={filteredAndGroupedContacts}
              keyExtractor={(item) => item.id}
              renderItem={renderContactItem}
              renderSectionHeader={renderSectionHeader}
              style={styles.contactsList}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={true}
              ListEmptyComponent={
                searchText ? (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsIcon}>🔍</Text>
                    <Text style={styles.noResultsText}>没有找到匹配的角色</Text>
                    <Text style={styles.noResultsSubtext}>试试其他关键词</Text>
                  </View>
                ) : null
              }
            />

            {/* A-Z快速索引条 */}
            <View style={styles.alphabetIndex}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {alphabetIndex.map((letter) => (
                  <TouchableOpacity
                    key={letter}
                    style={styles.indexItem}
                    onPress={() => handleIndexPress(letter)}
                  >
                    <Text style={styles.indexText}>{letter}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </View>

      {/* 底部主导航栏 */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={[
            styles.navTab, 
            activeTab === 'translation' && styles.navTabActive
          ]}
          onPress={() => handleTabPress('translation')}
        >
          <Text style={[
            styles.navTabIcon,
            activeTab === 'translation' && styles.navTabIconActive
          ]}>
            🔄
          </Text>
          <Text style={[
            styles.navTabText,
            activeTab === 'translation' && styles.navTabTextActive
          ]}>
            翻译
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navTab,
            activeTab === 'contacts' && styles.navTabActive
          ]}
          onPress={() => handleTabPress('contacts')}
        >
          <Text style={[
            styles.navTabIcon,
            activeTab === 'contacts' && styles.navTabIconActive
          ]}>
            📞
          </Text>
          <Text style={[
            styles.navTabText,
            activeTab === 'contacts' && styles.navTabTextActive
          ]}>
            通讯录
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navTab,
            activeTab === 'profile' && styles.navTabActive
          ]}
          onPress={() => handleTabPress('profile')}
        >
          <Text style={[
            styles.navTabIcon,
            activeTab === 'profile' && styles.navTabIconActive
          ]}>
            👤
          </Text>
          <Text style={[
            styles.navTabText,
            activeTab === 'profile' && styles.navTabTextActive
          ]}>
            我的
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchRowActive: {
    // 激活状态的行样式
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchContainerActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#ffffff',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#64748b',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  functionSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  practiceIcon: {
    marginRight: 12,
  },
  practiceIconText: {
    fontSize: 20,
  },
  practiceButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    flexDirection: 'row',
  },
  contactsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginVertical: 4,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  contactName: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  chatButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  chatButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  alphabetIndex: {
    width: 24,
    paddingVertical: 8,
    paddingRight: 8,
  },
  indexItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
  },
  indexText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navTabActive: {
    // 激活状态样式在单独的样式中定义
  },
  navTabIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: '#64748b',
  },
  navTabIconActive: {
    color: '#3b82f6',
  },
  navTabText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  navTabTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  // 新增空状态相关样式
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  // 搜索无结果状态样式
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsIcon: {
    fontSize: 40,
    marginBottom: 16,
    opacity: 0.5,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default ContactsListScreen; 