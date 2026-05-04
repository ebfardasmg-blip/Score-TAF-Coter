/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TAF_TABLES } from '../constants';
import { Military, Mention, TeachingLine, Sex } from '../types';

export function calculateMention(value: number, goals: { E: number; MB: number; B: number; R: number }): Mention {
  if (value >= goals.E) return 'E';
  if (value >= goals.MB) return 'MB';
  if (value >= goals.B) return 'B';
  if (value >= goals.R) return 'R';
  return 'I';
}

export function getMentionValue(m: Mention): number {
  switch (m) {
    case 'E': return 5;
    case 'MB': return 4;
    case 'B': return 3;
    case 'R': return 2;
    case 'I': return 1;
  }
}

export function getOverallMention(mentions: Mention[]): Mention {
  if (mentions.some(m => m === 'I')) return 'I';
  
  const values = mentions.map(getMentionValue);
  const minVal = Math.min(...values);

  if (minVal === 5) return 'E';
  if (minVal === 4) return 'MB';
  if (minVal === 3) return 'B';
  return 'R';
}

export function getTafTable(age: number, sex: Sex, line: TeachingLine) {
  const table = TAF_TABLES.find(t => 
    age >= t.minAge && 
    age <= t.maxAge && 
    t.sex === sex && 
    (t.line === line || t.line === 'SAUDE') // Fallback to a generic table if exact match not found
  );
  
  return table || TAF_TABLES[0]; // Emergency fallback
}

export interface TafCalculationResult {
  mentions: {
    run: Mention;
    pushUps: Mention;
    sitUps: Mention;
    pullUps: Mention;
    overall: Mention;
  };
  scores: {
    run: number;
    pushUps: number;
    sitUps: number;
    pullUps: number;
    total: number;
  };
}

export function calcularMencaoCorridaLEMS(idade: number, distancia: number): Mention {
  if (idade >= 18 && idade <= 21) {
    if (distancia >= 2800) return 'E';
    if (distancia >= 2450) return 'MB';
    if (distancia >= 2250) return 'B';
    if (distancia >= 2100) return 'R';
    return 'I';
  }
  if (idade >= 22 && idade <= 25) {
    if (distancia >= 2900) return 'E';
    if (distancia >= 2550) return 'MB';
    if (distancia >= 2350) return 'B';
    if (distancia >= 2200) return 'R';
    return 'I';
  }
  if (idade >= 26 && idade <= 29) {
    if (distancia >= 2800) return 'E';
    if (distancia >= 2450) return 'MB';
    if (distancia >= 2250) return 'B';
    if (distancia >= 2100) return 'R';
    return 'I';
  }
  if (idade >= 30 && idade <= 33) {
    if (distancia >= 2700) return 'E';
    if (distancia >= 2350) return 'MB';
    if (distancia >= 2150) return 'B';
    if (distancia >= 2050) return 'R';
    return 'I';
  }
  if (idade >= 34 && idade <= 37) {
    if (distancia >= 2600) return 'E';
    if (distancia >= 2250) return 'MB';
    if (distancia >= 2050) return 'B';
    if (distancia >= 1950) return 'R';
    return 'I';
  }
  if (idade >= 38 && idade <= 41) {
    if (distancia >= 2500) return 'E';
    if (distancia >= 2150) return 'MB';
    if (distancia >= 1950) return 'B';
    if (distancia >= 1850) return 'R';
    return 'I';
  }
  if (idade >= 42 && idade <= 45) {
    if (distancia >= 2400) return 'E';
    if (distancia >= 2050) return 'MB';
    if (distancia >= 1850) return 'B';
    if (distancia >= 1750) return 'R';
    return 'I';
  }
  if (idade >= 46 && idade <= 49) {
    if (distancia >= 2300) return 'E';
    if (distancia >= 1950) return 'MB';
    if (distancia >= 1750) return 'B';
    if (distancia >= 1650) return 'R';
    return 'I';
  }
  
  // 50+ anos (Suficiência)
  if (idade >= 50) {
    let required = 0;
    if (idade <= 53) required = 1700;
    else if (idade <= 57) required = 1600;
    else if (idade <= 61) required = 1400;
    else required = 1200;

    return distancia >= required ? 'E' : 'I';
  }

  return 'I';
}

