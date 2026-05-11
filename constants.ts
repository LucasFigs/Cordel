import { Place } from '../types';

export const C = {
  bg: '#F7F8FA',
  card: '#FFFFFF',
  border: '#E8ECF2',
  primary: '#2563EB',
  primaryLight: '#EEF3FF',
  text: '#111827',
  textSub: '#6B7280',
  textMuted: '#A0AAB4',
  accent: '#F59E0B',
  success: '#059669',
  successLight: '#ECFDF5',
} as const;

export const PLACES: Place[] = [
  { id: '1', name: 'Arena Castelão',        address: 'Av. Alberto Craveiro, 2901', visits: '1,2K', icon: 'stadium-outline',        color: '#2563EB' },
  { id: '2', name: 'Museu do Ceará',         address: 'R. São Paulo, 51 – Centro',  visits: '847',  icon: 'bank-outline',           color: '#7C3AED' },
  { id: '3', name: 'Parque da Cidade',       address: 'Av. Sen. Virgílio Távora',   visits: '2,1K', icon: 'tree-outline',           color: '#059669' },
  { id: '4', name: 'Teatro José de Alencar', address: 'Praça José de Alencar, s/n', visits: '633',  icon: 'drama-masks',            color: '#DC2626' },
  { id: '5', name: 'Praia de Iracema',       address: 'Av. Historiador Raimundo',   visits: '3,4K', icon: 'umbrella-beach-outline', color: '#0891B2' },
  { id: '6', name: 'Acquario Ceará',         address: 'Porto das Dunas, Aquiraz',   visits: '980',  icon: 'fish-outline',           color: '#0D9488' },
  { id: '7', name: 'Paço Municipal',         address: 'Rua do Paço, s/n – Centro',  visits: '412',  icon: 'city-variant-outline',   color: '#B45309' },
];

export const EVAL_TYPES = [
  { id: 'estrutura'      as const, label: 'Estrutura',      icon: 'office-building-outline',  color: '#2563EB' },
  { id: 'atendimento'    as const, label: 'Atendimento',    icon: 'account-heart-outline',    color: '#E11D48' },
  { id: 'acessibilidade' as const, label: 'Acessibilidade', icon: 'wheelchair-accessibility', color: '#7C3AED' },
  { id: 'limpeza'        as const, label: 'Limpeza',        icon: 'broom',                    color: '#059669' },
];

export const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export const HOURS   = Array.from({ length: 24 }, (_, i) => i);
export const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function getNow() {
  const d = new Date();
  return {
    day: d.getDate(),
    month: d.getMonth() + 1,
    year: d.getFullYear(),
    hour: d.getHours(),
    minute: Math.floor(d.getMinutes() / 5) * 5,
  };
}

export function formatDate({ day, month, year, hour, minute }: { day: number; month: number; year: number; hour: number; minute: number }): string {
  return `${pad(day)}/${pad(month)}/${year}  ·  ${pad(hour)}:${pad(minute)}`;
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}
