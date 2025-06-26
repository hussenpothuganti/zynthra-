import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  Image,
  Animated
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDailyChallenges, completeChallenge } from '../store/actions/challengeActions';
import { RippleButton } from '../components/RippleButton';
import { ProgressBar } from '../components/ProgressBar';
import { Card } from '../components/Card';
import { useTheme } from '../theme/ThemeContext';

const ChallengesScreen = () => {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();
  const dispatch = useDispatch();
  const { challenges, dailyXP, weeklyXP, level, loading } = useSelector(state => state.challenges);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('daily');
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  
  useEffect(() => {
    loadChallenges();
    
    // Start entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  const loadChallenges = async () => {
    setRefreshing(true);
    await dispatch(fetchDailyChallenges());
    setRefreshing(false);
  };
  
  const handleCompleteChallenge = (challengeId) => {
    dispatch(completeChallenge(challengeId));
  };
  
  const renderChallengeItem = ({ item }) => {
    const isCompleted = item.completed;
    
    return (
      <Animated.View 
        style={[
          styles.challengeCard,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: colors.cardBackground
          }
        ]}
      >
        <View style={styles.challengeHeader}>
          <View style={[styles.challengeTypeTag, { backgroundColor: getChallengeColor(item.type) }]}>
            <Text style={styles.challengeTypeText}>{t(item.type)}</Text>
          </View>
          <Text style={[styles.challengeXP, { color: colors.primary }]}>+{item.xp} XP</Text>
        </View>
        
        <Text style={[styles.challengeTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.challengeDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        
        <View style={styles.challengeFooter}>
          {isCompleted ? (
            <View style={styles.completedContainer}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.completedText}>{t('completed')}</Text>
            </View>
          ) : (
            <RippleButton
              onPress={() => handleCompleteChallenge(item.id)}
              style={[styles.completeButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.completeButtonText}>{t('mark_complete')}</Text>
            </RippleButton>
          )}
          
          {item.deadline && (
            <View style={styles.deadlineContainer}>
              <Icon name="clock-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>{item.deadline}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };
  
  const getChallengeColor = (type) => {
    switch (type) {
      case 'coding':
        return '#2196F3';
      case 'language':
        return '#9C27B0';
      case 'fitness':
        return '#4CAF50';
      case 'creativity':
        return '#FF9800';
      default:
        return '#607D8B';
    }
  };
  
  const renderTabs = () => {
    const tabs = [
      { id: 'daily', label: t('daily') },
      { id: 'weekly', label: t('weekly') },
      { id: 'achievements', label: t('achievements') }
    ];
    
    return (
      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab === tab.id && [styles.activeTab, { borderColor: colors.primary }]
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Text 
              style={[
                styles.tabText, 
                { color: selectedTab === tab.id ? colors.primary : colors.textSecondary }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderLeaderboard = () => {
    const topUsers = [
      { id: 1, name: 'Alex Johnson', xp: 12450, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
      { id: 2, name: 'Sarah Williams', xp: 10280, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
      { id: 3, name: 'Michael Chen', xp: 9875, avatar: 'https://randomuser.me/api/portraits/men/59.jpg' },
    ];
    
    return (
      <Card style={styles.leaderboardCard}>
        <Text style={[styles.leaderboardTitle, { color: colors.text }]}>{t('leaderboard')}</Text>
        
        {topUsers.map((user, index) => (
          <View key={user.id} style={styles.leaderboardItem}>
            <Text style={[styles.leaderboardRank, { color: colors.textSecondary }]}>#{index + 1}</Text>
            <Image source={{ uri: user.avatar }} style={styles.leaderboardAvatar} />
            <Text style={[styles.leaderboardName, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.leaderboardXP, { color: colors.primary }]}>{user.xp} XP</Text>
          </View>
        ))}
        
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>{t('view_full_leaderboard')}</Text>
          <Icon name="chevron-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </Card>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('daily_challenges')}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.levelContainer}>
          <Text style={[styles.levelLabel, { color: colors.textSecondary }]}>{t('level')}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
        </View>
        
        <View style={styles.xpContainer}>
          <View style={styles.xpLabelContainer}>
            <Text style={[styles.xpLabel, { color: colors.textSecondary }]}>{t('xp_progress')}</Text>
            <Text style={[styles.xpValue, { color: colors.primary }]}>{dailyXP}/{weeklyXP}</Text>
          </View>
          <ProgressBar 
            progress={dailyXP / weeklyXP} 
            color={colors.primary} 
            style={styles.progressBar} 
          />
        </View>
      </View>
      
      {renderTabs()}
      
      <FlatList
        data={challenges}
        renderItem={renderChallengeItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={loadChallenges}
        ListHeaderComponent={renderLeaderboard}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {loading ? t('loading_challenges') : t('no_challenges')}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  levelContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  levelLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A148C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  xpContainer: {
    flex: 1,
  },
  xpLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  xpLabel: {
    fontSize: 12,
  },
  xpValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  challengeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  challengeTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  challengeXP: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    marginLeft: 6,
    color: '#4CAF50',
    fontWeight: '500',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    marginLeft: 4,
    fontSize: 12,
  },
  leaderboardCard: {
    marginBottom: 16,
    padding: 16,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  leaderboardRank: {
    width: 30,
    fontSize: 14,
    fontWeight: '500',
  },
  leaderboardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 14,
  },
  leaderboardXP: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  emptyText: {
    textAlign: 'center',
    padding: 24,
    fontSize: 16,
  },
});

export default ChallengesScreen;
