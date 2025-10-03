import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import AuthStack from './app/auth/AuthStack'; // importando a stack de autenticação

export default function App() {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
}
