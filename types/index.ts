export type OccurrenceType = 'estrutura' | 'atendimento' | 'acessibilidade' | 'limpeza';
export type Severity       = 'baixa' | 'media' | 'alta';

export type Place = {
  id:      string;
  name:    string;
  address: string;
  count:   string;
  icon:    string;
  color:   string;
};

export type OccurrenceData = {
  place:       Place;
  dateTime:    string;
  type:        OccurrenceType;
  severity:    Severity;
  description: string;
};
