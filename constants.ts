import { Place, OccurrenceType } from './types';

export const C = {
  bg:           '#F7F8FA',
  card:         '#FFFFFF',
  border:       '#E8ECF2',
  primary:      '#2563EB',
  primaryLight: '#EEF3FF',
  text:         '#111827',
  textSub:      '#6B7280',
  textMuted:    '#A0AAB4',
  success:      '#059669',
  successLight: '#ECFDF5',
} as const;

export const PLACES: Place[] = [
  { id: '1', name: 'Arena Castelão',        address: 'Av. Alberto Craveiro, 2901', count: '1,2K', icon: 'stadium-outline',        color: '#2563EB' },
  { id: '2', name: 'Museu do Ceará',         address: 'R. São Paulo, 51 – Centro',  count: '847',  icon: 'bank-outline',           color: '#7C3AED' },
  { id: '3', name: 'Parque da Cidade',       address: 'Av. Sen. Virgílio Távora',   count: '2,1K', icon: 'tree-outline',           color: '#059669' },
  { id: '4', name: 'Teatro José de Alencar', address: 'Praça José de Alencar, s/n', count: '633',  icon: 'drama-masks',            color: '#DC2626' },
  { id: '5', name: 'Praia de Iracema',       address: 'Av. Historiador Raimundo',   count: '3,4K', icon: 'umbrella-beach-outline', color: '#0891B2' },
  { id: '6', name: 'Acquario Ceará',         address: 'Porto das Dunas, Aquiraz',   count: '980',  icon: 'fish-outline',           color: '#0D9488' },
  { id: '7', name: 'Paço Municipal',         address: 'Rua do Paço, s/n – Centro',  count: '412',  icon: 'city-variant-outline',   color: '#B45309' },
];

export const OCCURRENCE_TYPES: {
  id:    OccurrenceType;
  label: string;
  icon:  string;
  color: string;
}[] = [
  { id: 'estrutura',      label: 'Estrutura',      icon: 'office-building-outline',  color: '#2563EB' },
  { id: 'atendimento',    label: 'Atendimento',    icon: 'account-heart-outline',    color: '#E11D48' },
  { id: 'acessibilidade', label: 'Acessibilidade', icon: 'wheelchair-accessibility', color: '#7C3AED' },
  { id: 'limpeza',        label: 'Limpeza',        icon: 'broom',                    color: '#059669' },
];

export const SEVERITIES: { id: 'baixa' | 'media' | 'alta'; label: string; color: string }[] = [
  { id: 'baixa', label: 'Baixa', color: '#059669' },
  { id: 'media', label: 'Média', color: '#F59E0B' },
  { id: 'alta',  label: 'Alta',  color: '#E11D48' },
];

function pad(n: number) { return String(n).padStart(2, '0'); }

export function getNowFormatted(): string {
  const d = new Date();
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}  ·  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
