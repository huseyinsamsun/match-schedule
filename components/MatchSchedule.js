import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import MatchReminder from './MatchReminder';
import LeagueStandings from './LeagueStandings';
import { MaterialIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const LEAGUES = [
 { id: 203, name: "Süper Lig" },
 { id: 204, name: "TFF 1. Lig" },
 { id: 205, name: "TFF 2. Lig" },
 { id: 2, name: "Şampiyonlar Ligi" },
 { id: 3, name: "UEFA Avrupa Ligi" },
 { id: 848, name: "UEFA Konferans Ligi" },
 { id: 39, name: "Premier Lig" },
 { id: 140, name: "La Liga" },
 { id: 78, name: "Bundesliga" },
 { id: 135, name: "Serie A" },
 { id: 61, name: "Ligue 1" },
 { id: 88, name: "Eredivisie" },
 { id: 94, name: "Primeira Liga" }
];

const BROADCASTERS = {
 203: Platform.select({
   ios: "beIN Sports",
   android: "beIN Connect",
   default: "beIN Sports"
 }),
 204: Platform.select({
   ios: "TRT",
   android: "TRT",
   default: "TRT"
 }),
 205: Platform.select({
   ios: "TRT",
   android: "TRT",
   default: "TRT"
 }),
 2: Platform.select({
   ios: "beIN Sports",
   android: "beIN Connect", 
   default: "beIN Sports"
 }),
 3: Platform.select({
   ios: "TRT",
   android: "TRT",
   default: "TRT"
 }),
 848: Platform.select({
   ios: "EXXEN",
   android: "EXXEN",
   default: "EXXEN"
 }),
 39: Platform.select({
   ios: "beIN Sports",
   android: "beIN Connect",
   default: "beIN Sports"
 }),
 140: Platform.select({
   ios: "Smart Spor",
   android: "S Sport Plus",
   default: "Smart Spor"
 }),
 135: Platform.select({
   ios: "S Sport",
   android: "S Sport Plus",
   default: "S Sport"
 }),
 78: Platform.select({
   ios: "beIN Sports",
   android: "beIN Connect",
   default: "beIN Sports"
 }),
 61: Platform.select({
   ios: "beIN Sports", 
   android: "beIN Connect",
   default: "beIN Sports"
 }),
 88: Platform.select({
   ios: "S Sport",
   android: "S Sport Plus",
   default: "S Sport"
 }),
 94: Platform.select({
   ios: "S Sport",
   android: "S Sport Plus",
   default: "S Sport"
 })
};

// Bildirim ayarlarını yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

const MatchSchedule = () => {
 const [matchesByLeague, setMatchesByLeague] = useState({});
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [lastUpdate, setLastUpdate] = useState(new Date());
 const [expandedMatchId, setExpandedMatchId] = useState(null);
 const [loadingLineups, setLoadingLineups] = useState(false);
 const [lineups, setLineups] = useState({});
 const [showStandings, setShowStandings] = useState({});
 const [lineupsNotified, setLineupsNotified] = useState(new Set());

 const fetchMatches = async () => {
   try {
     console.log('Fetching matches started');
     setLoading(true);
     setError(null);
     
     const now = new Date();
     console.log('Current date:', now);
     
     try {
       const istanbulOffset = 3;
       const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
       const istanbulDate = new Date(utc + (3600000 * istanbulOffset));
       const today = istanbulDate.toISOString().split('T')[0];
       
       console.log('Istanbul date:', istanbulDate);
       console.log('Today:', today);
       
       const currentSeason = istanbulDate.getMonth() < 6 ? istanbulDate.getFullYear() - 1 : istanbulDate.getFullYear();
       console.log('Current season:', currentSeason);

       const axiosConfig = {
         headers: {
           'x-rapidapi-key': API_CONFIG.KEY,
           'x-rapidapi-host': API_CONFIG.HOST
         }
       };

       console.log('Starting API calls for leagues');
       
       const allMatches = await Promise.all(
         LEAGUES.map(async (league) => {
           try {
             console.log(`Fetching matches for league ${league.name} (${league.id})`);
             const url = `https://${API_CONFIG.HOST}/fixtures?date=${today}&league=${league.id}&season=${currentSeason}&timezone=Europe/Istanbul`;
             console.log('API URL:', url);
             
             const response = await axios.get(url, axiosConfig);
             
             if (!response.data || !Array.isArray(response.data.response)) {
               console.log(`Invalid response for league ${league.name}`);
               return [];
             }
             
             console.log(`Received ${response.data.response.length} matches for league ${league.name}`);
             return response.data.response;

           } catch (error) {
             console.log(`Error fetching league ${league.name}:`, error.message);
             console.error(`Error details for ${league.name}:`, error);
             return [];
           }
         })
       );

       console.log('All API calls completed');
       
       const groupedMatches = {};
       allMatches.forEach((leagueMatches, index) => {
         if (!Array.isArray(leagueMatches)) {
           console.log(`Invalid matches data for league ${LEAGUES[index].name}`);
           return;
         }
         
         const leagueId = LEAGUES[index].id;
         if (leagueMatches && leagueMatches.length > 0) {
           groupedMatches[leagueId] = leagueMatches;
           console.log(`Added ${leagueMatches.length} matches for league ${LEAGUES[index].name}`);
         }
       });

       console.log('Setting matches to state');
       setMatchesByLeague(groupedMatches);
       setLastUpdate(new Date());
       
     } catch (err) {
       console.log('Error processing data:', err.message);
       console.error('Processing error details:', err);
       setError('Veri işlenirken bir hata oluştu: ' + err.message);
       setMatchesByLeague({});
     }
     
   } catch (err) {
     console.log('Fatal error in fetchMatches:', err.message);
     console.error('Fatal error details:', err);
     setError('Beklenmeyen bir hata oluştu: ' + err.message);
     setMatchesByLeague({});
   } finally {
     console.log('Fetch completed, setting loading to false');
     setLoading(false);
   }
 };

 const fetchLineups = async (matchId) => {
   try {
     console.log('Fetching lineups started for match:', matchId);
     setLoadingLineups(true);
     
     const axiosConfig = {
       headers: {
         'x-rapidapi-key': API_CONFIG.KEY,
         'x-rapidapi-host': API_CONFIG.HOST
       }
     };

     const url = `https://${API_CONFIG.HOST}/fixtures/lineups?fixture=${matchId}`;
     console.log('Lineup API URL:', url);

     const response = await axios.get(url, axiosConfig);
     
     if (!response.data || !Array.isArray(response.data.response) || response.data.response.length === 0) {
       console.log('No lineup data available');
       setLineups(prevLineups => ({
         ...prevLineups,
         [matchId]: null
       }));
       return;
     }
     
     console.log(`Received lineup data for match ${matchId}`);
     setLineups(prevLineups => ({
       ...prevLineups,
       [matchId]: response.data.response
     }));
   } catch (error) {
     console.log(`Error fetching lineups: ${error.message}`);
     console.error('Lineup error details:', error);
     setLineups(prevLineups => ({
       ...prevLineups,
       [matchId]: null
     }));
   } finally {
     setLoadingLineups(false);
   }
 };

 const checkLineups = async (match) => {
   try {
     if (lineupsNotified.has(match.fixture.id)) {
       return;
     }

     const response = await axios.get(`https://${API_CONFIG.HOST}/fixtures/lineups`, {
       params: {
         fixture: match.fixture.id
       },
       headers: {
         'x-rapidapi-key': API_CONFIG.KEY,
         'x-rapidapi-host': API_CONFIG.HOST
       }
     });

     if (response.data?.response?.length > 0) {
       await Notifications.scheduleNotificationAsync({
         content: {
           title: "İlk 11'ler Açıklandı!",
           body: `${match.teams.home.name} vs ${match.teams.away.name} maçının ilk 11'leri açıklandı!`,
           data: { matchId: match.fixture.id },
           sound: true,
           priority: 'high',
           vibrate: [0, 250, 250, 250],
         },
         trigger: {
           type: 'date',
           timestamp: Date.now(),
           channelId: 'lineups-notification'
         }
       });

       setLineupsNotified(prev => new Set([...prev, match.fixture.id]));
     }
   } catch (error) {
     console.error('Lineup check error:', error);
   }
 };

 useEffect(() => {
   let isMounted = true;
   let intervalId = null;

   const fetchData = async () => {
     try {
       if (isMounted) {
         await fetchMatches();
       }
     } catch (error) {
       console.log('Error in useEffect fetch:', error.message);
       if (isMounted) {
         setError('Veri güncellenirken hata oluştu');
         setLoading(false);
       }
     }
   };

   fetchData();

   try {
     intervalId = setInterval(fetchData, 300000);
   } catch (error) {
     console.log('Error setting up interval:', error.message);
   }

   return () => {
     isMounted = false;
     if (intervalId) {
       clearInterval(intervalId);
     }
   };
 }, []);

 useEffect(() => {
   let intervalId;

   const checkAllLineups = async () => {
     Object.values(matchesByLeague).forEach(matches => {
       matches.forEach(match => {
         const matchTime = new Date(match.fixture.date);
         const now = new Date();
         if (matchTime - now <= 3600000 && matchTime > now) {
           checkLineups(match);
         }
       });
     });
   };

   if (Object.keys(matchesByLeague).length > 0) {
     intervalId = setInterval(checkAllLineups, 300000);
   }

   return () => {
     if (intervalId) {
       clearInterval(intervalId);
     }
   };
 }, [matchesByLeague]);

 const getMatchStatus = (status) => {
   switch(status.short) {
     case '1H':
       return '1. Devre';
     case '2H':
       return '2. Devre';
     case 'HT':
       return 'Devre Arası';
     case 'ET':
       return 'Uzatma';
     case 'P':
       return 'Penaltılar';
     case 'FT':
       return 'Maç Sonu';
     case 'LIVE':
       return 'CANLI';
     case 'NS':
       return 'Başlamadı';
     default:
       return 'Başlamadı';
   }
 };

 const renderLineups = (matchId) => {
   if (loadingLineups) {
     return (
       <View style={styles.loadingContainer}>
         <ActivityIndicator size="small" color="#0066cc" />
         <Text style={styles.loadingText}>İlk 11'ler yükleniyor...</Text>
       </View>
     );
   }

   const matchLineups = lineups[matchId];
  
   if (!matchLineups) {
     return (
       <View style={styles.noLineupContainer}>
         <Text style={styles.noLineupText}>İlk 11'ler henüz açıklanmadı</Text>
       </View>
     );
   }

   return (
     <View style={styles.lineupsContainer}>
       <View style={styles.lineupsRow}>
         {matchLineups.map((team, index) => (
           <View key={index} style={[styles.teamLineup, index === 1 && styles.awayTeam]}>
             <Text style={styles.teamName}>{team.team.name}</Text>
             <View style={styles.playersList}>
               {team.startXI && team.startXI.map((player, playerIndex) => (
                 <Text key={playerIndex} style={styles.playerText}>
                   {player.player.number}. {player.player.name}
                 </Text>
               ))}
             </View>
           </View>
         ))}
       </View>
     </View>
   );
 };

 const toggleStandings = (leagueId) => {
   setShowStandings(prev => ({
     ...prev,
     [leagueId]: !prev[leagueId]
   }));
 };

 const renderLeagueMatches = (leagueId) => {
   const matches = matchesByLeague[leagueId] || [];
   const league = LEAGUES.find(l => l.id === leagueId);
   
   if (matches.length === 0) return null;

   return (
     <View key={leagueId} style={styles.leagueSection}>
       <TouchableOpacity 
         style={styles.leagueHeader}
         onPress={() => toggleStandings(leagueId)}
       >
         <Text style={styles.leagueTitle}>{league?.name || 'Yüklenemedi'}</Text>
         <MaterialIcons 
           name={showStandings[leagueId] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
           size={24} 
           color="#1a237e" 
         />
       </TouchableOpacity>
       
       {showStandings[leagueId] && (
         <LeagueStandings leagueId={leagueId} />
       )}

       {matches.map(match => (
         <TouchableOpacity 
           key={match?.fixture?.id || Math.random()} 
           style={[styles.matchCard, expandedMatchId === match.fixture.id && styles.expandedCard]}
           onPress={async () => {
             if (expandedMatchId === match.fixture.id) {
               setExpandedMatchId(null);
             } else {
               await fetchLineups(match.fixture.id);
               setExpandedMatchId(match.fixture.id);
             }
           }}
         >
           <View style={styles.matchInfo}>
             <Text style={styles.teamText}>
               {match?.teams?.home?.name || 'Yüklenemedi'}
             </Text>
             <View style={styles.scoreContainer}>
               <Text style={styles.timeText}>
                 {match?.fixture?.date ? new Date(match.fixture.date).toLocaleTimeString('tr-TR', {
                   hour: '2-digit',
                   minute: '2-digit'
                 }) : '--:--'}
               </Text>
               {match?.fixture?.status?.short !== 'NS' && (
                 <Text style={[styles.statusText, match?.fixture?.status?.short === 'LIVE' && styles.liveStatus]}>
                   {match?.fixture?.status ? getMatchStatus(match.fixture.status) : 'Yüklenemedi'}
                 </Text>
               )}
             </View>
             <Text style={styles.teamText}>
               {match?.teams?.away?.name || 'Yüklenemedi'}
             </Text>
           </View>
           
           <View style={styles.actionContainer}>
             <View style={styles.broadcasterContainer}>
               <Text style={styles.broadcasterText}>
                 {BROADCASTERS[leagueId] || 'Yüklenemedi'}
               </Text>
             </View>
             <MatchReminder match={match} />
           </View>

           {expandedMatchId === match.fixture.id && renderLineups(match.fixture.id)}
         </TouchableOpacity>
       ))}
     </View>
   );
 };

 return (
   <View style={styles.container}>
     {loading ? (
       <View style={styles.centerContent}>
         <ActivityIndicator size="large" color="#0066cc" />
         <Text style={styles.loadingText}>Maçlar yükleniyor...</Text>
       </View>
     ) : error ? (
       <View style={styles.centerContent}>
         <Text style={styles.errorText}>{error}</Text>
       </View>
     ) : (
       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
         {Object.keys(matchesByLeague).length > 0 ? (
           LEAGUES.map(league => renderLeagueMatches(league.id))
         ) : (
           <Text style={styles.noMatchText}>Bugün planlanmış maç bulunmuyor.</Text>
         )}
       </ScrollView>
     )}
   </View>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: '#f0f2f5',
 },
 scrollView: {
   width: '100%',
   maxWidth: 800,
   alignSelf: 'center',
   padding: 16
 },
 leagueSection: {
   marginBottom: 24,
   backgroundColor: '#fff',
   borderRadius: 20,
   padding: 16,
   ...Platform.select({
     ios: {
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 4 },
       shadowOpacity: 0.15,
       shadowRadius: 8,
     },
     android: {
       elevation: 5,
     },
   }),
 },
 leagueTitle: {
   fontSize: 22,
   fontWeight: '800',
   color: '#1a237e',
   marginBottom: 16,
   paddingLeft: 12,
   borderLeftWidth: 5,
   borderLeftColor: '#3f51b5',
   paddingVertical: 8,
   letterSpacing: 0.5
 },
 centerContent: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: '#fff'
 },
 matchCard: {
   backgroundColor: '#ffffff',
   padding: 20,
   marginVertical: 8,
   borderRadius: 16,
   ...Platform.select({
     ios: {
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.1,
       shadowRadius: 4,
     },
     android: {
       elevation: 3,
     },
   }),
   borderWidth: 1,
   borderColor: '#e8eaf6'
 },
 expandedCard: {
   backgroundColor: '#f5f6fa',
   borderColor: '#c5cae9'
 },
 matchInfo: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center'
 },
 teamText: {
   fontSize: 16,
   fontWeight: '700',
   flex: 1,
   textAlign: 'center',
   color: '#283593',
   letterSpacing: 0.3
 },
 scoreContainer: {
   alignItems: 'center',
   paddingHorizontal: 24,
   minWidth: 120
 },
 timeText: {
   fontSize: 18,
   color: '#3f51b5',
   marginBottom: 6,
   fontWeight: '700'
 },
 statusText: {
   fontSize: 14,
   color: '#5c6bc0',
   marginTop: 4,
   fontWeight: '600',
   letterSpacing: 0.5
 },
 liveStatus: {
   color: '#f50057',
   fontWeight: '800'
 },
 broadcasterContainer: {
   marginTop: 12,
   paddingTop: 12,
   borderTopWidth: 1,
   borderTopColor: '#e8eaf6',
 },
 broadcasterText: {
   fontSize: 14,
   color: '#3f51b5',
   textAlign: 'center',
   fontWeight: '700',
   letterSpacing: 0.5
 },
 errorText: {
   color: '#f50057',
   textAlign: 'center',
   fontSize: 16,
   fontWeight: '600',
   letterSpacing: 0.5
 },
 loadingText: {
   marginTop: 12,
   color: '#3f51b5',
   fontSize: 16,
   fontWeight: '500'
 },
 noMatchText: {
   textAlign: 'center',
   color: '#5c6bc0',
   marginTop: 32,
   fontSize: 18,
   fontWeight: '500',
   fontStyle: 'italic',
   letterSpacing: 0.5
 },
 lineupsContainer: {
   marginTop: 16,
   paddingTop: 16,
   borderTopWidth: 1,
   borderTopColor: '#e8eaf6',
 },
 lineupsRow: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   gap: 8,
 },
 teamLineup: {
   flex: 1,
   padding: 12,
   backgroundColor: '#fff',
   borderRadius: 12,
   ...Platform.select({
     ios: {
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 1 },
       shadowOpacity: 0.1,
       shadowRadius: 2,
     },
     android: {
       elevation: 2,
     },
   }),
 },
 awayTeam: {
   backgroundColor: '#f8f9ff'
 },
 teamName: {
   fontSize: 15,
   fontWeight: '800',
   marginBottom: 10,
   textAlign: 'center',
   color: '#1a237e',
   paddingBottom: 8,
   borderBottomWidth: 1,
   borderBottomColor: '#e8eaf6',
   letterSpacing: 0.5
 },
 playersList: {
   paddingHorizontal: 8
 },
 playerText: {
   fontSize: 13,
   color: '#3949ab',
   fontWeight: '500',
   letterSpacing: 0.3,
   marginVertical: 2,
   paddingVertical: 1
 },
 loadingContainer: {
   padding: 12,
   alignItems: 'center',
   justifyContent: 'center',
   flexDirection: 'row'
 },
 noLineupContainer: {
   padding: 12,
   alignItems: 'center',
   justifyContent: 'center'
 },
 noLineupText: {
   color: '#5c6bc0',
   fontSize: 14,
   fontWeight: '500',
   letterSpacing: 0.3
 },
 leagueHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingVertical: 12,
   paddingHorizontal: 16,
   backgroundColor: '#f5f6fa',
   borderRadius: 10,
   marginBottom: 10,
 },
 actionContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginTop: 10,
   paddingTop: 10,
   borderTopWidth: 1,
   borderTopColor: '#e8eaf6',
 },
});

export default MatchSchedule;