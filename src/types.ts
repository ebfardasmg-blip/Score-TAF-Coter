/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Sex = 'M' | 'F';

export type TeachingLine = 
  | 'BELICO' 
  | 'LEMB'
  | 'SAUDE' 
  | 'COMPLEMENTAR' 
  | 'TECNOLOGICO';

export type Rank = 
  | 'Soldado'
  | 'Cabo'
  | '3º Sargento'
  | '2º Sargento'
  | '1º Sargento'
  | 'Subtenente'
  | 'Aspira'
  | '2º Tenente'
  | '1º Tenente'
  | 'Capitão'
  | 'Major'
  | 'Tenente-Coronel'
  | 'Coronel'
  | 'General';

export interface Military {
  id: string;
  name: string;
  rank: Rank;
  age: number;
  sex: Sex;
  om: string;
  section?: string;
  branch: string;
  teachingLine: TeachingLine;
  createdAt: number;
}

export type Mention = 'I' | 'R' | 'B' | 'MB' | 'E' | '-'; // Insuficiente, Regular, Bom, Muito Bom, Excelente, N/A

export interface TAFResult {
  id: string;
  militaryId: string;
  date: number;
  year: number;
  tafType: string;
  callType: string;
  results: {
    run: number;      // meters
    pushUps: number;  // reps
    sitUps: number;   // reps
    pullUps: number;  // reps or seconds
    pullUpsSuspension?: number; // seconds (for women 40+)
  };
  scores: {
    run: number;
    pushUps: number;
    sitUps: number;
    pullUps: number;
    total: number;
  };
  mentions: {
    run: Mention;
    pushUps: Mention;
    sitUps: Mention;
    pullUps: Mention;
    overall: Mention;
  };
  status?: 'draft' | 'final';
  evaluators?: {
    run?: string;
    pushUps?: string;
    sitUps?: string;
    pullUps?: string;
  };
}

export interface TAFTableEntry {
  minAge: number;
  maxAge: number;
  sex: Sex;
  line: TeachingLine;
  modalities: {
    run: { E: number; MB: number; B: number; R: number };
    pushUps: { E: number; MB: number; B: number; R: number };
    sitUps: { E: number; MB: number; B: number; R: number };
    pullUps: { E: number; MB: number; B: number; R: number };
  };
}
