import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, OccurrenceRecord } from '../types';
import { makeInitials } from '../constants';

const BG            = '#F7F8FA';
const CARD          = '#FFFFFF';
const BORDER        = '#E8ECF2';
const PRIMARY       = '#2563EB';
const PRIMARY_LIGHT = '#EEF3FF';
const TEXT          = '#111827';
const TEXT_SUB      = '#6B7280';
const TEXT_MUTED    = '#A0AAB4';
const SUCCESS       = '#059669';
const SUCCESS_LIGHT = '#ECFDF5';
const ERROR         = '#E11D48';

interface ProfileScreenProps {
  profile:     UserProfile;
  occurrences: OccurrenceRecord[];
  onSave:      (updated: UserProfile) => void;
  onLogout:    () => void;
}

type Section = 'info' | 'password';

export function ProfileScreen({ profile, occurrences, onSave, onLogout }: ProfileScreenProps) {
  const [section,     setSection]     = useState<Section>('info');
  const [firstName,   setFirstName]   = useState(profile.firstName);
  const [lastName,    setLastName]    = useState(profile.lastName);
  const [bio,         setBio]         = useState(profile.bio     ?? '');
  const [address,     setAddress]     = useState(profile.address ?? '');
  const [phone,       setPhone]       = useState(profile.phone   ?? '');
  const [infoTouched, setInfoTouched] = useState(false);
  const [infoSaved,   setInfoSaved]   = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass,     setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passTouched, setPassTouched] = useState(false);
  const [passSaved,   setPassSaved]   = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const firstNameOk = firstName.trim().length >= 2;
  const lastNameOk  = lastName.trim().length >= 2;
  const infoValid   = firstNameOk && lastNameOk;
  const currentOk   = currentPass.length >= 6;
  const newPassOk   = newPass.length >= 6;
  const confirmOk   = confirmPass === newPass && confirmPass.length > 0;
  const passValid   = currentOk && newPassOk && confirmOk;

  const total    = occurrences.length;
  const pending  = occurrences.filter(o => o.status === 'Pendente').length;
  const resolved = occurrences.filter(o => o.status === 'Resolvido').length;
  const isAdmin  = profile.role === 'admin';

  const handleSaveInfo = () => {
    setInfoTouched(true);
    if (!infoValid) return;
    onSave({
      ...profile,
      firstName: firstName.trim(), lastName: lastName.trim(),
      bio: bio.trim(), address: address.trim(), phone: phone.trim(),
      initials: makeInitials(firstName.trim(), lastName.trim()),
    });
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2500);
  };

  const handleSavePassword = () => {
    setPassTouched(true);
    if (!passValid) return;
    setPassSaved(true);
    setCurrentPass(''); setNewPass(''); setConfirmPass('');
    setPassTouched(false);
    setTimeout(() => setPassSaved(false), 2500);
  };

  return (
    <View style={p.root}>

      {/* Header */}
      <View style={p.header}>
        <Text style={p.headerTitle}>Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

        {/* Avatar */}
        <View style={p.heroWrap}>
          <View style={p.topBand} />
          <View style={[p.avatarCircle, isAdmin && { backgroundColor: '#7C3AED' }]}>
            <Text style={p.avatarText}>
              {makeInitials(firstName || profile.firstName, lastName || profile.lastName)}
            </Text>
          </View>
          <Text style={p.heroName}>{(firstName || profile.firstName).trim()} {(lastName || profile.lastName).trim()}</Text>
          <Text style={p.heroEmail}>{profile.email}</Text>
          <View style={[p.roleBadge, isAdmin && { backgroundColor: '#F3F0FF' }]}>
            <Ionicons name={isAdmin ? 'shield-checkmark-outline' : 'person-outline'} size={12} color={isAdmin ? '#7C3AED' : PRIMARY} />
            <Text style={[p.roleBadgeText, isAdmin && { color: '#7C3AED' }]}>
              {isAdmin ? 'Administrador' : 'Visitante'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={p.statsRow}>
          {[
            { label: 'Total',      value: total,    color: TEXT      },
            { label: 'Pendentes',  value: pending,  color: '#F59E0B' },
            { label: 'Resolvidas', value: resolved, color: SUCCESS   },
          ].map(st => (
            <View key={st.label} style={p.statCard}>
              <Text style={[p.statNum, { color: st.color }]}>{st.value}</Text>
              <Text style={p.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Abas */}
        <View style={p.tabRow}>
          {([
            { id: 'info'     as Section, label: 'Informações', icon: 'person-outline'      },
            { id: 'password' as Section, label: 'Mudar Senha', icon: 'lock-closed-outline' },
          ]).map(tab => (
            <TouchableOpacity key={tab.id} style={[p.tabBtn, section === tab.id && p.tabBtnActive]} onPress={() => setSection(tab.id)} activeOpacity={0.8}>
              <Ionicons name={tab.icon as any} size={15} color={section === tab.id ? PRIMARY : TEXT_MUTED} />
              <Text style={[p.tabBtnText, section === tab.id && p.tabBtnTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Seção: Informações */}
        {section === 'info' && (
          <View style={p.card}>
            <View style={p.row2}>
              <View style={{ flex: 1 }}>
                <PField label="Nome" required icon="person-outline" placeholder="Seu nome"
                  value={firstName} onChangeText={setFirstName}
                  error={infoTouched && !firstNameOk ? 'Mínimo 2 caracteres' : undefined} />
              </View>
              <View style={{ flex: 1 }}>
                <PField label="Sobrenome" required icon="person-outline" placeholder="Seu sobrenome"
                  value={lastName} onChangeText={setLastName}
                  error={infoTouched && !lastNameOk ? 'Mínimo 2 caracteres' : undefined} />
              </View>
            </View>

            <View style={p.fieldWrap}>
              <Text style={p.fieldLabel}>E-mail</Text>
              <View style={[p.inputWrap, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="mail-outline" size={17} color={TEXT_MUTED} style={p.inputIcon} />
                <Text style={[p.input, { color: TEXT_MUTED, paddingVertical: 2 }]} numberOfLines={1}>{profile.email}</Text>
                <View style={p.lockedBadge}><Ionicons name="lock-closed" size={11} color={TEXT_MUTED} /></View>
              </View>
              <Text style={p.fieldHelper}>O e-mail não pode ser alterado.</Text>
            </View>

            <PField label="Telefone" icon="call-outline" placeholder="(00) 00000-0000"
              value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoCapitalize="none" />

            <View style={p.fieldWrap}>
              <Text style={p.fieldLabel}>Bio</Text>
              <View style={[p.inputWrap, { alignItems: 'flex-start', paddingVertical: 12 }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={17} color={TEXT_MUTED} style={[p.inputIcon, { marginTop: 2 }]} />
                <TextInput style={[p.input, { minHeight: 72, lineHeight: 20 }]}
                  placeholder="Fale um pouco sobre você..." placeholderTextColor={TEXT_MUTED}
                  value={bio} onChangeText={setBio} multiline maxLength={200} textAlignVertical="top" />
              </View>
              <Text style={p.charCount}>{bio.length}/200</Text>
            </View>

            <PField label="Endereço" icon="location-outline" placeholder="Rua, número, bairro, cidade"
              value={address} onChangeText={setAddress} />

            {infoSaved && (
              <View style={p.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color={SUCCESS} />
                <Text style={p.successText}>Perfil atualizado com sucesso!</Text>
              </View>
            )}

            <TouchableOpacity style={[p.saveBtn, infoTouched && !infoValid && p.saveBtnDisabled]} onPress={handleSaveInfo} activeOpacity={0.85}>
              <Ionicons name="save-outline" size={17} color="#fff" style={{ marginRight: 8 }} />
              <Text style={p.saveBtnText}>Salvar Informações</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seção: Mudar senha */}
        {section === 'password' && (
          <View style={p.card}>
            <View style={p.infoBanner}>
              <Ionicons name="information-circle-outline" size={16} color={PRIMARY} />
              <Text style={p.infoText}>A nova senha deve ter pelo menos 6 caracteres.</Text>
            </View>

            <PassField label="Senha atual" placeholder="Digite sua senha atual"
              value={currentPass} show={showCurrent} onToggle={() => setShowCurrent(v => !v)}
              onChangeText={v => { setCurrentPass(v); setPassTouched(false); }}
              error={passTouched && !currentOk ? 'Informe sua senha atual' : undefined} />

            <View style={p.divider} />

            <PassField label="Nova senha" placeholder="Mínimo 6 caracteres"
              value={newPass} show={showNew} onToggle={() => setShowNew(v => !v)}
              onChangeText={v => { setNewPass(v); setPassTouched(false); }}
              error={passTouched && !newPassOk ? 'Mínimo 6 caracteres' : undefined} />

            {newPass.length > 0 && <StrengthMeter password={newPass} />}

            <PassField label="Confirmar nova senha" placeholder="Repita a nova senha"
              value={confirmPass} show={showConfirm} onToggle={() => setShowConfirm(v => !v)}
              onChangeText={v => { setConfirmPass(v); setPassTouched(false); }}
              error={passTouched && !confirmOk ? 'As senhas não coincidem' : undefined} />

            {passSaved && (
              <View style={p.successBanner}>
                <Ionicons name="checkmark-circle" size={16} color={SUCCESS} />
                <Text style={p.successText}>Senha alterada com sucesso!</Text>
              </View>
            )}

            <TouchableOpacity style={[p.saveBtn, passTouched && !passValid && p.saveBtnDisabled]} onPress={handleSavePassword} activeOpacity={0.85}>
              <Ionicons name="lock-closed-outline" size={17} color="#fff" style={{ marginRight: 8 }} />
              <Text style={p.saveBtnText}>Alterar Senha</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Zona de perigo */}
        <View style={p.dangerCard}>
          <Text style={p.dangerTitle}>Zona de perigo</Text>
          <TouchableOpacity style={p.logoutFullBtn} onPress={() => setLogoutModal(true)} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={17} color={ERROR} style={{ marginRight: 8 }} />
            <Text style={p.logoutFullText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        <Text style={p.version}>App O.E.C. v1.0.0 · Projeto T197 — UNIFOR</Text>
      </ScrollView>

      {/* Modal de confirmação de logout */}
      <Modal visible={logoutModal} transparent animationType="fade" onRequestClose={() => setLogoutModal(false)}>
        <View style={p.modalOverlay}>
          <View style={p.modalBox}>
            <View style={p.modalIcon}>
              <Ionicons name="log-out-outline" size={28} color={ERROR} />
            </View>
            <Text style={p.modalTitle}>Sair da conta?</Text>
            <Text style={p.modalSub}>
              Tem certeza que deseja sair?{'\n'}
              Você precisará fazer login novamente.
            </Text>
            <View style={p.modalActions}>
              <TouchableOpacity style={p.modalCancel} onPress={() => setLogoutModal(false)} activeOpacity={0.8}>
                <Text style={p.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={p.modalConfirm} onPress={() => { setLogoutModal(false); onLogout(); }} activeOpacity={0.8}>
                <Text style={p.modalConfirmText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function PField({ label, required, icon, placeholder, value, onChangeText, error, keyboardType, autoCapitalize }: any) {
  return (
    <View style={p.fieldWrap}>
      <Text style={p.fieldLabel}>{label}{required && <Text style={{ color: ERROR }}> *</Text>}</Text>
      <View style={[p.inputWrap, !!error && p.inputErr]}>
        <Ionicons name={icon} size={17} color={TEXT_MUTED} style={p.inputIcon} />
        <TextInput style={p.input} placeholder={placeholder} placeholderTextColor={TEXT_MUTED}
          value={value} onChangeText={onChangeText} keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'words'} autoCorrect={false} />
      </View>
      {!!error && (
        <View style={p.errorRow}>
          <Ionicons name="alert-circle" size={12} color={ERROR} />
          <Text style={p.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

function PassField({ label, placeholder, value, show, onToggle, onChangeText, error }: any) {
  return (
    <View style={p.fieldWrap}>
      <Text style={p.fieldLabel}>{label} <Text style={{ color: ERROR }}>*</Text></Text>
      <View style={[p.inputWrap, !!error && p.inputErr]}>
        <Ionicons name="lock-closed-outline" size={17} color={TEXT_MUTED} style={p.inputIcon} />
        <TextInput style={p.input} placeholder={placeholder} placeholderTextColor={TEXT_MUTED}
          secureTextEntry={!show} value={value} onChangeText={onChangeText}
          autoCapitalize="none" autoCorrect={false} />
        <TouchableOpacity onPress={onToggle} style={{ padding: 4 }}>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={17} color={TEXT_MUTED} />
        </TouchableOpacity>
      </View>
      {!!error && (
        <View style={p.errorRow}>
          <Ionicons name="alert-circle" size={12} color={ERROR} />
          <Text style={p.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 6 caracteres', ok: password.length >= 6 },
    { label: 'Letra maiúscula',      ok: /[A-Z]/.test(password) },
    { label: 'Número',               ok: /\d/.test(password) },
    { label: 'Caractere especial',   ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score  = checks.filter(c => c.ok).length;
  const colors = [ERROR, ERROR, '#F59E0B', '#F59E0B', SUCCESS];
  const labels = ['', 'Fraca', 'Fraca', 'Média', 'Forte'];
  return (
    <View style={p.strengthWrap}>
      <View style={{ flexDirection: 'row', gap: 5, marginBottom: 6 }}>
        {[0,1,2,3].map(i => (
          <View key={i} style={[p.strengthBar, { backgroundColor: i < score ? colors[score] : BORDER }]} />
        ))}
        <Text style={[p.strengthLabel, { color: colors[score] }]}>{labels[score]}</Text>
      </View>
      <View style={{ gap: 5 }}>
        {checks.map(c => (
          <View key={c.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={c.ok ? 'checkmark-circle' : 'ellipse-outline'} size={13} color={c.ok ? SUCCESS : TEXT_MUTED} />
            <Text style={{ fontSize: 12, color: c.ok ? SUCCESS : TEXT_MUTED }}>{c.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const p = StyleSheet.create({
  root:            { flex: 1, backgroundColor: BG },
  header:          { paddingTop: Platform.OS === 'android' ? 42 : 56, paddingBottom: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
  headerTitle:     { fontSize: 20, fontWeight: '800', color: TEXT },
  logoutBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF1F2', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText:      { fontSize: 12, fontWeight: '700', color: ERROR },
  heroWrap:        { alignItems: 'center', paddingTop: 32, paddingBottom: 20, position: 'relative' },
  topBand:         { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: PRIMARY, opacity: 0.06 },
  avatarCircle:    { width: 84, height: 84, borderRadius: 42, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 4, borderColor: CARD, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  avatarText:      { fontSize: 28, fontWeight: '800', color: '#fff' },
  heroName:        { fontSize: 20, fontWeight: '800', color: TEXT },
  heroEmail:       { fontSize: 13, color: TEXT_MUTED, marginTop: 3 },
  roleBadge:       { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, backgroundColor: PRIMARY_LIGHT, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  roleBadgeText:   { fontSize: 12, fontWeight: '700', color: PRIMARY },
  statsRow:        { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  statCard:        { flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  statNum:         { fontSize: 22, fontWeight: '800' },
  statLabel:       { fontSize: 11, color: TEXT_MUTED, fontWeight: '500', marginTop: 2 },
  tabRow:          { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 14 },
  tabBtn:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER, backgroundColor: CARD },
  tabBtnActive:    { borderColor: PRIMARY, backgroundColor: PRIMARY_LIGHT },
  tabBtnText:      { fontSize: 13, fontWeight: '600', color: TEXT_SUB },
  tabBtnTextActive:{ color: PRIMARY, fontWeight: '700' },
  card:            { marginHorizontal: 16, backgroundColor: CARD, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: BORDER, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, marginBottom: 16 },
  row2:            { flexDirection: 'row', gap: 12 },
  fieldWrap:       { marginBottom: 16 },
  fieldLabel:      { fontSize: 11, fontWeight: '700', color: TEXT_MUTED, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 },
  fieldHelper:     { fontSize: 11, color: TEXT_MUTED, marginTop: 4 },
  inputWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 13 : 9 },
  inputErr:        { borderColor: ERROR },
  inputIcon:       { marginRight: 8 },
  input:           { flex: 1, fontSize: 14, color: TEXT, padding: 0 },
  lockedBadge:     { backgroundColor: '#F3F4F6', borderRadius: 6, padding: 4 },
  charCount:       { fontSize: 11, color: TEXT_MUTED, textAlign: 'right', marginTop: 4 },
  errorRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errorText:       { fontSize: 12, color: ERROR, fontWeight: '500' },
  divider:         { height: 1, backgroundColor: BORDER, marginVertical: 16 },
  strengthWrap:    { marginBottom: 16, backgroundColor: BG, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: BORDER },
  strengthBar:     { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel:   { fontSize: 12, fontWeight: '700', marginLeft: 8 },
  infoBanner:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: PRIMARY_LIGHT, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 20 },
  infoText:        { fontSize: 12, color: PRIMARY, flex: 1, lineHeight: 17 },
  successBanner:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: SUCCESS_LIGHT, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, borderWidth: 1, borderColor: SUCCESS + '40' },
  successText:     { fontSize: 13, fontWeight: '600', color: SUCCESS },
  saveBtn:         { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: PRIMARY, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 6 },
  saveBtnDisabled: { backgroundColor: '#F3F4F6', shadowOpacity: 0, elevation: 0, borderWidth: 1, borderColor: BORDER },
  saveBtnText:     { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  dangerCard:      { marginHorizontal: 16, backgroundColor: CARD, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#FECDD3', marginBottom: 16 },
  dangerTitle:     { fontSize: 11, fontWeight: '700', color: ERROR, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  logoutFullBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: '#FECDD3', backgroundColor: '#FFF1F2' },
  logoutFullText:  { fontSize: 14, fontWeight: '700', color: ERROR },
  version:         { textAlign: 'center', fontSize: 11, color: TEXT_MUTED, marginBottom: 8 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalBox:        { backgroundColor: CARD, borderRadius: 20, padding: 24, width: '100%', alignItems: 'center' },
  modalIcon:       { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF1F2', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  modalTitle:      { fontSize: 18, fontWeight: '800', color: TEXT, marginBottom: 8, textAlign: 'center' },
  modalSub:        { fontSize: 13, color: TEXT_SUB, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  modalActions:    { flexDirection: 'row', gap: 10, width: '100%' },
  modalCancel:     { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER, alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: TEXT_SUB },
  modalConfirm:    { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: ERROR, alignItems: 'center', justifyContent: 'center' },
  modalConfirmText:{ fontSize: 14, fontWeight: '700', color: '#fff' },
});
