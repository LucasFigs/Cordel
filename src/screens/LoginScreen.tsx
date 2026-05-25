import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, AuthProvider } from '../types';
import { C, makeInitials } from '../constants';
import { auth } from '../styles';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';

interface LoginScreenProps {
  onLogin:           (profile: UserProfile) => void;
  onRegister:        () => void;
  onForgotPassword:  () => void;
}

// ── Simula autenticação social ────────────────────────────────────────────
async function fakeOAuthLogin(provider: AuthProvider): Promise<UserProfile> {
  await new Promise(r => setTimeout(r, 1400));
  if (provider === 'google') {
    return {
      id: 'google-001', firstName: 'Usuário', lastName: 'Google',
      email: 'usuario@gmail.com', role: 'visitante',
      initials: 'UG', provider: 'google', photoURL: undefined,
    };
  }
  return {
    id: 'fb-001', firstName: 'Usuário', lastName: 'Facebook',
    email: 'usuario@facebook.com', role: 'visitante',
    initials: 'UF', provider: 'facebook', photoURL: undefined,
  };
}

async function fakeEmailLogin(email: string, _password: string): Promise<UserProfile> {
  await new Promise(r => setTimeout(r, 1000));
  // Simula erro de rede aleatório (10%)
  if (Math.random() < 0.1) throw new Error('Falha ao conectar ao servidor.');
  const parts     = email.split('@')[0].split('.');
  const firstName = parts[0]  ? parts[0].charAt(0).toUpperCase()  + parts[0].slice(1)  : 'Usuário';
  const lastName  = parts[1]  ? parts[1].charAt(0).toUpperCase()  + parts[1].slice(1)  : 'Cordel';
  return {
    id: `email-${Date.now()}`, firstName, lastName,
    email, role: 'visitante',
    initials: makeInitials(firstName, lastName),
    provider: 'email',
  };
}

export function LoginScreen({ onLogin, onRegister, onForgotPassword }: LoginScreenProps) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [touched,  setTouched]  = useState<Record<string, boolean>>({});
  const [loading,  setLoading]  = useState(false);
  const { toast, showLoading, showError, hide } = useToast();

  const emailOk    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passwordOk = password.length >= 6;
  const isValid    = emailOk && passwordOk;

  function touch(f: string) { setTouched(p => ({ ...p, [f]: true })); }

  const handleEmailLogin = async () => {
    setTouched({ email: true, password: true });
    if (!isValid) return;
    setLoading(true);
    showLoading('Entrando…');
    try {
      const profile = await fakeEmailLogin(email.trim(), password);
      hide();
      onLogin(profile);
    } catch (e: any) {
      showError(e?.message ?? 'Falha ao entrar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: AuthProvider) => {
    setLoading(true);
    showLoading(provider === 'google' ? 'Conectando com Google…' : 'Conectando com Facebook…');
    try {
      const profile = await fakeOAuthLogin(provider);
      hide();
      onLogin(profile);
    } catch {
      showError('Falha ao conectar. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={auth.root}>
        <View style={auth.topBand} />
        <Toast toast={toast} />

        <ScrollView
          contentContainerStyle={auth.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <View style={auth.brandWrap}>
            <View style={auth.logoCircle}>
              <Ionicons name="book-outline" size={38} color="#fff" />
            </View>
            <Text style={auth.appName}>Cordel</Text>
            <Text style={auth.appSlug}>Registre sua história</Text>
          </View>

          <View style={auth.card}>
            <Text style={auth.cardTitle}>Entrar na conta</Text>
            <Text style={auth.cardSub}>Bem-vindo(a) de volta!</Text>

            {/* Botões sociais */}
            <View style={auth.socialRow}>
              <TouchableOpacity
                style={auth.socialBtn}
                onPress={() => handleSocialLogin('google')}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={20} color={C.google} />
                <Text style={auth.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={auth.socialBtn}
                onPress={() => handleSocialLogin('facebook')}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-facebook" size={20} color={C.facebook} />
                <Text style={auth.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={auth.dividerRow}>
              <View style={auth.dividerLine} />
              <Text style={auth.dividerText}>ou use e-mail</Text>
              <View style={auth.dividerLine} />
            </View>

            {/* E-mail */}
            <Text style={auth.label}>E-mail <Text style={auth.req}>*</Text></Text>
            <View style={[auth.inputWrap, touched.email && !emailOk && auth.inputErr]}>
              <Ionicons name="mail-outline" size={18} color={C.textMuted} style={auth.inputIcon} />
              <TextInput
                style={auth.input}
                placeholder="seu@email.com"
                placeholderTextColor={C.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={v => { setEmail(v); touch('email'); }}
                onBlur={() => touch('email')}
              />
            </View>
            {touched.email && !emailOk && (
              <View style={auth.errorRow}>
                <Ionicons name="alert-circle" size={13} color={C.error} />
                <Text style={auth.errorText}>Informe um e-mail válido</Text>
              </View>
            )}

            {/* Senha */}
            <Text style={[auth.label, { marginTop: 14 }]}>Senha <Text style={auth.req}>*</Text></Text>
            <View style={[auth.inputWrap, touched.password && !passwordOk && auth.inputErr]}>
              <Ionicons name="lock-closed-outline" size={18} color={C.textMuted} style={auth.inputIcon} />
              <TextInput
                style={auth.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={C.textMuted}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={v => { setPassword(v); touch('password'); }}
                onBlur={() => touch('password')}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={auth.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.textMuted} />
              </TouchableOpacity>
            </View>
            {touched.password && !passwordOk && (
              <View style={auth.errorRow}>
                <Ionicons name="alert-circle" size={13} color={C.error} />
                <Text style={auth.errorText}>A senha deve ter pelo menos 6 caracteres</Text>
              </View>
            )}

            <TouchableOpacity style={auth.forgotBtn} onPress={onForgotPassword} activeOpacity={0.7}>
              <Text style={auth.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            {/* Botão entrar */}
            <TouchableOpacity
              style={[auth.submitBtn, (!isValid || loading) && auth.submitBtnDisabled]}
              onPress={handleEmailLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color={isValid ? '#fff' : C.textMuted} />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={18} color={isValid ? '#fff' : C.textMuted} style={{ marginRight: 8 }} />
                  <Text style={[auth.submitText, !isValid && { color: C.textMuted }]}>Entrar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={auth.bottomRow}>
            <Text style={auth.bottomText}>Não tem conta? </Text>
            <TouchableOpacity onPress={onRegister} activeOpacity={0.7}>
              <Text style={auth.bottomLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
          <Text style={auth.version}>Cordel · v1.0.0</Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

