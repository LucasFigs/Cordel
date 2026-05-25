import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants';
import { auth as authStyles } from '../styles';
import { useToast } from '../hooks/useToast';
import { Toast } from '../components/Toast';
import { auth } from '../firebase/config';

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const [email,   setEmail]   = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const { toast, showLoading, showError, hide } = useToast();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  function touch() { setTouched(true); }

  const handleSend = async () => {
    setTouched(true);
    if (!emailOk) return;

    setLoading(true);
    showLoading('Enviando e-mail…');

    try {
      await auth.sendPasswordResetEmail(email.trim());
      hide();
      setSent(true);
    } catch (e: any) {
      const msg =
        e?.code === 'auth/user-not-found'
          ? 'Não encontramos uma conta com esse e-mail.'
          : e?.code === 'auth/too-many-requests'
          ? 'Muitas tentativas. Aguarde alguns minutos.'
          : 'Falha ao enviar. Verifique sua conexão.';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Tela de sucesso ────────────────────────────────────────────────────
  if (sent) {
    return (
      <View style={authStyles.root}>
        <View style={authStyles.topBand} />
        <View style={authStyles.successRoot}>
          <View style={authStyles.successIcon}>
            <Ionicons name="mail-open-outline" size={38} color="#fff" />
          </View>
          <Text style={authStyles.successTitle}>E-mail enviado!</Text>
          <Text style={authStyles.successSub}>
            Enviamos um link de redefinição para{'\n'}
            <Text style={{ fontWeight: '700', color: C.text }}>{email.trim()}</Text>.
            {'\n\n'}Verifique sua caixa de entrada e, se necessário, a pasta de spam.
          </Text>

          <TouchableOpacity
            style={[authStyles.submitBtn, { marginTop: 36, width: '100%' }]}
            onPress={onBack}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={authStyles.submitText}>Voltar ao Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 18 }}
            onPress={() => { setSent(false); setEmail(''); setTouched(false); }}
            activeOpacity={0.7}
          >
            <Text style={authStyles.forgotText}>Reenviar e-mail</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Formulário principal ───────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={authStyles.root}>
        <View style={authStyles.topBand} />
        <Toast toast={toast} />

        {/* Header com botão voltar */}
        <View style={authStyles.header}>
          <TouchableOpacity
            style={authStyles.backBtn}
            onPress={onBack}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={18} color={C.text} />
          </TouchableOpacity>
          <Text style={[authStyles.headerTitle, { marginLeft: 12 }]}>Recuperar senha</Text>
          <View style={authStyles.headerBadge}>
            <Text style={authStyles.headerBadgeText}>Firebase Auth</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[authStyles.scroll, { paddingTop: 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mini branding */}
          <View style={authStyles.miniLogo}>
            <View style={authStyles.miniLogoCircle}>
              <Ionicons name="book-outline" size={22} color="#fff" />
            </View>
            <Text style={authStyles.miniLogoText}>Cordel</Text>
            <Text style={authStyles.miniLogoSlug}>Registre sua história</Text>
          </View>

          <View style={authStyles.card}>
            <Text style={authStyles.cardTitle}>Esqueci minha senha</Text>
            <Text style={authStyles.cardSub}>
              Informe seu e-mail cadastrado e enviaremos um link para criar uma nova senha.
            </Text>

            {/* Banner informativo */}
            <View style={authStyles.warnBanner}>
              <Ionicons name="information-circle-outline" size={18} color="#92400E" />
              <Text style={authStyles.warnText}>
                O link de redefinição expira em 1 hora por segurança.
              </Text>
            </View>

            {/* Campo e-mail */}
            <Text style={authStyles.label}>
              E-mail <Text style={authStyles.req}>*</Text>
            </Text>
            <View style={[authStyles.inputWrap, touched && !emailOk && authStyles.inputErr]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={C.textMuted}
                style={authStyles.inputIcon}
              />
              <TextInput
                style={authStyles.input}
                placeholder="seu@email.com"
                placeholderTextColor={C.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={v => { setEmail(v); if (touched) touch(); }}
                onBlur={touch}
                editable={!loading}
              />
              {emailOk && (
                <Ionicons name="checkmark-circle" size={18} color={C.success} />
              )}
            </View>
            {touched && !emailOk && (
              <View style={authStyles.errorRow}>
                <Ionicons name="alert-circle" size={13} color={C.error} />
                <Text style={authStyles.errorText}>Informe um e-mail válido</Text>
              </View>
            )}

            {/* Botão enviar */}
            <TouchableOpacity
              style={[
                authStyles.submitBtn,
                { marginTop: 24 },
                (!emailOk || loading) && authStyles.submitBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={emailOk ? '#fff' : C.textMuted}
                />
              ) : (
                <>
                  <Ionicons
                    name="send-outline"
                    size={18}
                    color={emailOk ? '#fff' : C.textMuted}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[authStyles.submitText, !emailOk && { color: C.textMuted }]}>
                    Enviar link de redefinição
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Link voltar */}
          <View style={authStyles.bottomRow}>
            <Text style={authStyles.bottomText}>Lembrou a senha? </Text>
            <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
              <Text style={authStyles.bottomLink}>Voltar ao login</Text>
            </TouchableOpacity>
          </View>

          <Text style={authStyles.version}>Cordel · v1.0.0</Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}