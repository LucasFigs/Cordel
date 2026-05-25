import { OccurrenceType, Severity, Place, OccurrenceRecord, UserProfile } from '../types';
export { C } from '../colors';

export const PLACES: Place[] = [
  { id: '1', name: 'Arena Castelão',        address: 'Av. Alberto Craveiro, 2901', count: '1,2K', icon: 'stadium-outline',        color: '#2563EB' },
  { id: '2', name: 'Museu do Ceará',         address: 'R. São Paulo, 51 – Centro',  count: '847',  icon: 'bank-outline',           color: '#7C3AED' },
  { id: '3', name: 'Parque da Cidade',       address: 'Av. Sen. Virgílio Távora',   count: '2,1K', icon: 'tree-outline',           color: '#059669' },
  { id: '4', name: 'Teatro José de Alencar', address: 'Praça José de Alencar, s/n', count: '633',  icon: 'drama-masks',            color: '#DC2626' },
  { id: '5', name: 'Praia de Iracema',       address: 'Av. Historiador Raimundo',   count: '3,4K', icon: 'umbrella-beach-outline', color: '#0891B2' },
];

export const OCCURRENCE_TYPES: { id: OccurrenceType; label: string; icon: any; color: string }[] = [
  { id: 'estrutura',      label: 'Estrutura',      icon: 'office-building-outline',  color: '#2563EB' },
  { id: 'atendimento',    label: 'Atendimento',    icon: 'account-heart-outline',    color: '#E11D48' },
  { id: 'acessibilidade', label: 'Acessibilidade', icon: 'wheelchair-accessibility', color: '#7C3AED' },
  { id: 'limpeza',        label: 'Limpeza',        icon: 'broom',                    color: '#059669' },
  { id: 'outro',          label: 'Outro',          icon: 'dots-horizontal',          color: '#F59E0B' },
];

export const SEVERITIES: { id: Severity; label: string; color: string }[] = [
  { id: 'baixa', label: 'Baixa', color: '#059669' },
  { id: 'media', label: 'Média', color: '#F59E0B' },
  { id: 'alta',  label: 'Alta',  color: '#E11D48' },
];

export const STATUS_CONFIG: Record<OccurrenceRecord['status'], { color: string; bg: string; icon: any }> = {
  'Pendente':     { color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline'             },
  'Em análise':   { color: '#2563EB', bg: '#EEF3FF', icon: 'search-outline'           },
  'Em andamento': { color: '#7C3AED', bg: '#F3F0FF', icon: 'construct-outline'        },
  'Resolvido':    { color: '#059669', bg: '#ECFDF5', icon: 'checkmark-circle-outline' },
};

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function getNowFormatted(): string {
  const d = new Date();
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}  ·  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function makeInitials(firstName: string, lastName: string): string {
  return ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase();
}

export function truncate(text: string, max = 60): string {
  return text.length > max ? text.slice(0, max) + '…' : text;
}
