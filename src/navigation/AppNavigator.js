import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainDrawer from './MainDrawer';
import RegistrationTabs from './RegistrationTabs';
import PendingApprovalScreen from '../screens/auth/PendingApprovalScreen';
import { colors } from '../theme';

function Splash() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

// Puerta de entrada según el estado real de la cuenta:
// sin sesión -> login | sin perfil -> registro | pendiente -> espera | aprobado -> app.
export default function AppNavigator() {
  const { bootstrapping, accountStatus } = useAuth();

  if (bootstrapping || accountStatus === 'loading') return <Splash />;
  if (accountStatus === 'signedOut') return <AuthNavigator />;
  if (accountStatus === 'missing') return <RegistrationTabs />;
  if (accountStatus === 'approved') return <MainDrawer />;
  return <PendingApprovalScreen />;
}
