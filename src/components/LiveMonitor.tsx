/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Military, TAFResult } from '../types';
import { firebaseService } from '../services/firebaseService';
import { Monitor, Zap, Info, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MENTION_COLORS, MENTION_LABELS } from '../constants';

interface LiveMonitorProps {
  militaries: Military[];
}

export function LiveMonitor({ militaries }: LiveMonitorProps) {
  const [drafts, setDrafts] = useState<TAFResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeTAFResults((data) => {
      // Show only drafts (those being filled)
      setDrafts(data.filter(r => r.status === 'draft'));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold font-sans tracking-tight">Monitoramento Real-Time</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
          <Zap className="w-3 h-3 text-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Live Sync</span>
        </div>
      </div>

      <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg overflow-hidden relative mb-6">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Monitor className="w-24 h-24" /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
             <ShieldCheck className="w-4 h-4 text-blue-200" />
             <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-none">Visão do Homologador</p>
          </div>
          <p className="text-sm font-medium">Acompanhe o preenchimento dos índices pelos aplicadores em tempo real. As menções são calculadas instantaneamente.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-mono text-sm animate-pulse">SINCRONIZANDO MONITOR...</p>
        </div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center gap-4">
          <Info className="w-12 h-12 text-gray-200" />
          <p className="text-gray-500 font-medium">Nenhum TAF sendo preenchido no momento.</p>
          <p className="text-[10px] text-gray-400 uppercase font-bold italic tracking-tighter">Aguardando início dos testes no terreno</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {drafts.map(draft => {
            const military = militaries.find(m => m.id === draft.militaryId);
            const filledCount = Object.values(draft.evaluators || {}).length;
            const progress = (filledCount / 4) * 100;

            return (
              <Card key={draft.id} className="overflow-hidden border-blue-100 hover:border-blue-300 transition-all">
                <CardHeader className="p-4 bg-gray-50 flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900">{military?.rank} {military?.name}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                      {draft.tafType} • {draft.callType}
                    </p>
                  </div>
                  <Badge className={`${MENTION_COLORS[draft.mentions.overall]} text-white border-none shadow-sm`}>
                    {MENTION_LABELS[draft.mentions.overall]}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {['run', 'pushUps', 'sitUps', 'pullUps'].map((mod) => {
                      const isFilled = !!draft.evaluators?.[mod as keyof typeof draft.evaluators];
                      const mention = draft.mentions[mod as keyof typeof draft.mentions];
                      const value = mod === 'pullUps' && military?.sex === 'F' && military?.age >= 40
                        ? `${draft.results.pullUpsSuspension}s`
                        : draft.results[mod as keyof typeof draft.results];

                      return (
                        <div key={mod} className={`flex flex-col items-center p-2 rounded-lg border ${isFilled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mb-1">
                            {mod === 'run' ? 'COR' : mod === 'pushUps' ? 'FLEX' : mod === 'sitUps' ? 'ABD' : 'BAR'}
                          </span>
                          <span className={`text-xs font-black ${isFilled ? 'text-green-900' : 'text-gray-400'}`}>
                            {isFilled ? value : '-'}
                          </span>
                          {isFilled && (
                            <span className={`text-[8px] font-black mt-1 ${MENTION_COLORS[mention]?.replace('bg-', 'text-')}`}>
                              {mention}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase text-gray-500">
                      <span>Progresso do Lançamento</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
