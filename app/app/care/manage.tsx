import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/components/ThemeContext';
import { careService, CareCircleMember } from '@/services/care.service';
import { userService } from '@/services/user.service';

export default function ManageCareCircleScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  
  const [members, setMembers] = useState<CareCircleMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<CareCircleMember | null>(null);
  const [nickname, setNickname] = useState('');
  const [label, setLabel] = useState('');
  
  const labels = ['Mom', 'Dad', 'Sister', 'Brother', 'Wife', 'Husband', 'Child', 'Best Friend', 'Team Member', 'Customer', 'Staff'];

  const theme = {
    primary: '#6C2BD9',
    accent: '#FF9F43',
    backgroundLight: '#F8F9FA',
    backgroundDark: '#111921',
    textHeadings: '#1E293B',
    textBody: '#475569',
  };

  const bgColor = isDark ? theme.backgroundDark : theme.backgroundLight;
  const textColor = isDark ? '#FFFFFF' : theme.textHeadings;
  const textBodyColor = isDark ? '#9CA3AF' : theme.textBody;
  const cardBg = isDark ? '#1F2937' : '#FFFFFF';

  useEffect(() => {
    fetchCircle();
  }, []);

  const fetchCircle = async () => {
    try {
      setLoading(true);
      const res = await careService.getCircle();
      if (res.success) {
        setMembers(res.data);
      }
    } catch (e) {
      console.log('Error fetching circle', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCircle();
    setRefreshing(false);
  };

  const openEditModal = (member: CareCircleMember) => {
    setEditingMember(member);
    setNickname(member.nickname || '');
    setLabel(member.relationship_label || '');
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingMember) return;
    try {
      const res = await careService.updateMember(editingMember._id, {
        nickname: nickname,
        relationship_label: label
      });
      if (res.success) {
        setEditModalVisible(false);
        fetchCircle();
        Alert.alert('Success', 'Contact updated successfully');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Update failed');
    }
  };

  const handleRemove = async (id: string, name: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${name} from your Care Circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await careService.removeMember(id);
              if (res.success) {
                fetchCircle();
              }
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Removal failed');
            }
          }
        }
      ]
    );
  };

  const togglePin = async (member: CareCircleMember) => {
    try {
      await careService.updateMember(member._id, { is_pinned: !member.is_pinned });
      fetchCircle();
    } catch (e) {
      console.log('Error toggling pin', e);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Manage Care Circle</Text>
        <TouchableOpacity style={styles.addBtn}>
           <Ionicons name="person-add" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: cardBg }]}>
             <Ionicons name="search" size={20} color={textBodyColor} style={{ marginLeft: 12 }} />
             <TextInput 
               style={[styles.searchInput, { color: textColor }]}
               placeholder="Search circle members..."
               placeholderTextColor={textBodyColor}
               value={searchQuery}
               onChangeText={setSearchQuery}
             />
          </View>
        </View>

        <View style={styles.statsOverview}>
           <Text style={[styles.sectionTitle, { color: textColor }]}>Your Network Overview</Text>
           <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                 <Text style={styles.statVal}>{members.length}</Text>
                 <Text style={[styles.statLabel, { color: textBodyColor }]}>Members</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: cardBg }]}>
                 <Text style={styles.statVal}>{members.filter(m => m.is_pinned).length}</Text>
                 <Text style={[styles.statLabel, { color: textBodyColor }]}>Pinned</Text>
              </View>
           </View>
        </View>

        <View style={styles.membersList}>
           <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 12 }]}>All Members</Text>
           
           {loading && members.length === 0 ? (
             <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
           ) : members.length === 0 ? (
             <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={64} color={textBodyColor} />
                <Text style={[styles.emptyText, { color: textBodyColor }]}>Your Care Circle is empty</Text>
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]}>
                   <Text style={styles.primaryBtnText}>Find Friends</Text>
                </TouchableOpacity>
             </View>
           ) : members.filter(m => 
               `${m.member_id.first_name} ${m.member_id.last_name} ${m.nickname}`.toLowerCase().includes(searchQuery.toLowerCase())
           ).map((member) => (
             <View key={member._id} style={[styles.memberItem, { backgroundColor: cardBg }]}>
                <Image 
                  source={{ uri: member.member_id.profile_picture || `https://ui-avatars.com/api/?name=${member.member_id.first_name}+${member.member_id.last_name}&background=random` }} 
                  style={styles.avatar} 
                />
                <View style={styles.memberInfo}>
                   <Text style={[styles.memberName, { color: textColor }]}>
                      {member.nickname || `${member.member_id.first_name} ${member.member_id.last_name}`}
                   </Text>
                   {member.relationship_label && (
                     <View style={[styles.labelPill, { backgroundColor: 'rgba(108, 43, 217, 0.1)' }]}>
                        <Text style={[styles.labelText, { color: theme.primary }]}>{member.relationship_label}</Text>
                     </View>
                   )}
                   <Text style={[styles.memberPhone, { color: textBodyColor }]}>{member.member_id.phone_number}</Text>
                </View>
                
                <View style={styles.actions}>
                   <TouchableOpacity onPress={() => togglePin(member)} style={styles.iconAction}>
                      <Ionicons 
                        name={member.is_pinned ? "pin" : "pin-outline"} 
                        size={20} 
                        color={member.is_pinned ? theme.primary : textBodyColor} 
                      />
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => openEditModal(member)} style={styles.iconAction}>
                      <Ionicons name="create-outline" size={20} color={textBodyColor} />
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => handleRemove(member._id, member.nickname || member.member_id.first_name)} style={styles.iconAction}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                   </TouchableOpacity>
                </View>
             </View>
           ))}
        </View>
      </ScrollView>

      {/* Edit Member Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
         <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
               <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Edit Relationship</Text>
                  <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                     <Ionicons name="close" size={24} color={textColor} />
                  </TouchableOpacity>
               </View>
               
               <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: textBodyColor }]}>Nickname</Text>
                  <TextInput 
                    style={[styles.modalInput, { color: textColor, borderColor: isDark ? '#374151' : '#E5E7EB' }]}
                    value={nickname}
                    onChangeText={setNickname}
                    placeholder="e.g. My Little Sister"
                    placeholderTextColor={textBodyColor}
                  />
               </View>

               <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: textBodyColor }]}>Relationship Profile</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.labelsScroll}>
                     {labels.map(L => (
                       <TouchableOpacity 
                         key={L} 
                         onPress={() => setLabel(L)}
                         style={[styles.labelChoice, label === L && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                       >
                         <Text style={[styles.labelChoiceText, { color: label === L ? '#FFF' : textBodyColor }]}>{L}</Text>
                       </TouchableOpacity>
                     ))}
                  </ScrollView>
               </View>

               <TouchableOpacity 
                 style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                 onPress={handleUpdate}
               >
                  <Text style={styles.saveBtnText}>Save Changes</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addBtn: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 14,
  },
  statsOverview: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6C2BD9',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  membersList: {
    paddingHorizontal: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  labelPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
  },
  memberPhone: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconAction: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 20,
  },
  primaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  labelsScroll: {
    marginTop: 8,
  },
  labelChoice: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  labelChoiceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