export function calcularMencaoCorridaFemLEMS(idade: number, distancia: number): Mention {
  if (idade >= 18 && idade <= 21) {
    if (distancia >= 2300) return 'E';
    if (distancia >= 1950) return 'MB';
    if (distancia >= 1750) return 'B';
    if (distancia >= 1600) return 'R';
    return 'I';
  }
  if (idade >= 22 && idade <= 25) {
    if (distancia >= 2400) return 'E';
    if (distancia >= 2050) return 'MB';
    if (distancia >= 1850) return 'B';
    if (distancia >= 1700) return 'R';
    return 'I';
  }
  if (idade >= 26 && idade <= 29) {
    if (distancia >= 2300) return 'E';
    if (distancia >= 1950) return 'MB';
    if (distancia >= 1750) return 'B';
    if (distancia >= 1600) return 'R';
    return 'I';
  }
  if (idade >= 30 && idade <= 33) {
    if (distancia >= 2200) return 'E';
    if (distancia >= 1850) return 'MB';
    if (distancia >= 1650) return 'B';
    if (distancia >= 1550) return 'R';
    return 'I';
  }
  if (idade >= 34 && idade <= 37) {
    if (distancia >= 2100) return 'E';
    if (distancia >= 1750) return 'MB';
    if (distancia >= 1550) return 'B';
    if (distancia >= 1450) return 'R';
    return 'I';
  }
  if (idade >= 38 && idade <= 41) {
    if (distancia >= 2000) return 'E';
    if (distancia >= 1650) return 'MB';
    if (distancia >= 1450) return 'B';
    if (distancia >= 1350) return 'R';
    return 'I';
  }
  if (idade >= 42 && idade <= 45) {
    if (distancia >= 1900) return 'E';
    if (distancia >= 1550) return 'MB';
    if (distancia >= 1350) return 'B';
    if (distancia >= 1250) return 'R';
    return 'I';
  }
  if (idade >= 46 && idade <= 49) {
    if (distancia >= 1800) return 'E';
    if (distancia >= 1450) return 'MB';
    if (distancia >= 1250) return 'B';
    if (distancia >= 1150) return 'R';
    return 'I';
  }
  
  // 50+ anos (Suficiência)
  if (idade >= 50) {
    let required = 0;
    if (idade <= 53) required = 1400;
    else if (idade <= 57) required = 1300;
    else if (idade <= 61) required = 1200;
    else required = 1100;

    return distancia >= required ? 'E' : 'I';
  }

  return 'I';
}

export function calcularMencaoCorrida(idade: number, distancia: number, sex: Sex = 'M', line: TeachingLine = 'LEMB'): Mention {
  // Logic for LEMS, LEMC, LEMCT (Non-LEMB/BELICO)
  if (line !== 'BELICO' && line !== 'LEMB') {
    if (sex === 'F') {
      return calcularMencaoCorridaFemLEMS(idade, distancia);
    } else {
      return calcularMencaoCorridaLEMS(idade, distancia);
    }
  }

  if (sex === 'F') {
    // Female Run Logic (LEMB)
    if (idade >= 18 && idade <= 21) {
      if (distancia >= 2750) return 'E';
      if (distancia >= 2400) return 'MB';
      if (distancia >= 2200) return 'B';
      return 'R'; // R < 2200
    }
    if (idade >= 22 && idade <= 25) {
      if (distancia >= 2800) return 'E';
      if (distancia >= 2450) return 'MB';
      if (distancia >= 2300) return 'B';
      return 'R'; // R < 2300
    }
    if (idade >= 26 && idade <= 29) {
      if (distancia >= 2650) return 'E';
      if (distancia >= 2350) return 'MB';
      if (distancia >= 2200) return 'B';
      return 'R'; // R < 2200
    }
    if (idade >= 30 && idade <= 33) {
      if (distancia >= 2550) return 'E';
      if (distancia >= 2250) return 'MB';
      if (distancia >= 2150) return 'B';
      return 'R'; // R < 2150
    }
    if (idade >= 34 && idade <= 37) {
      if (distancia >= 2450) return 'E';
      if (distancia >= 2150) return 'MB';
      if (distancia >= 2050) return 'B';
      return 'R'; // R < 2050
    }
    if (idade >= 38 && idade <= 41) {
      if (distancia >= 2350) return 'E';
      if (distancia >= 2050) return 'MB';
      if (distancia >= 1950) return 'B';
      return 'R'; // R < 1950
    }
    if (idade >= 42 && idade <= 45) {
      if (distancia >= 2350) return 'E';
      if (distancia >= 2000) return 'MB';
      if (distancia >= 1850) return 'B';
      return 'R'; // R < 1850
    }
    if (idade >= 46 && idade <= 49) {
      if (distancia >= 2200) return 'E';
      if (distancia >= 1900) return 'MB';
      if (distancia >= 1750) return 'B';
      return 'R'; // R < 1750
    }
    
    // 50+ anos (Suficiência)
    if (idade >= 50) {
      let required = 0;
      if (idade <= 53) required = 1600;
      else if (idade <= 57) required = 1500;
      else if (idade <= 61) required = 1400;
      else required = 1300;

      return distancia >= required ? 'E' : 'I';
    }

    return 'I';
  }

  // Logic moved to the top of calcularMencaoCorrida
  // Male Run Logic (LEMB / BELICO)
  if (idade >= 18 && idade <= 21) {
    if (distancia >= 3200) return 'E';
    if (distancia >= 2800) return 'MB';
    if (distancia >= 2600) return 'B';
    return 'R'; // R < 2600
  }
  if (idade >= 22 && idade <= 25) {
    if (distancia >= 3250) return 'E';
    if (distancia >= 2850) return 'MB';
    if (distancia >= 2700) return 'B';
    return 'R'; // R < 2700
  }
  if (idade >= 26 && idade <= 29) {
    if (distancia >= 3150) return 'E';
    if (distancia >= 2750) return 'MB';
    if (distancia >= 2600) return 'B';
    return 'R'; // R < 2600
  }
  if (idade >= 30 && idade <= 33) {
    if (distancia >= 3100) return 'E';
    if (distancia >= 2650) return 'MB';
    if (distancia >= 2550) return 'B';
    return 'R'; // R < 2550
  }
  if (idade >= 34 && idade <= 37) {
    if (distancia >= 2950) return 'E';
    if (distancia >= 2550) return 'MB';
    if (distancia >= 2450) return 'B';
    return 'R'; // R < 2450
  }
  if (idade >= 38 && idade <= 41) {
    if (distancia >= 2850) return 'E';
    if (distancia >= 2450) return 'MB';
    if (distancia >= 2350) return 'B';
    return 'R'; // R < 2350
  }
  if (idade >= 42 && idade <= 45) {
    if (distancia >= 2750) return 'E';
    if (distancia >= 2400) return 'MB';
    if (distancia >= 2250) return 'B';
    return 'R'; // R < 2250
  }
  if (idade >= 46 && idade <= 49) {
    if (distancia >= 2650) return 'E';
    if (distancia >= 2300) return 'MB';
    if (distancia >= 2150) return 'B';
    return 'R'; // R < 2150
  }
  
  // 50+ anos (Suficiência)
  if (idade >= 50) {
    let required = 0;
    if (idade <= 53) required = 1900;
    else if (idade <= 57) required = 1800;
    else if (idade <= 61) required = 1600;
    else required = 1400;

    return distancia >= required ? 'E' : 'I';
  }

  return 'I';
}

