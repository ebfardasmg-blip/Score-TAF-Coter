/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Military, TAFResult } from '../types';
import { firebaseService } from '../services/firebaseService';
import { History, FileText, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MENTION_COLORS, MENTION_LABELS } from '../constants';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';

interface HistoryListProps {
  militaries: Military[];
}

export function HistoryList({ militaries }: HistoryListProps) {
  const [results, setResults] = useState<TAFResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeTAFResults((data) => {
      setResults(data.filter(r => r.status === 'final' || !r.status));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const exportToPDF = (result: TAFResult) => {
    const military = militaries.find(m => m.id === result.militaryId);
    if (!military) return;

    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('FICHA DO TESTE DE APTIDÃO FÍSICA', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Militar: ${military.rank} ${military.name}`, 20, 40);
    doc.text(`OM: ${military.om}`, 20, 50);
    if (military.section) {
      doc.text(`Seção: ${military.section}`, 20, 60);
      doc.text(`Data do Teste: ${new Date(result.date).toLocaleDateString()}`, 20, 70);
      doc.text(`Ano de Referência: ${result.year}`, 20, 80);
      doc.text(`${result.tafType} - ${result.callType}`, 20, 90);
      doc.text(`Linha de Ensino: ${military.teachingLine}`, 20, 100);
    } else {
      doc.text(`Data do Teste: ${new Date(result.date).toLocaleDateString()}`, 20, 60);
      doc.text(`Ano de Referência: ${result.year}`, 20, 70);
      doc.text(`${result.tafType} - ${result.callType}`, 20, 80);
      doc.text(`Linha de Ensino: ${military.teachingLine}`, 20, 90);
    }

    doc.setFontSize(16);
    doc.text('Desempenho', 20, 90);
    
    doc.setFontSize(12);
    doc.text(`Corrida: ${result.results.run}m - Menção: ${MENTION_LABELS[result.mentions.run]}`, 20, 100);
    doc.text(`Flexão: ${result.results.pushUps} reps - Menção: ${MENTION_LABELS[result.mentions.pushUps]}`, 20, 110);
    doc.text(`Abdominal: ${result.results.sitUps} reps - Menção: ${MENTION_LABELS[result.mentions.sitUps]}`, 20, 120);
    doc.text(`Barra: ${result.results.pullUps} reps - Menção: ${MENTION_LABELS[result.mentions.pullUps]}`, 20, 130);
    
    doc.setFontSize(18);
    doc.setTextColor(0, 100, 0);
    doc.text(`MENÇÃO GERAL: ${MENTION_LABELS[result.mentions.overall]}`, 105, 150, { align: 'center' });

    doc.save(`TAF_${military.name.replace(/\s/g, '_')}_${new Date(result.date).toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <History className="w-6 h-6 text-green-700" />
        <h2 className="text-2xl font-bold">Histórico de TAF</h2>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10">Carregando...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Nenhum teste registrado ainda.</div>
        ) : (
          results.map(result => {
            const military = militaries.find(m => m.id === result.militaryId);
            return (
              <Card key={result.id} className="overflow-hidden border-l-4" style={{ borderColor: MENTION_COLORS[result.mentions.overall].replace('bg-', '') }}>
                <div className={`h-1 ${MENTION_COLORS[result.mentions.overall]}`} />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{military?.rank} {military?.name || 'Militar não encontrado'}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(result.date).toLocaleDateString()} • {military?.om}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-[10px] py-0">{result.year || '-'}</Badge>
                        <Badge variant="outline" className="text-[10px] py-0">{result.tafType || '-'}</Badge>
                        <Badge variant="outline" className="text-[10px] py-0">{result.callType || '-'}</Badge>
                      </div>
                    </div>
                    <Badge className={`${MENTION_COLORS[result.mentions.overall]} text-white`}>
                      {MENTION_LABELS[result.mentions.overall]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center border rounded p-2">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Corrida</p>
                      <p className="text-xs font-bold">{result.results.run}m</p>
                    </div>
                    <div className="text-center border rounded p-2">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Flexão</p>
                      <p className="text-xs font-bold">{result.results.pushUps}</p>
                    </div>
                    <div className="text-center border rounded p-2">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Abd</p>
                      <p className="text-xs font-bold">{result.results.sitUps}</p>
                    </div>
                    <div className="text-center border rounded p-2">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Barra</p>
                      <p className="text-xs font-bold">{result.results.pullUps}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => exportToPDF(result)}>
                      <Download className="w-3 h-3 mr-1" /> PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
