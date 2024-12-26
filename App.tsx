/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import DOMComponent from './src/my-component';

function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <DOMComponent
          dom={{
            scrollEnabled: false,
          }}
        />
      </View>
      <View style={[styles.container, styles.blue]}>
        <Text style={styles.text}>Native</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 72,
  },
  blue: {
    backgroundColor: 'blue',
  },
});

export default App;