export function calcularMencaoFlexaoLEMS(idade: number, repeticoes: number): Mention {
  if (idade >= 18 && idade <= 21) {
    if (repeticoes >= 33) return 'E';
    if (repeticoes >= 30) return 'MB';
    if (repeticoes >= 25) return 'B';
    if (repeticoes >= 22) return 'R';
    return 'I';
  }
  if (idade >= 22 && idade <= 25) {
    if (repeticoes >= 35) return 'E';
    if (repeticoes >= 32) return 'MB';
    if (repeticoes >= 27) return 'B';
    if (repeticoes >= 24) return 'R';
    return 'I';
  }
  if (idade >= 26 && idade <= 29) {
    if (repeticoes >= 33) return 'E';
    if (repeticoes >= 30) return 'MB';
    if (repeticoes >= 25) return 'B';
    if (repeticoes >= 22) return 'R';
    return 'I';
  }
  if (idade >= 30 && idade <= 33) {
    if (repeticoes >= 31) return 'E';
    if (repeticoes >= 28) return 'MB';
    if (repeticoes >= 24) return 'B';
    if (repeticoes >= 21) return 'R';
    return 'I';
  }
  if (idade >= 34 && idade <= 37) {
    if (repeticoes >= 29) return 'E';
    if (repeticoes >= 26) return 'MB';
    if (repeticoes >= 21) return 'B';
    if (repeticoes >= 18) return 'R';
    return 'I';
  }
  if (idade >= 38 && idade <= 41) {
    if (repeticoes >= 27) return 'E';
    if (repeticoes >= 24) return 'MB';
    if (repeticoes >= 20) return 'B';
    if (repeticoes >= 17) return 'R';
    return 'I';
  }
  if (idade >= 42 && idade <= 45) {
    if (repeticoes >= 25) return 'E';
    if (repeticoes >= 22) return 'MB';
    if (repeticoes >= 18) return 'B';
    if (repeticoes >= 15) return 'R';
    return 'I';
  }
  if (idade >= 46 && idade <= 49) {
    if (repeticoes >= 22) return 'E';
    if (repeticoes >= 19) return 'MB';
    if (repeticoes >= 15) return 'B';
    if (repeticoes >= 12) return 'R';
    return 'I';
  }
  
  // 50+ anos (Suficiência)
  if (idade >= 50) {
    let required = 0;
    if (idade <= 53) required = 11;
    else if (idade <= 57) required = 9;
    else if (idade <= 61) required = 8;
    else required = 6;

    return repeticoes >= required ? 'E' : 'I';
  }

  return 'I';
}

