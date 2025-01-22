import { View, StyleSheet } from 'react-native';
import MatchSchedule from '../../components/MatchSchedule';

export default function Home() {
  return (
    <View style={styles.container}>
      <MatchSchedule />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});