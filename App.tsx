import React, { useState, useCallback, useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { auth, db } from './src/firebase/config';
import {
  OccurrenceData, OccurrenceRecord, OccurrenceStatus,
  UserProfile, Notification, AuthFlow, MainTab,
} from './src/types';
import { makeInitials, getNowFormatted } from './src/constants';

import { BottomNav }          from './src/components/BottomNav';
import { LoginScreen }        from './src/screens/LoginScreen';
import { RegisterScreen }     from './src/screens/RegisterScreen';
import { FormScreen }         from './src/screens/FormScreen';
import { ConfirmationScreen } from './src/screens/ConfirmationScreen';
import { HistoryScreen }      from './src/screens/HistoryScreen';
import { RatingScreen }       from './src/screens/RatingScreen';
import { AlertsScreen }       from './src/screens/AlertsScreen';
import { ProfileScreen }      from './src/screens/ProfileScreen';
import { AdminScreen }        from './src/screens/AdminScreen';

type VisitorStack =
  | { screen: 'main' }
  | { screen: 'confirmation'; data: OccurrenceData; protocol: number };

async function getOrCreateProfile(user: any): Promise<UserProfile> {
  const snap = await db.collection('users').doc(user.uid).get();
  if (snap.exists) return snap.data() as UserProfile;
  const displayName = user.displayName ?? '';
  const parts       = displayName.split(' ');
  const firstName   = parts[0] ?? 'Usuário';
  const lastName    = parts.slice(1).join(' ') || 'Cordel';
  const profile: UserProfile = {
    id: user.uid, firstName, lastName, email: user.email ?? '',
    role: 'visitante', initials: makeInitials(firstName, lastName),
    provider: 'email', bio: '', address: '', phone: '',
  };
  await db.collection('users').doc(user.uid).set(profile);
  return profile;
}

export default function App() {
  const [authFlow,       setAuthFlow]       = useState<AuthFlow>('login');
  const [profile,        setProfile]        = useState<UserProfile | null>(null);
  // ✅ Começa false — app mostra Login imediatamente enquanto Firebase verifica
  const [authLoading,    setAuthLoading]    = useState(false);
  const [activeTab,      setActiveTab]      = useState<MainTab>('historico');
  const [visitorStack,   setVisitorStack]   = useState<VisitorStack>({ screen: 'main' });
  const [occurrences,    setOccurrences]    = useState<OccurrenceRecord[]>([]);
  const [notifications,  setNotifications]  = useState<Notification[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.read && n.userId === profile?.id).length;
  const isAdmin     = profile?.role === 'admin';

  // ── Observer Firebase Auth ──────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
      if (user) {
        const prof = await getOrCreateProfile(user);
        setProfile(prof);
        if (prof.role === 'admin') loadAllOccurrences();
        else loadOccurrences(prof.id);
      } else {
        setProfile(null);
        setOccurrences([]);
        setNotifications([]);
      }
      setAuthLoading(false);
    });

    // Timeout de segurança — se Firebase não responder em 3s mostra Login
    const timeout = setTimeout(() => setAuthLoading(false), 3000);

    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);

  // ── Carrega ocorrências ─────────────────────────────────────────────────
  const loadOccurrences = async (userId: string) => {
    setHistoryLoading(true);
    try {
      const snap = await db
        .collection('occurrences')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      setOccurrences(snap.docs.map((doc: any) => {
        const d = doc.data();
        return {
          id: doc.id, protocol: d.protocol, status: d.status, type: d.type,
          severity: d.severity, description: d.description, dateTime: d.dateTime ?? '',
          userId: d.userId, place: d.place, rating: d.rating,
        } as OccurrenceRecord;
      }));
    } catch (e) { console.warn('Erro ao carregar:', e); }
    finally { setHistoryLoading(false); }
  };

  const loadAllOccurrences = async () => {
    setHistoryLoading(true);
    try {
      const snap = await db.collection('occurrences').orderBy('createdAt', 'desc').get();
      setOccurrences(snap.docs.map((doc: any) => {
        const d = doc.data();
        return {
          id: doc.id, protocol: d.protocol, status: d.status, type: d.type,
          severity: d.severity, description: d.description, dateTime: d.dateTime ?? '',
          userId: d.userId, place: d.place, rating: d.rating,
        } as OccurrenceRecord;
      }));
    } catch (e) { console.warn('Erro ao carregar:', e); }
    finally { setHistoryLoading(false); }
  };

  // ── Auth handlers ───────────────────────────────────────────────────────
  const handleLogin = (p: UserProfile) => {
    setProfile(p);
    setActiveTab('historico');
    if (p.role === 'admin') loadAllOccurrences();
    else loadOccurrences(p.id);
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
    setNotifications([]);
    setVisitorStack({ screen: 'main' });
  };

  const handleSaveProfile = async (updated: UserProfile) => {
    setProfile(updated);
    await db.collection('users').doc(updated.id).set(updated, { merge: true });
  };

  // ── Ocorrências ─────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: OccurrenceData): Promise<void> => {
    const protocol = Math.floor(100000 + Math.random() * 900000);
    const docRef   = await db.collection('occurrences').add({
      ...data, protocol, status: 'Pendente', createdAt: new Date().toISOString(),
    });
    const record: OccurrenceRecord = { ...data, id: docRef.id, protocol, status: 'Pendente' };
    setOccurrences(prev => [record, ...prev]);
    setVisitorStack({ screen: 'confirmation', data, protocol });
    setActiveTab('registrar');
  };

  // RF02 — Avaliação
  const handleRatingSubmit = async (data: OccurrenceData): Promise<void> => {
    const protocol = Math.floor(100000 + Math.random() * 900000);
    const docRef   = await db.collection('occurrences').add({
      ...data, protocol, status: 'Pendente', createdAt: new Date().toISOString(),
    });
    setOccurrences(prev => [{ ...data, id: docRef.id, protocol, status: 'Pendente' }, ...prev]);
  };

  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!profile) return;
    if (profile.role === 'admin') await loadAllOccurrences();
    else await loadOccurrences(profile.id);
  }, [profile]);

  // #24 — Excluir pendente
  const handleDelete = async (id: string): Promise<void> => {
    await db.collection('occurrences').doc(id).delete();
    setOccurrences(prev => prev.filter(o => o.id !== id));
  };

  // RF07 — Editar pendente
  const handleEdit = async (updated: OccurrenceRecord): Promise<void> => {
    await db.collection('occurrences').doc(updated.id).set(
      { description: updated.description, severity: updated.severity },
      { merge: true }
    );
    setOccurrences(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  // RF09 + RF10 — Admin altera status e gera notificação
  const handleUpdateStatus = async (
    id: string, newStatus: OccurrenceStatus, targetUserId: string,
  ): Promise<void> => {
    const target = occurrences.find(o => o.id === id);
    if (!target) return;
    await db.collection('occurrences').doc(id).set({ status: newStatus }, { merge: true });
    setOccurrences(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    const notif: Notification = {
      id:           `notif-${Date.now()}`,
      userId:       targetUserId,
      occurrenceId: id,
      protocol:     target.protocol,
      message:      `Sua ocorrência no ${target.place.name} foi atualizada para "${newStatus}".`,
      dateTime:     getNowFormatted(),
      read:         false,
      newStatus,
    };
    await db.collection('notifications').add(notif);
    setNotifications(prev => [notif, ...prev]);
  };

  const handleMarkRead    = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const handleMarkAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  // ── Render ──────────────────────────────────────────────────────────────

  // Mostra nada apenas se ainda está carregando E já detectou sessão
  if (authLoading && profile !== null) return null;

  // ✅ Sem sessão → Login ou Cadastro
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

  // Tela de confirmação pós-envio
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

  // Admin — tela única sem bottom nav
  if (isAdmin) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
        <AdminScreen occurrences={occurrences} onUpdateStatus={handleUpdateStatus} />
      </View>
    );
  }

  // Visitante — 5 abas
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
            onEditOccurrence={handleEdit}
            onRefresh={handleRefresh}
          />
        );
      case 'avaliar':
        return <RatingScreen userId={profile.id} onSubmit={handleRatingSubmit} />;
      case 'alertas':
        return (
          <AlertsScreen
            notifications={notifications.filter(n => n.userId === profile.id)}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
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
      <BottomNav active={activeTab} unreadCount={unreadCount} onPress={setActiveTab} />
    </View>
  );
}

// pra rodar