export function calcularMencaoFlexaoFemLEMS(idade: number, repeticoes: number): Mention {
  if (idade >= 18 && idade <= 21) {
    if (repeticoes >= 14) return 'E';
    if (repeticoes >= 13) return 'MB';
    if (repeticoes >= 11) return 'B';
    if (repeticoes >= 10) return 'R';
    return 'I';
  }
  if (idade >= 22 && idade <= 25) {
    if (repeticoes >= 15) return 'E';
    if (repeticoes >= 14) return 'MB';
    if (repeticoes >= 12) return 'B';
    if (repeticoes >= 11) return 'R';
    return 'I';
  }
  if (idade >= 26 && idade <= 29) {
    if (repeticoes >= 14) return 'E';
    if (repeticoes >= 13) return 'MB';
    if (repeticoes >= 11) return 'B';
    if (repeticoes >= 10) return 'R';
    return 'I';
  }
  if (idade >= 30 && idade <= 33) {
    if (repeticoes >= 13) return 'E';
    if (repeticoes >= 12) return 'MB';
    if (repeticoes >= 10) return 'B';
    if (repeticoes >= 9) return 'R';
    return 'I';
  }
  if (idade >= 34 && idade <= 37) {
    if (repeticoes >= 12) return 'E';
    if (repeticoes >= 11) return 'MB';
    if (repeticoes >= 9) return 'B';
    if (repeticoes >= 8) return 'R';
    return 'I';
  }
  if (idade >= 38 && idade <= 41) {
    if (repeticoes >= 11) return 'E';
    if (repeticoes >= 10) return 'MB';
    if (repeticoes >= 8) return 'B';
    if (repeticoes >= 7) return 'R';
    return 'I';
  }
  if (idade >= 42 && idade <= 45) {
    if (repeticoes >= 10) return 'E';
    if (repeticoes >= 9) return 'MB';
    if (repeticoes >= 7) return 'B';
    if (repeticoes >= 6) return 'R';
    return 'I';
  }
  if (idade >= 46 && idade <= 49) {
    if (repeticoes >= 9) return 'E';
    if (repeticoes >= 8) return 'MB';
    if (repeticoes >= 6) return 'B';
    if (repeticoes >= 5) return 'R';
    return 'I';
  }
  
  // 50+ anos (Suficiência)
  if (idade >= 50) {
    let required = 0;
    if (idade <= 53) required = 4;
    else if (idade <= 57) required = 3;
    else if (idade <= 61) required = 2;
    else required = 1;

    return repeticoes >= required ? 'E' : 'I';
  }

  return 'I';
}

export function calcularMencaoFlexao(idade: number, repeticoes: number, sex: Sex = 'M', line: TeachingLine = 'LEMB'): Mention {
  // Logic for LEMS, LEMC, LEMCT (Non-LEMB/BELICO)
  if (line !== 'BELICO' && line !== 'LEMB') {
    if (sex === 'F') {
      return calcularMencaoFlexaoFemLEMS(idade, repeticoes);
    } else {
      return calcularMencaoFlexaoLEMS(idade, repeticoes);
    }
  }

  if (sex === 'F') {
    // Female Push Ups Logic (LEMB)
    if (idade >= 18 && idade <= 21) {
      if (repeticoes >= 16) return 'E';
      if (repeticoes >= 15) return 'MB';
      if (repeticoes >= 12) return 'B';
      if (repeticoes >= 11) return 'R';
      return 'I';
    }
    if (idade >= 22 && idade <= 25) {
      if (repeticoes >= 17) return 'E';
      if (repeticoes >= 16) return 'MB';
      if (repeticoes >= 13) return 'B';
      if (repeticoes >= 12) return 'R';
      return 'I';
    }
    if (idade >= 26 && idade <= 29) {
      if (repeticoes >= 16) return 'E';
      if (repeticoes >= 15) return 'MB';
      if (repeticoes >= 12) return 'B';
      if (repeticoes >= 11) return 'R';
      return 'I';
    }
    if (idade >= 30 && idade <= 33) {
      if (repeticoes >= 15) return 'E';
      if (repeticoes >= 14) return 'MB';
      if (repeticoes >= 11) return 'B';
      if (repeticoes >= 10) return 'R';
      return 'I';
    }
    if (idade >= 34 && idade <= 37) {
      if (repeticoes >= 14) return 'E';
      if (repeticoes >= 13) return 'MB';
      if (repeticoes >= 10) return 'B';
      if (repeticoes >= 9) return 'R';
      return 'I';
    }
    if (idade >= 38 && idade <= 41) {
      if (repeticoes >= 13) return 'E';
      if (repeticoes >= 12) return 'MB';
      if (repeticoes >= 9) return 'B';
      if (repeticoes >= 8) return 'R';
      return 'I';
    }
    if (idade >= 42 && idade <= 45) {
      if (repeticoes >= 12) return 'E';
      if (repeticoes >= 11) return 'MB';
      if (repeticoes >= 8) return 'B';
      if (repeticoes >= 7) return 'R';
      return 'I';
    }
    if (idade >= 46 && idade <= 49) {
      if (repeticoes >= 11) return 'E';
      if (repeticoes >= 10) return 'MB';
      if (repeticoes >= 7) return 'B';
      if (repeticoes >= 6) return 'R';
      return 'I';
    }
    
    // 50+ anos (Suficiência)
    if (idade >= 50) {
      let required = 0;
      if (idade <= 53) required = 5;
      else if (idade <= 57) required = 4;
      else if (idade <= 61) required = 3;
      else required = 2;

      return repeticoes >= required ? 'E' : 'I';
    }

    return 'I';
  }
  
  // Logic moved to the top of calcularMencaoFlexao
  // Male Push Ups Logic (LEMB / BELICO)
  if (idade >= 18 && idade <= 21) {
    if (repeticoes >= 39) return 'E';
    if (repeticoes >= 34) return 'MB';
    if (repeticoes >= 25) return 'B';
    if (repeticoes >= 22) return 'R';
    return 'I';
  }
  if (idade >= 22 && idade <= 25) {
    if (repeticoes >= 41) return 'E';
    if (repeticoes >= 36) return 'MB';
    if (repeticoes >= 27) return 'B';
    if (repeticoes >= 24) return 'R';
    return 'I';
  }
  if (idade >= 26 && idade <= 29) {
    if (repeticoes >= 39) return 'E';
    if (repeticoes >= 34) return 'MB';
    if (repeticoes >= 25) return 'B';
    if (repeticoes >= 22) return 'R';
    return 'I';
  }
  if (idade >= 30 && idade <= 33) {
    if (repeticoes >= 37) return 'E';
    if (repeticoes >= 32) return 'MB';
    if (repeticoes >= 24) return 'B';
    if (repeticoes >= 21) return 'R';
    return 'I';
  }
  if (idade >= 34 && idade <= 37) {
    if (repeticoes >= 34) return 'E';
    if (repeticoes >= 29) return 'MB';
    if (repeticoes >= 21) return 'B';
    if (repeticoes >= 18) return 'R';
    return 'I';
  }
  if (idade >= 38 && idade <= 41) {
    if (repeticoes >= 32) return 'E';
    if (repeticoes >= 28) return 'MB';
    if (repeticoes >= 20) return 'B';
    if (repeticoes >= 17) return 'R';
    return 'I';
  }
  if (idade >= 42 && idade <= 45) {
    if (repeticoes >= 29) return 'E';
    if (repeticoes >= 25) return 'MB';
    if (repeticoes >= 18) return 'B';
    if (repeticoes >= 15) return 'R';
    return 'I';
  }
  if (idade >= 46 && idade <= 49) {
    if (repeticoes >= 26) return 'E';
    if (repeticoes >= 22) return 'MB';
    if (repeticoes >= 15) return 'B';
    if (repeticoes >= 12) return 'R';
    return 'I';
  }
  
  // 50+ anos (Suficiência)
  if (idade >= 50) {
    let required = 0;
    if (idade <= 53) required = 11;
    else if (idade <= 57) required = 9;
    else if (idade <= 61) required = 8;
    else required = 6;

    return repeticoes >= required ? 'B' : 'I';
  }

  return 'I';
}

