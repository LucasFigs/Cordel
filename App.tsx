import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { Screen, ReviewData } from './types';
import FormScreen from './screens/FormScreen';


export default function App() {
  const [screen, setScreen]         = useState<Screen>('form');
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);

  const handleSubmit = (data: ReviewData) => {
    setReviewData(data);
    setScreen('success');
  };

  const handleNewReview = () => {
    setReviewData(null);
    setScreen('form');
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      {screen === 'form' && (
        <FormScreen onSubmit={handleSubmit} />
      )}
      {screen === 'success' && reviewData && (
        <SuccessScreen data={reviewData} onNewReview={handleNewReview} />
      )}
    </>
  );
}
