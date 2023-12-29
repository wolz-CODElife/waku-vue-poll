interface Option {
  value: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: { [key: string]: Option };
}