export function calcularMencaoAbdominalLEMS(idade: number, repeticoes: number): Mention {
  if (idade >= 18 && idade <= 21) {
    if (repeticoes >= 62) return 'E';
    if (repeticoes >= 54) return 'MB';
    if (repeticoes >= 39) return 'B';
    if (repeticoes >= 30) return 'R';
    return 'I';
  }
  if (idade >= 22 && idade <= 25) {
    if (repeticoes >= 67) return 'E';
    if (repeticoes >= 59) return 'MB';
    if (repeticoes >= 44) return 'B';
    if (repeticoes >= 35) return 'R';
    return 'I';
  }
  if (idade >= 26 && idade <= 29) {
    if (repeticoes >= 64) return 'E';
    if (repeticoes >= 56) return 'MB';
    if (repeticoes >= 41) return 'B';
    if (repeticoes >= 32) return 'R';
    return 'I';
  }
  if (idade >= 30 && idade <= 33) {
    if (repeticoes >= 59) return 'E';
    if (repeticoes >= 52) return 'MB';
    if (repeticoes >= 37) return 'B';
    if (repeticoes >= 30) return 'R';
    return 'I';
  }
  if (idade >= 34 && idade <= 37) {
    if (repeticoes >= 56) return 'E';
    if (repeticoes >= 49) return 'MB';
    if (repeticoes >= 34) return 'B';
    if (repeticoes >= 27) return 'R';
    return 'I';
  }
  if (idade >= 38 && idade <= 41) {
    if (repeticoes >= 54) return 'E';
    if (repeticoes >= 47) return 'MB';
    if (repeticoes >= 32) return 'B';
    if (repeticoes >= 25) return 'R';
    return 'I';
  }
  if (idade >= 42 && idade <= 45) {
    if (repeticoes >= 54) return 'E';
    if (repeticoes >= 46) return 'MB';
    if (repeticoes >= 31) return 'B';
    if (repeticoes >= 23) return 'R';
    return 'I';
  }
  if (idade >= 46 && idade <= 49) {
    if (repeticoes >= 52) return 'E';
    if (repeticoes >= 44) return 'MB';
    if (repeticoes >= 29) return 'B';
    if (repeticoes >= 21) return 'R';
    return 'I';
  }

  // 50+ anos (Suficiência)
  if (idade >= 50) {
    let required = 0;
    if (idade <= 53) required = 20;
    else if (idade <= 57) required = 18;
    else if (idade <= 61) required = 16;
    else required = 14;

    return repeticoes >= required ? 'E' : 'I';
  }

  return 'I';
}

