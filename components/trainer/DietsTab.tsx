import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DietsTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dietas (Próximamente)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  text: {
    fontSize: 18,
    color: '#4A5568',
  },
});
