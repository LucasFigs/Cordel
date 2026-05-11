// ── Ocorrências ──────────────────────────────────────────────────────────
export type OccurrenceType =
  | 'estrutura' | 'atendimento' | 'acessibilidade' | 'limpeza' | 'outro';
export type Severity         = 'baixa' | 'media' | 'alta';
export type OccurrenceStatus = 'Pendente' | 'Em análise' | 'Em andamento' | 'Resolvido';

export type Place = {
  id: string; name: string; address: string;
  count: string; icon: string; color: string;
};

export type OccurrenceData = {
  place:       Place;
  dateTime:    string;
  type:        OccurrenceType;
  severity:    Severity;
  description: string;
  rating?:     number;
  userId:      string;
};

export type OccurrenceRecord = OccurrenceData & {
  id:       string;
  protocol: number;
  status:   OccurrenceStatus;
};

// ── Usuário ──────────────────────────────────────────────────────────────
export type UserRole     = 'visitante' | 'admin';
export type AuthProvider = 'email' | 'google' | 'facebook';

export type UserProfile = {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
  role:      UserRole;
  initials:  string;
  provider:  AuthProvider;
  photoURL?: string;
  bio?:      string;
  address?:  string;
  phone?:    string;
};

// ── Toast / Feedback visual ──────────────────────────────────────────────
export type ToastType  = 'success' | 'error' | 'loading';
export type ToastState = { visible: boolean; type: ToastType; message: string };

// ── Navegação ────────────────────────────────────────────────────────────
export type AuthFlow = 'login' | 'register';
export type MainTab  = 'registrar' | 'historico' | 'perfil';