export function calcularMencaoAbdominalFemLEMS(idade: number, repeticoes: number): Mention {
  if (idade >= 18 && idade <= 21) {
    if (repeticoes >= 60) return 'E';
    if (repeticoes >= 51) return 'MB';
    if (repeticoes >= 35) return 'B';
    if (repeticoes >= 26) return 'R';
    return 'I';
  }
  if (idade >= 22 && idade <= 25) {
    if (repeticoes >= 68) return 'E';
    if (repeticoes >= 58) return 'MB';
    if (repeticoes >= 42) return 'B';
    if (repeticoes >= 32) return 'R';
    return 'I';
  }
  if (idade >= 26 && idade <= 29) {
    if (repeticoes >= 64) return 'E';
    if (repeticoes >= 54) return 'MB';
    if (repeticoes >= 38) return 'B';
    if (repeticoes >= 28) return 'R';
    return 'I';
  }
  if (idade >= 30 && idade <= 33) {
    if (repeticoes >= 58) return 'E';
    if (repeticoes >= 50) return 'MB';
    if (repeticoes >= 34) return 'B';
    if (repeticoes >= 26) return 'R';
    return 'I';
  }
  if (idade >= 34 && idade <= 37) {
    if (repeticoes >= 55) return 'E';
    if (repeticoes >= 47) return 'MB';
    if (repeticoes >= 31) return 'B';
    if (repeticoes >= 23) return 'R';
    return 'I';
  }
  if (idade >= 38 && idade <= 41) {
    if (repeticoes >= 53) return 'E';
    if (repeticoes >= 45) return 'MB';
    if (repeticoes >= 29) return 'B';
    if (repeticoes >= 21) return 'R';
    return 'I';
  }
  if (idade >= 42 && idade <= 45) {
    if (repeticoes >= 54) return 'E';
    if (repeticoes >= 45) return 'MB';
    if (repeticoes >= 28) return 'B';
    if (repeticoes >= 19) return 'R';
    return 'I';
  }
  if (idade >= 46 && idade <= 49) {
    if (repeticoes >= 52) return 'E';
    if (repeticoes >= 43) return 'MB';
    if (repeticoes >= 26) return 'B';
    if (repeticoes >= 17) return 'R';
    return 'I';
  }

  // 50+ anos (Suficiência)
  if (idade >= 50) {
    let required = 0;
    if (idade <= 53) required = 17;
    else if (idade <= 57) required = 15;
    else if (idade <= 61) required = 13;
    else required = 11;

    return repeticoes >= required ? 'E' : 'I';
  }

  return 'I';
}

