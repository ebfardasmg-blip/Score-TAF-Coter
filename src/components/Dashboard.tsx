/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Military, TAFResult } from '../types';
import { firebaseService } from '../services/firebaseService';
import { getWorkoutSuggestion } from '../services/geminiService';
import { TrendingUp, Award, Users, Activity, Sparkles, ChevronRight, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MENTION_LABELS, MENTION_COLORS } from '../constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardProps {
  militaries: Military[];
  onSelectMilitary: (id: string) => void;
}

export function Dashboard({ militaries, onSelectMilitary }: DashboardProps) {
  const [results, setResults] = useState<TAFResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TAFResult | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeTAFResults((data) => {
      setResults(data);
      if (data.length > 0 && !selectedResult) {
        setSelectedResult(data[0]);
      }
    });
    return () => unsubscribe();
  }, [selectedResult]);

  const handleGetAiInsights = async (result: TAFResult) => {
    const military = militaries.find(m => m.id === result.militaryId);
    if (!military) return;
    
    setIsAiLoading(true);
    setAiSuggestion(null);
    const suggestion = await getWorkoutSuggestion(military, result);
    setAiSuggestion(suggestion);
    setIsAiLoading(false);
  };

  // Stats
  const totalMilitaries = militaries.length;
  const totalTests = results.length;
  const excellentCount = results.filter(r => r.mentions.overall === 'E').length;
  const insufficientCount = results.filter(r => r.mentions.overall === 'I').length;

  const mentionStats = [
    { name: 'E', count: results.filter(r => r.mentions.overall === 'E').length },
    { name: 'MB', count: results.filter(r => r.mentions.overall === 'MB').length },
    { name: 'B', count: results.filter(r => r.mentions.overall === 'B').length },
    { name: 'R', count: results.filter(r => r.mentions.overall === 'R').length },
    { name: 'I', count: results.filter(r => r.mentions.overall === 'I').length },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white border-2 border-green-700/10 shadow-sm overflow-hidden mb-6">
        <div className="bg-green-700 px-4 py-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-white" />
          <p className="text-[10px] font-bold text-white uppercase tracking-wider">Diretrizes Oficiais</p>
        </div>
        <CardContent className="p-4">
          <p className="text-xs leading-relaxed text-gray-700">
            Este aplicativo segue as diretrizes da <strong>PORTARIA – EME/C Ex Nº 850, DE 31 DE AGOSTO DE 2022</strong>, que regula o Teste de Avaliação Física no Exército Brasileiro.
          </p>
          <a 
            href="https://www.esefex.eb.mil.br/images/EsEFEx/Oficial%20de%20TFM/Portaria.pdf?csrt=4738824288937225015" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-green-700 font-extrabold uppercase mt-3 flex items-center gap-1 hover:underline"
          >
            Consultar Portaria na Íntegra <ChevronRight className="w-3 h-3" />
          </a>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-2 border-green-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg"><Users className="w-5 h-5 text-green-700" /></div>
            <div><p className="text-xs text-gray-500 font-bold uppercase">Militares</p><p className="text-xl font-bold">{totalMilitaries}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-white border-2 border-blue-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><Activity className="w-5 h-5 text-blue-700" /></div>
            <div><p className="text-xs text-gray-500 font-bold uppercase">Testes</p><p className="text-xl font-bold">{totalTests}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-white border-2 border-purple-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg"><Award className="w-5 h-5 text-purple-700" /></div>
            <div><p className="text-xs text-gray-500 font-bold uppercase">Excelentes</p><p className="text-xl font-bold">{excellentCount}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-white border-2 border-red-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-red-700" /></div>
            <div><p className="text-xs text-gray-500 font-bold uppercase">Atenção</p><p className="text-xl font-bold">{insufficientCount}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Menções</CardTitle>
          <CardDescription>Resumo do desempenho geral da tropa.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mentionStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#15803d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 mt-8 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-bold">Análise Inteligente</h2>
      </div>

      {results.length > 0 ? (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-none text-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Shield className="w-32 h-32" /></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                Sugestão de Treino IA
              </CardTitle>
              <CardDescription className="text-neutral-400">Com base no último teste registrado.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl mb-6 backdrop-blur">
                <div>
                  <p className="text-xs font-bold uppercase text-white/60">Último Teste</p>
                  <p className="font-bold">{militaries.find(m => m.id === selectedResult?.militaryId)?.rank} {militaries.find(m => m.id === selectedResult?.militaryId)?.name}</p>
                  <p className="text-[10px] text-white/80 uppercase font-medium">
                    {selectedResult?.year} • {selectedResult?.tafType} • {selectedResult?.callType}
                  </p>
                  <p className="text-[10px] text-white/40">{selectedResult && new Date(selectedResult.date).toLocaleDateString()}</p>
                </div>
                <Badge className={`${selectedResult && MENTION_COLORS[selectedResult.mentions.overall]} text-white border-none`}>
                  {selectedResult && MENTION_LABELS[selectedResult.mentions.overall]}
                </Badge>
              </div>

              {!aiSuggestion && !isAiLoading && (
                <Button 
                  onClick={() => selectedResult && handleGetAiInsights(selectedResult)} 
                  className="w-full bg-white text-black hover:bg-neutral-200"
                >
                  Gerar Insights com IA
                </Button>
              )}

              {isAiLoading && <div className="text-center py-4 italic text-white/80">Processando análise técnica...</div>}

              {aiSuggestion && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                    <p className="text-sm font-bold text-amber-400 mb-1 uppercase tracking-tight">Análise do Instrutor</p>
                    <p className="text-sm leading-relaxed">{aiSuggestion.analysis}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {aiSuggestion.tips?.slice(0, 2).map((tip: string, i: number) => (
                      <div key={i} className="bg-green-600/20 border border-green-600/30 p-2 rounded-lg flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                        <p className="text-[10px] uppercase font-bold text-green-300">{tip}</p>
                      </div>
                    ))}
                  </div>

                  <ScrollArea className="h-40 w-full rounded-md border border-white/10 p-2 bg-black/20">
                    <p className="text-xs font-bold uppercase text-white/40 mb-2 px-1">Plano Semanal</p>
                    {aiSuggestion.weeklyPlan?.map((plan: any, i: number) => (
                      <div key={i} className="mb-2 p-2 rounded bg-white/5 border-l-2 border-green-500">
                        <p className="text-[10px] font-bold text-green-400 uppercase">{plan.day}</p>
                        <p className="text-xs text-white/90">{plan.workout}</p>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex flex-col gap-2">
             <p className="text-sm font-bold text-neutral-500 uppercase px-1">Outros Militares</p>
             {militaries.slice(0, 3).map(m => (
               <Button key={m.id} variant="ghost" className="justify-between h-auto p-4 border border-neutral-200 bg-white" onClick={() => onSelectMilitary(m.id)}>
                 <div className="flex flex-col items-start gap-1">
                    <span className="font-bold">{m.rank} {m.name}</span>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold">{m.om}</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-neutral-400" />
               </Button>
             ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border rounded-xl">
           <Activity className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
           <p className="text-neutral-500">Cadastre um militar e registre um TAF para ver a análise.</p>
        </div>
      )}
    </div>
  );
}
