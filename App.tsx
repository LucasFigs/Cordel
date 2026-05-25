import React, { useState, useCallback, useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { auth } from './src/firebase/config';
import {
  OccurrenceData, OccurrenceRecord, UserProfile,
  AuthFlow, MainTab,
} from './src/types';

import { BottomNav }             from './src/components/BottomNav';
import { LoginScreen }           from './src/screens/LoginScreen';
import { RegisterScreen }        from './src/screens/RegisterScreen';
import { ForgotPasswordScreen }  from './src/screens/Forgotpasswordscreen';
import { FormScreen }            from './src/screens/FormScreen';
import { ConfirmationScreen }    from './src/screens/ConfirmationScreen';
import { HistoryScreen }         from './src/screens/HistoryScreen';
import { ProfileScreen }         from './src/screens/ProfileScreen';

type VisitorStack =
  | { screen: 'main' }
  | { screen: 'confirmation'; data: OccurrenceData; protocol: number };

// ── Helpers inline (sem depender dos services) ────────────────────────────────
import { db } from './src/firebase/config';
import { makeInitials } from './src/constants';

async function getOrCreateProfile(user: any): Promise<UserProfile> {
  const snap = await db.collection('users').doc(user.uid).get();
  if (snap.exists) return snap.data() as UserProfile;

  const displayName = user.displayName ?? '';
  const parts       = displayName.split(' ');
  const firstName   = parts[0] ?? 'Usuário';
  const lastName    = parts.slice(1).join(' ') || 'Cordel';

  const profile: UserProfile = {
    id:       user.uid,
    firstName,
    lastName,
    email:    user.email ?? '',
    role:     'visitante',
    initials: makeInitials(firstName, lastName),
    provider: 'email',
    bio: '', address: '', phone: '',
  };

  await db.collection('users').doc(user.uid).set(profile);
  return profile;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [authFlow,       setAuthFlow]       = useState<AuthFlow>('login');
  const [profile,        setProfile]        = useState<UserProfile | null>(null);
  const [authLoading,    setAuthLoading]    = useState(true);
  const [activeTab,      setActiveTab]      = useState<MainTab>('historico');
  const [visitorStack,   setVisitorStack]   = useState<VisitorStack>({ screen: 'main' });
  const [occurrences,    setOccurrences]    = useState<OccurrenceRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Observer de auth ────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      if (user) {
        const prof = await getOrCreateProfile(user);
        setProfile(prof);
        loadOccurrences(prof.id);
      } else {
        setProfile(null);
        setOccurrences([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── Ocorrências ─────────────────────────────────────────────────────────
  const loadOccurrences = async (userId: string) => {
    setHistoryLoading(true);
    try {
      const snap = await db
        .collection('occurrences')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const data: OccurrenceRecord[] = snap.docs.map((doc: any) => {
        const d = doc.data();
        return {
          id: doc.id, protocol: d.protocol, status: d.status,
          type: d.type, severity: d.severity, description: d.description,
          dateTime: d.dateTime ?? '', userId: d.userId, place: d.place,
          rating: d.rating,
        } as OccurrenceRecord;
      });
      setOccurrences(data);
    } catch (e) {
      console.warn('Erro ao carregar:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── Auth handlers ───────────────────────────────────────────────────────
  const handleLogin = (p: UserProfile) => {
    setProfile(p);
    setActiveTab('historico');
    loadOccurrences(p.id);
  };

  const handleRegister = (p: UserProfile) => {
    setProfile(p);
    setActiveTab('historico');
  };

  const handleLogout = async () => {
    await auth.signOut();
    setProfile(null);
    setAuthFlow('login');
    setOccurrences([]);
    setVisitorStack({ screen: 'main' });
  };

  const handleSaveProfile = async (updated: UserProfile) => {
    setProfile(updated);
    await db.collection('users').doc(updated.id).set(updated, { merge: true });
  };

  // ── Ocorrências handlers ────────────────────────────────────────────────
  const handleFormSubmit = async (data: OccurrenceData): Promise<void> => {
    const protocol = Math.floor(100000 + Math.random() * 900000);
    const docRef   = await db.collection('occurrences').add({
      ...data,
      protocol,
      status:    'Pendente',
      createdAt: new Date().toISOString(),
    });
    const record: OccurrenceRecord = { ...data, id: docRef.id, protocol, status: 'Pendente' };
    setOccurrences(prev => [record, ...prev]);
    setVisitorStack({ screen: 'confirmation', data, protocol });
    setActiveTab('registrar');
  };

  const handleRefresh = useCallback(async (): Promise<void> => {
    if (profile) await loadOccurrences(profile.id);
  }, [profile]);

  const handleDelete = async (id: string): Promise<void> => {
    await db.collection('occurrences').doc(id).delete();
    setOccurrences(prev => prev.filter(o => o.id !== id));
  };

  // ── Render ──────────────────────────────────────────────────────────────
  if (authLoading) return null;

  if (!profile) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
        {authFlow === 'login' ? (
          <LoginScreen
            onLogin={handleLogin}
            onRegister={() => setAuthFlow('register')}
            onForgotPassword={() => setAuthFlow('forgot')}
          />
        ) : authFlow === 'register' ? (
          <RegisterScreen
            onRegister={handleRegister}
            onBack={() => setAuthFlow('login')}
          />
        ) : (
          <ForgotPasswordScreen
            onBack={() => setAuthFlow('login')}
          />
        )}
      </>
    );
  }

  if (visitorStack.screen === 'confirmation') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
        <ConfirmationScreen
          data={visitorStack.data}
          protocol={visitorStack.protocol}
          onNovaOcorrencia={() => { setVisitorStack({ screen: 'main' }); setActiveTab('registrar'); }}
          onVerHistorico={()   => { setVisitorStack({ screen: 'main' }); setActiveTab('historico'); }}
        />
      </>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'registrar':
        return <FormScreen userId={profile.id} onSubmit={handleFormSubmit} />;
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

// pra rodar