export function calcularMencaoAbdominal(idade: number, repeticoes: number, sex: Sex = 'M', line: TeachingLine = 'LEMB'): Mention {
  // Logic for LEMS, LEMC, LEMCT (Non-LEMB/BELICO)
  if (line !== 'BELICO' && line !== 'LEMB') {
    if (sex === 'F') {
      return calcularMencaoAbdominalFemLEMS(idade, repeticoes);
    } else {
      return calcularMencaoAbdominalLEMS(idade, repeticoes);
    }
  }

  if (sex === 'F') {
    // Female Sit Ups Logic (LEMB)
    if (idade >= 18 && idade <= 21) {
      if (repeticoes >= 65) return 'E';
      if (repeticoes >= 56) return 'MB';
      if (repeticoes >= 40) return 'B';
      if (repeticoes >= 31) return 'R';
      return 'I';
    }
    if (idade >= 22 && idade <= 25) {
      if (repeticoes >= 72) return 'E';
      if (repeticoes >= 62) return 'MB';
      if (repeticoes >= 47) return 'B';
      if (repeticoes >= 38) return 'R';
      return 'I';
    }
    if (idade >= 26 && idade <= 29) {
      if (repeticoes >= 68) return 'E';
      if (repeticoes >= 58) return 'MB';
      if (repeticoes >= 43) return 'B';
      if (repeticoes >= 34) return 'R';
      return 'I';
    }
    if (idade >= 30 && idade <= 33) {
      if (repeticoes >= 62) return 'E';
      if (repeticoes >= 54) return 'MB';
      if (repeticoes >= 39) return 'B';
      if (repeticoes >= 31) return 'R';
      return 'I';
    }
    if (idade >= 34 && idade <= 37) {
      if (repeticoes >= 59) return 'E';
      if (repeticoes >= 51) return 'MB';
      if (repeticoes >= 36) return 'B';
      if (repeticoes >= 28) return 'R';
      return 'I';
    }
    if (idade >= 38 && idade <= 41) {
      if (repeticoes >= 57) return 'E';
      if (repeticoes >= 49) return 'MB';
      if (repeticoes >= 34) return 'B';
      if (repeticoes >= 26) return 'R';
      return 'I';
    }
    if (idade >= 42 && idade <= 45) {
      if (repeticoes >= 58) return 'E';
      if (repeticoes >= 49) return 'MB';
      if (repeticoes >= 33) return 'B';
      if (repeticoes >= 24) return 'R';
      return 'I';
    }
    if (idade >= 46 && idade <= 49) {
      if (repeticoes >= 56) return 'E';
      if (repeticoes >= 47) return 'MB';
      if (repeticoes >= 31) return 'B';
      if (repeticoes >= 22) return 'R';
      return 'I';
    }

    // 50+ anos (Suficiência)
    if (idade >= 50) {
      let required = 0;
      if (idade <= 53) required = 20;
      else if (idade <= 57) required = 18;
      else if (idade <= 61) required = 16;
      else required = 14;

      return repeticoes >= required ? 'E' : 'I';
    }

    return 'I';
  }

  // Male Sit Ups Logic (LEMB / BELICO)
  if (idade >= 18 && idade <= 21) {
    if (repeticoes >= 74) return 'E';
    if (repeticoes >= 64) return 'MB';
    if (repeticoes >= 45) return 'B';
    if (repeticoes >= 35) return 'R';
    return 'I';
  }
  if (idade >= 22 && idade <= 25) {
    if (repeticoes >= 79) return 'E';
    if (repeticoes >= 69) return 'MB';
    if (repeticoes >= 52) return 'B';
    if (repeticoes >= 42) return 'R';
    return 'I';
  }
  if (idade >= 26 && idade <= 29) {
    if (repeticoes >= 76) return 'E';
    if (repeticoes >= 66) return 'MB';
    if (repeticoes >= 49) return 'B';
    if (repeticoes >= 38) return 'R';
    return 'I';
  }
  if (idade >= 30 && idade <= 33) {
    if (repeticoes >= 70) return 'E';
    if (repeticoes >= 61) return 'MB';
    if (repeticoes >= 43) return 'B';
    if (repeticoes >= 34) return 'R';
    return 'I';
  }
  if (idade >= 34 && idade <= 37) {
    if (repeticoes >= 66) return 'E';
    if (repeticoes >= 57) return 'MB';
    if (repeticoes >= 40) return 'B';
    if (repeticoes >= 31) return 'R';
    return 'I';
  }
  if (idade >= 38 && idade <= 41) {
    if (repeticoes >= 64) return 'E';
    if (repeticoes >= 55) return 'MB';
    if (repeticoes >= 38) return 'B';
    if (repeticoes >= 29) return 'R';
    return 'I';
  }
  if (idade >= 42 && idade <= 45) {
    if (repeticoes >= 62) return 'E';
    if (repeticoes >= 53) return 'MB';
    if (repeticoes >= 36) return 'B';
    if (repeticoes >= 27) return 'R';
    return 'I';
  }
  if (idade >= 46 && idade <= 49) {
    if (repeticoes >= 60) return 'E';
    if (repeticoes >= 51) return 'MB';
    if (repeticoes >= 34) return 'B';
    if (repeticoes >= 25) return 'R';
    return 'I';
  }
  
  // 50+ anos (Suficiência)
  if (idade >= 50) {
    let required = 0;
    if (idade <= 53) required = 23;
    else if (idade <= 57) required = 21;
    else if (idade <= 61) required = 19;
    else required = 17;

    return repeticoes >= required ? 'B' : 'I';
  }

  return 'I';
}

