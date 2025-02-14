import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { MaterialIcons } from '@expo/vector-icons';

// Bildirim ayarlarını platform bazlı yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

const MatchReminder = ({ match }) => {
  const [isReminderSet, setIsReminderSet] = useState(false);

  // Mevcut hatırlatıcıları kontrol et
  useEffect(() => {
    checkExistingReminder();
  }, [match.fixture.id]);

  const checkExistingReminder = async () => {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      const exists = notifications.some(n => n.identifier === match.fixture.id.toString());
      setIsReminderSet(exists);
    } catch (error) {
      console.error('Check reminder error:', error);
    }
  };

  const scheduleMatchReminder = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Maç hatırlatıcıları için bildirim iznine ihtiyacımız var.',
          [{ text: 'Tamam' }]
        );
        return;
      }

      const matchDate = new Date(match.fixture.date);
      const triggerDate = new Date(matchDate.getTime() - 15 * 60000); // 15 dakika önce
      const now = new Date();

      if (triggerDate <= now) {
        Alert.alert('Hata', 'Bu maç için hatırlatıcı eklenemez.');
        return;
      }

      // Önce varolan bildirimi temizle
      await Notifications.cancelScheduledNotificationAsync(match.fixture.id.toString());

      // Platform bazlı trigger ayarı
      const trigger = Platform.select({
        ios: {
          type: 'date',
          date: triggerDate,
        },
        android: {
          type: 'date',
          timestamp: triggerDate.getTime(),
          channelId: 'match-reminders',
        },
        default: {
          type: 'date',
          timestamp: triggerDate.getTime(),
        },
      });

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Maç Başlamak Üzere!',
          body: `${match.teams.home.name} vs ${match.teams.away.name} maçı 15 dakika içinde başlayacak!`,
          data: { matchId: match.fixture.id },
          sound: true,
          priority: 'high',
        },
        trigger,
        identifier: match.fixture.id.toString(),
      });

      setIsReminderSet(true);
      Alert.alert(
        'Hatırlatıcı Eklendi',
        `Maç başlamadan 15 dakika önce (${triggerDate.toLocaleTimeString('tr-TR')}) size bildirim göndereceğiz.`,
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('Reminder error:', error);
      Alert.alert('Hata', 'Hatırlatıcı eklenirken bir hata oluştu.');
    }
  };

  const removeMatchReminder = async () => {
    try {
      await Notifications.cancelScheduledNotificationAsync(match.fixture.id.toString());
      setIsReminderSet(false);
      Alert.alert('Bilgi', 'Hatırlatıcı kaldırıldı.');
    } catch (error) {
      console.error('Remove reminder error:', error);
      Alert.alert('Hata', 'Hatırlatıcı kaldırılırken bir hata oluştu.');
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={isReminderSet ? removeMatchReminder : scheduleMatchReminder}
    >
      <MaterialIcons
        name={isReminderSet ? "notifications-active" : "notifications-none"}
        size={24}
        color={isReminderSet ? "#0066cc" : "#666"}
      />
      <Text style={[styles.text, isReminderSet && styles.activeText]}>
        {isReminderSet ? 'Hatırlatıcıyı Kaldır' : 'Hatırlatıcı Ekle'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 5,
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  activeText: {
    color: '#0066cc',
    fontWeight: '600',
  },
});

export default MatchReminder; 