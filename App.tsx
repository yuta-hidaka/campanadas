import React from 'react';
import { StyleSheet, View } from 'react-native';

import Count from './screens/Count';
export default function App() {
  return (
    <View style={styles.container}>
      <Count />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