export function calcularMencaoBarra(idade: number, repeticoes: number, sex: Sex = 'M'): Mention {
  if (sex === 'F') {
    // Feminino OII - Barra Fixa (LEMB)
    // Até 39 anos: Repetições
    if (idade >= 18 && idade <= 21) {
      if (repeticoes >= 6) return 'E';
      if (repeticoes >= 5) return 'MB';
      if (repeticoes >= 3) return 'B';
      if (repeticoes >= 1) return 'R';
      return 'I';
    }
    if (idade >= 22 && idade <= 25) {
      if (repeticoes >= 7) return 'E';
      if (repeticoes >= 6) return 'MB';
      if (repeticoes >= 4) return 'B';
      if (repeticoes >= 2) return 'R';
      return 'I';
    }
    if (idade >= 26 && idade <= 29) {
      if (repeticoes >= 6) return 'E';
      if (repeticoes >= 5) return 'MB';
      if (repeticoes >= 3) return 'B';
      if (repeticoes >= 2) return 'R';
      return 'I';
    }
    if (idade >= 30 && idade <= 33) {
      if (repeticoes >= 6) return 'E';
      if (repeticoes >= 5) return 'MB';
      if (repeticoes >= 3) return 'B';
      if (repeticoes >= 1) return 'R';
      return 'I';
    }
    if (idade >= 34 && idade <= 37) {
      if (repeticoes >= 5) return 'E';
      if (repeticoes >= 4) return 'MB';
      if (repeticoes >= 3) return 'B';
      if (repeticoes >= 1) return 'R';
      return 'I';
    }
    if (idade >= 38 && idade <= 39) {
      if (repeticoes >= 4) return 'E';
      if (repeticoes >= 3) return 'MB';
      if (repeticoes >= 2) return 'B';
      if (repeticoes >= 1) return 'R';
      return 'I';
    }

    // A partir de 40 anos: Segundos (Sustentação)
    // 40-45 anos: Suficiência >= 45s (E)
    if (idade >= 40 && idade <= 45) {
      return repeticoes >= 45 ? 'E' : 'I';
    }
    // 46-49 anos: Suficiência >= 30s (E)
    if (idade >= 46 && idade <= 49) {
      return repeticoes >= 30 ? 'E' : 'I';
    }

    // 50+ anos: Suficiência (Geralmente 15s ou similar, mantendo padrão de suficiência = E)
    if (idade >= 50) {
      return repeticoes >= 15 ? 'E' : 'I';
    }

    return 'I';
  }

  // Masculino OII - Barra Fixa (LEMB)
  // Faixa 18-21 anos: I (<=4), R (5-6), B (7-9), MB (10-11), E (>=12)
  if (idade >= 18 && idade <= 21) {
    if (repeticoes >= 12) return 'E';
    if (repeticoes >= 10) return 'MB';
    if (repeticoes >= 7) return 'B';
    if (repeticoes >= 5) return 'R';
    return 'I';
  }
  
  // Faixa 22-25 anos: I (<=5), R (6-7), B (8-10), MB (11-12), E (>=13)
  if (idade >= 22 && idade <= 25) {
    if (repeticoes >= 13) return 'E';
    if (repeticoes >= 11) return 'MB';
    if (repeticoes >= 8) return 'B';
    if (repeticoes >= 6) return 'R';
    return 'I';
  }
  
  // Faixa 26-29 anos: I (<=4), R (5-6), B (7-9), MB (10-11), E (>=12)
  if (idade >= 26 && idade <= 29) {
    if (repeticoes >= 12) return 'E';
    if (repeticoes >= 10) return 'MB';
    if (repeticoes >= 7) return 'B';
    if (repeticoes >= 5) return 'R';
    return 'I';
  }
  
  // Faixa 30-33 anos: I (<=4), R (5), B (6-8), MB (9-10), E (>=11)
  if (idade >= 30 && idade <= 33) {
    if (repeticoes >= 11) return 'E';
    if (repeticoes >= 9) return 'MB';
    if (repeticoes >= 6) return 'B';
    if (repeticoes >= 5) return 'R';
    return 'I';
  }
  
  // Faixa 34-37 anos: I (<=3), R (4), B (5-6), MB (7-8), E (>=9)
  if (idade >= 34 && idade <= 37) {
    if (repeticoes >= 9) return 'E';
    if (repeticoes >= 7) return 'MB';
    if (repeticoes >= 5) return 'B';
    if (repeticoes >= 4) return 'R';
    return 'I';
  }
  
  // Faixa 38-39 anos: I (<=2), R (3), B (4-5), MB (6-7), E (>=8)
  if (idade >= 38 && idade <= 39) {
    if (repeticoes >= 8) return 'E';
    if (repeticoes >= 6) return 'MB';
    if (repeticoes >= 4) return 'B';
    if (repeticoes >= 3) return 'R';
    return 'I';
  }
  
  // Zonas de Suficiência (40-49)
  // 40-45 anos: Suficiência (>= 2 repetições)
  if (idade >= 40 && idade <= 45) {
    return repeticoes >= 2 ? 'E' : 'I';
  }
  
  // 46-49 anos: Suficiência (>= 1 repetição)
  if (idade >= 46 && idade <= 49) {
    return repeticoes >= 1 ? 'E' : 'I';
  }

  // 50+ anos (Suficiência)
  if (idade >= 50) {
    return repeticoes >= 1 ? 'E' : 'I';
  }

  return 'I';
}

export function performTafCalculation(military: Military, results: { run: number; pushUps: number; sitUps: number; pullUps: number }): TafCalculationResult {
  const table = getTafTable(military.age, military.sex, military.teachingLine);

  const runMention = calcularMencaoCorrida(military.age, results.run, military.sex, military.teachingLine);
  const pushUpsMention = calcularMencaoFlexao(military.age, results.pushUps, military.sex, military.teachingLine);
  const sitUpsMention = calcularMencaoAbdominal(military.age, results.sitUps, military.sex, military.teachingLine);
  
  // Barra fixa não existe para LEMS/LEMC/LEMCT
  const hasPullUps = military.teachingLine === 'BELICO' || military.teachingLine === 'LEMB';
  const pullUpsMention: Mention = hasPullUps 
    ? calcularMencaoBarra(military.age, results.pullUps, military.sex)
    : '-';

  const mentionsToConsider = hasPullUps 
    ? [runMention, pushUpsMention, sitUpsMention, pullUpsMention]
    : [runMention, pushUpsMention, sitUpsMention];

  const overall = getOverallMention(mentionsToConsider);

  return {
    mentions: {
      run: runMention,
      pushUps: pushUpsMention,
      sitUps: sitUpsMention,
      pullUps: pullUpsMention,
      overall
    },
    scores: {
      run: getMentionValue(runMention),
      pushUps: getMentionValue(pushUpsMention),
      sitUps: getMentionValue(sitUpsMention),
      pullUps: getMentionValue(pullUpsMention),
      total: getMentionValue(runMention) + getMentionValue(pushUpsMention) + getMentionValue(sitUpsMention) + getMentionValue(pullUpsMention)
    }
  };
}
