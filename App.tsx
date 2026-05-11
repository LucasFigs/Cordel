import React, { useState, useCallback } from 'react';
import { View, StatusBar } from 'react-native';
import {
  OccurrenceData, OccurrenceRecord, UserProfile,
  AuthFlow, MainTab,
} from './src/types';

import { BottomNav }          from './src/components/BottomNav';
import { LoginScreen }        from './src/screens/LoginScreen';
import { RegisterScreen }     from './src/screens/RegisterScreen';
import { FormScreen }         from './src/screens/FormScreen';
import { ConfirmationScreen } from './src/screens/ConfirmationScreen';
import { HistoryScreen }      from './src/screens/HistoryScreen';
import { ProfileScreen }      from './src/screens/ProfileScreen';

// ── Stack de telas do visitante ──────────────────────────────────────────
type VisitorStack =
  | { screen: 'main' }
  | { screen: 'confirmation'; data: OccurrenceData; protocol: number };

export default function App() {
  // ── Auth ────────────────────────────────────────────────────────────────
  const [authFlow,  setAuthFlow]  = useState<AuthFlow>('login');
  const [profile,   setProfile]   = useState<UserProfile | null>(null);

  // ── Navegação ────────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState<MainTab>('historico');
  const [visitorStack, setVisitorStack] = useState<VisitorStack>({ screen: 'main' });

  // ── Dados ────────────────────────────────────────────────────────────────
  const [occurrences,    setOccurrences]    = useState<OccurrenceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ────────────────────────────────────────────────────────────────────────
  // Auth handlers
  // ────────────────────────────────────────────────────────────────────────
  const handleLogin    = (p: UserProfile) => { setProfile(p); setActiveTab('historico'); };
  const handleRegister = (p: UserProfile) => { setProfile(p); setActiveTab('historico'); };

  const handleLogout = () => {
    setProfile(null);
    setAuthFlow('login');
    setOccurrences([]);
    setVisitorStack({ screen: 'main' });
  };

  const handleSaveProfile = (updated: UserProfile) => setProfile(updated);

  // ────────────────────────────────────────────────────────────────────────
  // Ocorrências
  // ────────────────────────────────────────────────────────────────────────

  // Submissão com loading + Toast no FormScreen
  const handleFormSubmit = async (data: OccurrenceData): Promise<void> => {
    // Simula delay de rede (a lógica de Toast fica no FormScreen)
    await new Promise(r => setTimeout(r, 1200));
    if (Math.random() < 0.1) throw new Error('Falha ao enviar. Verifique sua conexão.');

    const protocol = Math.floor(100000 + Math.random() * 900000);
    const record: OccurrenceRecord = {
      ...data,
      id:     String(Date.now()),
      protocol,
      status: 'Pendente',
    };
    setOccurrences(prev => [record, ...prev]);
    // Navega para confirmação (feedback visual pós-envio)
    setVisitorStack({ screen: 'confirmation', data, protocol });
    setActiveTab('registrar');
  };

  // Pull to refresh — busca novos dados (simulado)
  const handleRefresh = useCallback(async (): Promise<void> => {
    await new Promise(r => setTimeout(r, 1000));
    if (Math.random() < 0.08) throw new Error('Sem conexão');
    // Em produção: re-fetch do Firestore
    // setOccurrences(await firestoreFetch(profile!.id));
  }, []);

  // Excluir pendente com feedback
  const handleDelete = async (id: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 700));
    if (Math.random() < 0.05) throw new Error('Falha ao excluir');
    setOccurrences(prev => prev.filter(o => o.id !== id));
  };

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────

  // Sem sessão → fluxo de auth
  if (!profile) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
        {authFlow === 'login' ? (
          <LoginScreen
            onLogin={handleLogin}
            onRegister={() => setAuthFlow('register')}
          />
        ) : (
          <RegisterScreen
            onRegister={handleRegister}
            onBack={() => setAuthFlow('login')}
          />
        )}
      </>
    );
  }

  // Tela de confirmação pós-envio (fora do bottom nav)
  if (visitorStack.screen === 'confirmation') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
        <ConfirmationScreen
          data={visitorStack.data}
          protocol={visitorStack.protocol}
          onNovaOcorrencia={() => {
            setVisitorStack({ screen: 'main' });
            setActiveTab('registrar');
          }}
          onVerHistorico={() => {
            setVisitorStack({ screen: 'main' });
            setActiveTab('historico');
          }}
        />
      </>
    );
  }

  // App principal com bottom nav
  const renderScreen = () => {
    switch (activeTab) {
      case 'registrar':
        return (
          <FormScreen
            userId={profile.id}
            onSubmit={handleFormSubmit}
          />
        );

      case 'historico':
        return (
          <HistoryScreen
            userId={profile.id}
            occurrences={occurrences}
            loading={historyLoading}
            onNewOccurrence={() => setActiveTab('registrar')}
            onDeleteOccurrence={handleDelete}
            onRefresh={handleRefresh}
          />
        );

      case 'perfil':
        return (
          <ProfileScreen
            profile={profile}
            occurrences={occurrences.filter(o => o.userId === profile.id)}
            onSave={handleSaveProfile}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <View style={{ flex: 1 }}>{renderScreen()}</View>
      <BottomNav active={activeTab} onPress={setActiveTab} />
    </View>
  );
}
