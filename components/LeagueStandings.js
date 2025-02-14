import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const LeagueStandings = ({ leagueId }) => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Sezon hesaplaması
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // 0-based indexten 1-based indexe çeviriyoruz
        const currentYear = currentDate.getFullYear();
        const season = currentMonth < 7 ? currentYear - 1 : currentYear;
        
        console.log('Fetching standings for:', { leagueId, season });
        
        const response = await axios.get(`https://${API_CONFIG.HOST}/standings`, {
          params: {
            league: leagueId,
            season: season
          },
          headers: {
            'x-rapidapi-key': API_CONFIG.KEY,
            'x-rapidapi-host': API_CONFIG.HOST
          }
        });

        console.log('Standings response:', response.data?.response?.[0]?.league?.standings?.[0] ? 'Data received' : 'No data');

        if (response.data?.response?.[0]?.league?.standings?.[0]) {
          setStandings(response.data.response[0].league.standings[0]);
        } else {
          setError('Puan durumu bulunamadı');
        }
      } catch (err) {
        console.error('Standings error details:', err.response || err);
        setError('Puan durumu yüklenirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [leagueId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Puan durumu yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.rankCell]}>S</Text>
        <Text style={[styles.headerCell, styles.teamCell]}>Takım</Text>
        <Text style={styles.headerCell}>O</Text>
        <Text style={styles.headerCell}>G</Text>
        <Text style={styles.headerCell}>B</Text>
        <Text style={styles.headerCell}>M</Text>
        <Text style={styles.headerCell}>P</Text>
      </View>
      {standings.map((team) => (
        <View key={team.team.id} style={styles.row}>
          <Text style={[styles.cell, styles.rankCell]}>{team.rank}</Text>
          <Text style={[styles.cell, styles.teamCell]} numberOfLines={1}>
            {team.team.name}
          </Text>
          <Text style={styles.cell}>{team.all.played}</Text>
          <Text style={styles.cell}>{team.all.win}</Text>
          <Text style={styles.cell}>{team.all.draw}</Text>
          <Text style={styles.cell}>{team.all.lose}</Text>
          <Text style={[styles.cell, styles.pointsCell]}>{team.points}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
    color: '#333',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#444',
  },
  rankCell: {
    flex: 0.5,
    fontWeight: '600',
  },
  teamCell: {
    flex: 3,
    textAlign: 'left',
    paddingLeft: 10,
  },
  pointsCell: {
    fontWeight: '700',
    color: '#333',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#e53935',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LeagueStandings; 
