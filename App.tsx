import React from 'react';
import { StatusBar } from 'react-native';
import OccurrenceFormScreen from './screens/OccurrenceFormScreen';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <OccurrenceFormScreen />
    </>
  );
}
