export interface Token {
  address: string;
  decimals: number;
  name: string;
  img: string;
  symbol: string;
  tags?: string[]; // Optional, assuming it's an array of strings
}
