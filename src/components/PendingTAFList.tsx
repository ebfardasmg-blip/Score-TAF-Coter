/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Military, TAFResult } from '../types';
import { firebaseService } from '../services/firebaseService';
import { Clock, CheckSquare, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MENTION_COLORS, MENTION_LABELS } from '../constants';
import { Button } from '@/components/ui/button';

interface PendingTAFListProps {
  militaries: Military[];
}

export function PendingTAFList({ militaries }: PendingTAFListProps) {
  const [results, setResults] = useState<TAFResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [homologatingId, setHomologatingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeTAFResults((data) => {
      setResults(data.filter(r => r.status === 'draft'));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleHomologate = async (result: TAFResult) => {
    setIsProcessing(true);
    try {
      await firebaseService.updateTAFResult(result.id, {
        status: 'final'
      });
      setHomologatingId(null);
      setSuccessMessage('TAF homologado com sucesso!');
    } catch (error) {
      console.error('Erro ao homologar TAF:', error);
      alert('Erro ao homologar TAF. Verifique sua conexão.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="w-6 h-6 text-amber-600" />
        <h2 className="text-2xl font-bold font-sans tracking-tight">Pendentes de Homologação</h2>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckSquare className="w-5 h-5" />
          <p className="text-sm font-bold uppercase">{successMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400 font-mono text-sm animate-pulse">CARREGANDO DADOS...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center gap-4">
            <CheckSquare className="w-12 h-12 text-gray-200" />
            <p className="text-gray-500 font-medium">Nenhum TAF pendente no momento.</p>
          </div>
        ) : (
          results.map(result => {
            const military = militaries.find(m => m.id === result.militaryId);
            const isConfirming = homologatingId === result.id;

            return (
              <Card key={result.id} className="overflow-hidden border-amber-200 bg-amber-50/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">AGUARDANDO GESTOR</Badge>
                        <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">{new Date(result.date).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">{military?.rank} {military?.name || 'Militar não encontrado'}</h3>
                      <p className="text-xs text-gray-500 font-medium">{military?.om} • {result.tafType} • {result.callType}</p>
                    </div>
                    <Badge className={`${MENTION_COLORS[result.mentions.overall]} text-white border-none shadow-sm`}>
                      {MENTION_LABELS[result.mentions.overall]}
                    </Badge>
                  </div>

                  <div className="bg-white rounded-xl p-3 border border-amber-100 mb-4">
                    <p className="text-[10px] font-bold text-amber-800 uppercase mb-3 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Detalhes do Teste e Aplicadores
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Corrida */}
                      <div className="space-y-1 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Corrida</p>
                          <Badge variant="outline" className={`text-[8px] h-4 px-1 ${MENTION_COLORS[result.mentions.run]} text-white border-none`}>
                            {MENTION_LABELS[result.mentions.run]}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{result.results.run}m</p>
                        <p className="text-[9px] text-gray-500 italic truncate" title={result.evaluators?.run}>Aplic: {result.evaluators?.run || '-'}</p>
                      </div>

                      {/* Flexão */}
                      <div className="space-y-1 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Flexão</p>
                          <Badge variant="outline" className={`text-[8px] h-4 px-1 ${MENTION_COLORS[result.mentions.pushUps]} text-white border-none`}>
                            {MENTION_LABELS[result.mentions.pushUps]}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{result.results.pushUps} reps</p>
                        <p className="text-[9px] text-gray-500 italic truncate" title={result.evaluators?.pushUps}>Aplic: {result.evaluators?.pushUps || '-'}</p>
                      </div>

                      {/* Abdominal */}
                      <div className="space-y-1 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Abdominal</p>
                          <Badge variant="outline" className={`text-[8px] h-4 px-1 ${MENTION_COLORS[result.mentions.sitUps]} text-white border-none`}>
                            {MENTION_LABELS[result.mentions.sitUps]}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-gray-800">{result.results.sitUps} reps</p>
                        <p className="text-[9px] text-gray-500 italic truncate" title={result.evaluators?.sitUps}>Aplic: {result.evaluators?.sitUps || '-'}</p>
                      </div>

                      {/* Barra */}
                      <div className="space-y-1 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Barra</p>
                          <Badge variant="outline" className={`text-[8px] h-4 px-1 ${MENTION_COLORS[result.mentions.pullUps]} text-white border-none`}>
                            {MENTION_LABELS[result.mentions.pullUps]}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-gray-800">
                          {military?.sex === 'F' && military?.age >= 40 
                            ? `${result.results.pullUpsSuspension}s (Susp)` 
                            : `${result.results.pullUps} reps`}
                        </p>
                        <p className="text-[9px] text-gray-500 italic truncate" title={result.evaluators?.pullUps}>Aplic: {result.evaluators?.pullUps || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {isConfirming ? (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <Button 
                        variant="outline"
                        onClick={() => setHomologatingId(null)}
                        disabled={isProcessing}
                        className="flex-1 border-gray-300"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={() => handleHomologate(result)}
                        disabled={isProcessing}
                        className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold"
                      >
                        {isProcessing ? 'Processando...' : 'Confirmar Homologação'}
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setHomologatingId(result.id)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest h-10 shadow-sm"
                    >
                      Homologar TAF
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
