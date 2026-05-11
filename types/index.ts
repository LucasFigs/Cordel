export type Place = {
  id: string;
  name: string;
  address: string;
  visits: string;
  icon: string;
  color: string;
};

export type EvalType = 'estrutura' | 'atendimento' | 'acessibilidade' | 'limpeza';

export type DateTime = {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
};

export type ReviewData = {
  place: Place;
  dateTime: DateTime;
  evalType: EvalType | null;
  stars: number;
  description: string;
};

export type Screen = 'form' | 'success';
