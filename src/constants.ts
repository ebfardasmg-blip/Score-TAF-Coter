/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TAFTableEntry } from './types';

export const DEFAULT_OMS = [
  'Comando de Operações Terrestres'
];

export const COTER_SECTIONS = [
  'Comando', 
  'Subcomando', 
  'Gabinete', 
  'Ch Emp F Ter', 
  'Ch Prep F Ter', 
  'Div Mis Paz', 
  'Av/IGPM', 
  'C Dot Ex'
];

export const RANKS = [
  'Soldado', 'Cabo', '3º Sargento', '2º Sargento', '1º Sargento', 'Subtenente',
  'Aspira', '2º Tenente', '1º Tenente', 'Capitão', 'Major', 'Tenente-Coronel', 
  'Coronel', 'General'
];

export const TEACHING_LINES = [
  { id: 'BELICO', label: 'Bélico (LEMB)' },
  { id: 'SAUDE', label: 'Saúde (LEMS)' },
  { id: 'COMPLEMENTAR', label: 'Complementar (LEMC)' },
  { id: 'TECNOLOGICO', label: 'Científico-Tecnológico (LEMCT)' }
];

export const BRANCH_OPTIONS: Record<string, string[]> = {
  'BELICO': ['Infantaria', 'Cavalaria', 'Artilharia', 'Engenharia', 'Comunicações', 'Material Bélico', 'Intendência'],
  'SAUDE': ['Médico', 'Farmacêutico', 'Dentista', 'Veterinário', 'Auxiliar de Saúde'],
  'COMPLEMENTAR': ['Quadro Complementar (QCO)', 'Capelão'],
  'TECNOLOGICO': ['Quadro de Engenheiros Militares (QEM)']
};

export const MENTION_LABELS: Record<string, string> = {
  'I': 'Insuficiente',
  'R': 'Regular',
  'B': 'Bom',
  'MB': 'Muito Bom',
  'E': 'Excelente',
  '-': 'Não Aplicável'
};

export const MENTION_COLORS: Record<string, string> = {
  'I': 'bg-red-500',
  'R': 'bg-orange-500',
  'B': 'bg-blue-500',
  'MB': 'bg-green-600',
  'E': 'bg-purple-600',
  '-': 'bg-gray-400'
};

// Simplified TAF Scoring Table (Representative of official Portaria)
// In a real app, this would be a large JSON or database
export const TAF_TABLES: TAFTableEntry[] = [
  // Example for BELICO MALE under 25
  {
    minAge: 0, maxAge: 24, sex: 'M', line: 'BELICO',
    modalities: {
      run: { E: 2700, MB: 2500, B: 2300, R: 2100 },
      pushUps: { E: 30, MB: 26, B: 22, R: 18 },
      sitUps: { E: 45, MB: 40, B: 35, R: 30 },
      pullUps: { E: 8, MB: 6, B: 5, R: 3 }
    }
  },
  // Example for BELICO MALE 25-29
  {
    minAge: 25, maxAge: 29, sex: 'M', line: 'BELICO',
    modalities: {
      run: { E: 2600, MB: 2400, B: 2200, R: 2000 },
      pushUps: { E: 28, MB: 24, B: 20, R: 16 },
      sitUps: { E: 42, MB: 37, B: 32, R: 27 },
      pullUps: { E: 7, MB: 5, B: 4, R: 2 }
    }
  },
  // Default values for other lines (simplified approximation)
  {
    minAge: 0, maxAge: 99, sex: 'M', line: 'SAUDE',
    modalities: {
      run: { E: 2400, MB: 2200, B: 2000, R: 1800 },
      pushUps: { E: 20, MB: 16, B: 12, R: 8 },
      sitUps: { E: 35, MB: 30, B: 25, R: 20 },
      pullUps: { E: 5, MB: 4, B: 3, R: 1 }
    }
  },
  {
    minAge: 0, maxAge: 99, sex: 'F', line: 'BELICO',
    modalities: {
      run: { E: 2200, MB: 2000, B: 1800, R: 1600 },
      pushUps: { E: 18, MB: 14, B: 10, R: 6 },
      sitUps: { E: 35, MB: 30, B: 25, R: 20 },
      pullUps: { E: 10, MB: 8, B: 6, R: 4 } // For women it might be static hang time
    }
  }
];
