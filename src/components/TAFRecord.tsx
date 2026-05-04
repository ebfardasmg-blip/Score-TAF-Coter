/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Military } from '../types';
import { firebaseService } from '../services/firebaseService';
import { performTafCalculation, calculateMention, getTafTable, calcularMencaoCorrida, calcularMencaoFlexao, calcularMencaoAbdominal, calcularMencaoBarra } from '../lib/taf-calculator';
import { ClipboardList, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MENTION_LABELS, MENTION_COLORS } from '../constants';
import { Badge } from '@/components/ui/badge';

interface TAFRecordProps {
  militaries: Military[];
  initialMilitaryId: string | null;
  isGestorAuthenticated: boolean;
  onSuccess: () => void;
}

export function TAFRecord({ militaries, initialMilitaryId, isGestorAuthenticated, onSuccess }: TAFRecordProps) {
  const [selectedId, setSelectedId] = useState<string>(initialMilitaryId || '');
  const [launcherType, setLauncherType] = useState('Auxiliar SG3');
  const [showEvaluatorInput, setShowEvaluatorInput] = useState(false);
  const [evaluatorName, setEvaluatorName] = useState('');
  const [tafDate, setTafDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [existingTAFId, setExistingTAFId] = useState<string | null>(null);
  const [isExistingFinal, setIsExistingFinal] = useState(false);
  const [tafYear, setTafYear] = useState<string>(new Date().getFullYear().toString());
  const [tafType, setTafType] = useState<string>('1º TAF');
  const [callType, setCallType] = useState<string>('1ª CHAMADA');
  const [evaluators, setEvaluators] = useState<Record<string, string>>({});
  const [savedModalities, setSavedModalities] = useState<Record<string, boolean>>({});
  const [lastSavedResults, setLastSavedResults] = useState<Record<string, number>>({});
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [results, setResults] = useState({
    run: 0,
    pushUps: 0,
    sitUps: 0,
    pullUps: 0,
    pullUpsSuspension: 0
  });

  useEffect(() => {
    if (selectedId) {
      checkExistingResults();
      setSavedModalities({}); // Reset saved indicators when changing military
    }
  }, [selectedId, tafYear, tafType, callType]);

  // Real-time subscription to the current record
  useEffect(() => {
    if (!existingTAFId) {
      setIsSubscribing(false);
      return;
    }

    setIsSubscribing(true);
    const unsubscribe = firebaseService.subscribeToTAFResult(existingTAFId, (data) => {
      if (data) {
        // Update local state with latest from DB, but only if not homologated
        const isDraft = data.status === 'draft';
        if (isDraft) {
          const draftResults = {
            run: data.results.run || 0,
            pushUps: data.results.pushUps || 0,
            sitUps: data.results.sitUps || 0,
            pullUps: data.results.pullUps || 0,
            pullUpsSuspension: data.results.pullUpsSuspension || 0
          };
          
          setResults(draftResults);
          setEvaluators(data.evaluators || {});
          
          const saved: Record<string, boolean> = {};
          const savedVals: Record<string, number> = {};
          Object.keys(data.evaluators || {}).forEach(key => { 
            saved[key] = true; 
            savedVals[key] = draftResults[key as keyof typeof draftResults] || 0;
          });
          setSavedModalities(saved);
          setLastSavedResults(savedVals);
        }
        setIsExistingFinal(data.status === 'final');
      }
    });

    return () => unsubscribe();
  }, [existingTAFId]);

  const checkExistingResults = async () => {
    const allResults = await firebaseService.getTAFResults(selectedId);
    // Find draft first
    const draft = allResults.find(r => 
      r.year === Number(tafYear) && 
      r.tafType === tafType && 
      r.callType === callType && 
      r.status === 'draft'
    );

    if (draft) {
      setExistingTAFId(draft.id);
      setIsExistingFinal(false);
      const draftResults = {
        run: draft.results.run || 0,
        pushUps: draft.results.pushUps || 0,
        sitUps: draft.results.sitUps || 0,
        pullUps: draft.results.pullUps || 0,
        pullUpsSuspension: draft.results.pullUpsSuspension || 0
      };
      setResults(draftResults);
      setTafDate(new Date(draft.date).toISOString().split('T')[0]);
      setEvaluators(draft.evaluators || {});
      const saved: Record<string, boolean> = {};
      const savedVals: Record<string, number> = {};
      Object.keys(draft.evaluators || {}).forEach(key => { 
        saved[key] = true; 
        savedVals[key] = draftResults[key as keyof typeof draftResults] || 0;
      });
      setSavedModalities(saved);
      setLastSavedResults(savedVals);
      return;
    }

    // Now look for final
    const final = allResults.find(r => 
      r.year === Number(tafYear) && 
      r.tafType === tafType && 
      r.callType === callType && 
      (r.status === 'final' || !r.status)
    );

    if (final) {
      setExistingTAFId(final.id);
      setIsExistingFinal(true);
      const finalResults = {
        run: final.results.run || 0,
        pushUps: final.results.pushUps || 0,
        sitUps: final.results.sitUps || 0,
        pullUps: final.results.pullUps || 0,
        pullUpsSuspension: final.results.pullUpsSuspension || 0
      };
      setResults(finalResults);
      setTafDate(new Date(final.date).toISOString().split('T')[0]);
      setEvaluators(final.evaluators || {});
      setSavedModalities({ run: true, pushUps: true, sitUps: true, pullUps: true });
      setLastSavedResults({
        run: finalResults.run,
        pushUps: finalResults.pushUps,
        sitUps: finalResults.sitUps,
        pullUps: finalResults.pullUps,
        pullUpsSuspension: finalResults.pullUpsSuspension
      });
    } else {
      setExistingTAFId(null);
      setIsExistingFinal(false);
      setResults({ run: 0, pushUps: 0, sitUps: 0, pullUps: 0, pullUpsSuspension: 0 });
      setEvaluators({});
      setSavedModalities({});
      setLastSavedResults({});
    }
  };

  const selectedMilitary = militaries.find(m => m.id === selectedId);

  const isBarraApplicable = selectedMilitary?.teachingLine === 'BELICO' || selectedMilitary?.teachingLine === 'LEMB';

  const getModalityMention = () => {
    if (!selectedMilitary) return null;
    
    const barraValue = selectedMilitary.sex === 'F' 
      ? (selectedMilitary.age >= 40 ? results.pullUpsSuspension : results.pullUps)
      : results.pullUps;

    return {
      run: calcularMencaoCorrida(selectedMilitary.age, results.run, selectedMilitary.sex, selectedMilitary.teachingLine),
      pushUps: calcularMencaoFlexao(selectedMilitary.age, results.pushUps, selectedMilitary.sex, selectedMilitary.teachingLine),
      sitUps: calcularMencaoAbdominal(selectedMilitary.age, results.sitUps, selectedMilitary.sex, selectedMilitary.teachingLine),
      pullUps: isBarraApplicable ? calcularMencaoBarra(selectedMilitary.age, barraValue, selectedMilitary.sex) : '-'
    };
  };

  const currentMentions = getModalityMention();

  const MentionBadge = ({ mention }: { mention: string }) => (
    <Badge className={`${MENTION_COLORS[mention as keyof typeof MENTION_COLORS]} border-none ml-2`}>
      {mention}
    </Badge>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilitary) return;

    const barraValue = selectedMilitary.sex === 'F' 
      ? (selectedMilitary.age >= 40 ? results.pullUpsSuspension : results.pullUps)
      : results.pullUps;

    const consolidatedResults = { ...results, pullUps: barraValue };
    const calc = performTafCalculation(selectedMilitary, consolidatedResults);

    if (isExistingFinal) {
      if (!confirm(`Este militar já possui um TAF homologado para ${tafYear} - ${tafType}. Deseja realmente substituí-lo pelos novos dados?`)) {
        return;
      }
    }
    
    if (existingTAFId) {
      await firebaseService.updateTAFResult(existingTAFId, {
        status: 'final',
        date: new Date(tafDate).getTime() + (new Date().getTimezoneOffset() * 60000), // Add offset to keep local date
        results: consolidatedResults,
        scores: calc.scores,
        mentions: calc.mentions,
        evaluators
      });
    } else {
      await firebaseService.addTAFResult({
        militaryId: selectedId,
        date: new Date(tafDate).getTime() + (new Date().getTimezoneOffset() * 60000),
        year: Number(tafYear),
        tafType,
        callType,
        results: consolidatedResults,
        scores: calc.scores,
        mentions: calc.mentions,
        status: 'final',
        evaluators
      });
    }

    onSuccess();
  };

  const handlePartialSave = async (modality: 'run' | 'pushUps' | 'sitUps' | 'pullUps') => {
    if (!selectedMilitary) return;
    const finalEvaluator = showEvaluatorInput ? evaluatorName : launcherType;
    if (!finalEvaluator.trim()) {
      alert('Por favor, informe o nome do aplicador antes de salvar.');
      return;
    }

    // Check if it was already saved to confirm replacement
    if (evaluators[modality]) {
      if (!confirm('Esta modalidade já possui um aplicador/resultado registrado. Deseja alterar o lançamento?')) {
        return;
      }
    }

    const barraValue = selectedMilitary.sex === 'F' 
      ? (selectedMilitary.age >= 40 ? results.pullUpsSuspension : results.pullUps)
      : results.pullUps;

    const consolidatedResults = { ...results, pullUps: barraValue };
    const calc = performTafCalculation(selectedMilitary, consolidatedResults);
    const newEvaluators = { ...evaluators, [modality]: finalEvaluator };
    
    if (existingTAFId) {
      // Use dot notation to avoid overwriting other modalities' results
      const updatePayload: any = {
        date: new Date(tafDate).getTime() + (new Date().getTimezoneOffset() * 60000),
        [`results.${modality}`]: modality === 'pullUps' && selectedMilitary.sex === 'F' && selectedMilitary.age >= 40 
          ? results.pullUpsSuspension 
          : results[modality as keyof typeof results],
        [`evaluators.${modality}`]: finalEvaluator,
        updatedAt: Date.now()
      };

      // We also update scores and mentions based on current local state
      // but only if we have all fields or just for this specific record
      const calc = performTafCalculation(selectedMilitary, consolidatedResults);
      updatePayload.scores = calc.scores;
      updatePayload.mentions = calc.mentions;

      await firebaseService.updateTAFResult(existingTAFId, updatePayload);
    } else {
      const id = await firebaseService.addTAFResult({
        militaryId: selectedId,
        date: new Date(tafDate).getTime() + (new Date().getTimezoneOffset() * 60000),
        year: Number(tafYear),
        tafType,
        callType,
        results: consolidatedResults,
        scores: calc.scores,
        mentions: calc.mentions,
        status: 'draft',
        evaluators: newEvaluators
      });
      setExistingTAFId(id);
    }
    setEvaluators(newEvaluators);
    setSavedModalities(prev => ({ ...prev, [modality]: true }));
    setLastSavedResults(prev => ({ 
      ...prev, 
      [modality]: modality === 'pullUps' && selectedMilitary.sex === 'F' && selectedMilitary.age >= 40 
        ? results.pullUpsSuspension 
        : results[modality as keyof typeof results] 
    }));
    alert(`${modality.toUpperCase()} salva com sucesso por ${finalEvaluator}!`);
  };

  const handleValueChange = (field: keyof typeof results, value: number) => {
    setResults(prev => ({ ...prev, [field]: value }));
    // If the new value differs from the last saved value, reset the saved status for that modality
    const modality = field === 'pullUpsSuspension' ? 'pullUps' : field;
    if (lastSavedResults[modality] !== value) {
      setSavedModalities(prev => ({ ...prev, [modality]: false }));
    }
  };

  const handleSaveAll = async () => {
    if (!selectedMilitary) return;
    const finalEvaluator = showEvaluatorInput ? evaluatorName : launcherType;
    if (!finalEvaluator.trim()) {
      alert('Por favor, informe o nome do aplicador antes de salvar.');
      return;
    }

    const barraValue = selectedMilitary.sex === 'F' 
      ? (selectedMilitary.age >= 40 ? results.pullUpsSuspension : results.pullUps)
      : results.pullUps;

    const consolidatedResults = { ...results, pullUps: barraValue };
    const calc = performTafCalculation(selectedMilitary, consolidatedResults);
    const newEvaluators = {
      run: finalEvaluator,
      pushUps: finalEvaluator,
      sitUps: finalEvaluator,
      pullUps: finalEvaluator
    };
    
    if (existingTAFId) {
      await firebaseService.updateTAFResult(existingTAFId, {
        date: new Date(tafDate).getTime() + (new Date().getTimezoneOffset() * 60000),
        results: consolidatedResults,
        evaluators: newEvaluators,
        scores: calc.scores,
        mentions: calc.mentions
      });
    } else {
      const id = await firebaseService.addTAFResult({
        militaryId: selectedId,
        date: new Date(tafDate).getTime() + (new Date().getTimezoneOffset() * 60000),
        year: Number(tafYear),
        tafType,
        callType,
        results: consolidatedResults,
        scores: calc.scores,
        mentions: calc.mentions,
        status: 'draft',
        evaluators: newEvaluators
      });
      setExistingTAFId(id);
    }
    setEvaluators(newEvaluators);
    setSavedModalities({
      run: true,
      pushUps: true,
      sitUps: true,
      pullUps: true
    });
    alert(`Todas as modalidades foram salvas com sucesso por ${finalEvaluator}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-green-700" />
        <h2 className="text-2xl font-bold">Lançar Novo TAF</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Teste</CardTitle>
          <CardDescription>Selecione o militar e insira os índices obtidos.</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubscribing && (
            <div className="flex items-center gap-2 mb-4 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg w-fit">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Sincronização Ativa (Simultâneo)</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="militar">Selecionar Militar</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione um militar...">
                    {selectedMilitary ? `${selectedMilitary.rank} ${selectedMilitary.name}` : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {militaries.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.rank} {m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tafDate">Data de Realização</Label>
                <Input 
                  id="tafDate" 
                  type="date" 
                  value={tafDate} 
                  onChange={e => setTafDate(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Select value={tafYear} onValueChange={setTafYear}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 10 + i).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tafType">Tipo de TAF</Label>
                <Select value={tafType} onValueChange={setTafType}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1º TAF">1º TAF</SelectItem>
                    <SelectItem value="2º TAF">2º TAF</SelectItem>
                    <SelectItem value="3º TAF">3º TAF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="callType">Chamada</Label>
                <Select value={callType} onValueChange={setCallType}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1ª CHAMADA">1ª CHAMADA</SelectItem>
                    <SelectItem value="2ª CHAMADA">2ª CHAMADA</SelectItem>
                    <SelectItem value="3ª CHAMADA">3ª CHAMADA</SelectItem>
                    <SelectItem value="4ª CHAMADA">4ª CHAMADA</SelectItem>
                    <SelectItem value="5ª CHAMADA">5ª CHAMADA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedMilitary && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 space-y-3 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-1">Militar Selecionado</p>
                    <p className="text-lg font-black text-green-900 leading-none">{selectedMilitary.rank} {selectedMilitary.name}</p>
                  </div>
                  <div className="bg-green-600 p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div className="flex flex-col">
                    <span className="text-green-600 font-bold uppercase text-[9px]">Organização Militar</span>
                    <span className="text-green-900 font-medium truncate">{selectedMilitary.om}</span>
                  </div>
                  {selectedMilitary.section && (
                    <div className="flex flex-col">
                      <span className="text-green-600 font-bold uppercase text-[9px]">Seção / Chefia</span>
                      <span className="text-green-900 font-medium">{selectedMilitary.section}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-green-600 font-bold uppercase text-[9px]">Idade</span>
                    <span className="text-green-900 font-medium">{selectedMilitary.age} anos</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-green-600 font-bold uppercase text-[9px]">Tabela aplicável</span>
                    <span className="text-green-900 font-black text-[10px]">
                      {selectedMilitary.teachingLine === 'BELICO' ? 'LEMB (Bélico)' : 
                       selectedMilitary.sex === 'F' ? 'LEMB (Padrão Único Fem.)' :
                       `LEMS/LEMC/LEMCT (${selectedMilitary.teachingLine})`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isExistingFinal && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-center gap-3 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-xs font-bold text-red-800 uppercase tracking-tight">
                  Atenção: Este militar já possui um TAF homologado para este período.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <Label className="font-bold uppercase text-[10px] text-gray-500 tracking-widest">Responsável pelo lançamento</Label>
                <Select 
                  value={launcherType} 
                  onValueChange={(v) => {
                    setLauncherType(v);
                    setShowEvaluatorInput(v === 'Identificação do aplicador');
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-200 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Auxiliar SG3">Auxiliar SG3</SelectItem>
                    <SelectItem value="Identificação do aplicador">Identificação do aplicador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showEvaluatorInput && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <CheckCircle2 className="w-5 h-5" />
                    <Label htmlFor="evaluator" className="font-bold uppercase text-[10px]">Nome do Aplicador</Label>
                  </div>
                  <Input 
                    id="evaluator" 
                    placeholder="Digite o nome do aplicador" 
                    value={evaluatorName} 
                    onChange={e => setEvaluatorName(e.target.value)}
                    className="bg-white border-blue-200 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="run">Corrida 12 min (metros)</Label>
                    {evaluators.run && <p className="text-[9px] text-green-600 font-bold italic">Aplicado por: {evaluators.run}</p>}
                  </div>
                  {currentMentions && <MentionBadge mention={currentMentions.run} />}
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={results.run.toString()} 
                    onValueChange={v => handleValueChange('run', Number(v))}
                  >
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione a distância" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {Array.from({ length: ((6000 - 1000) / 50) + 1 }, (_, i) => 1000 + (i * 50)).map(distance => (
                        <SelectItem key={distance} value={distance.toString()}>{distance} m</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className={`border-blue-200 ${savedModalities.run ? 'bg-green-100 text-green-700 border-green-200' : 'text-blue-700 hover:bg-blue-50'}`}
                    onClick={() => handlePartialSave('run')}
                  >
                    {savedModalities.run ? 'Salvo' : 'Salvar'}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushUps">Flexão de Braços</Label>
                      {evaluators.pushUps && <p className="text-[9px] text-green-600 font-bold italic">Aplicado por: {evaluators.pushUps}</p>}
                    </div>
                    {currentMentions && <MentionBadge mention={currentMentions.pushUps} />}
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={results.pushUps.toString()} 
                      onValueChange={v => handleValueChange('pushUps', Number(v))}
                    >
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {Array.from({ length: 201 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className={`border-blue-200 ${savedModalities.pushUps ? 'bg-green-100 text-green-700 border-green-200' : 'text-blue-700 hover:bg-blue-50'}`}
                      onClick={() => handlePartialSave('pushUps')}
                    >
                      {savedModalities.pushUps ? 'Salvo' : 'Salvar'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sitUps">Abdominal</Label>
                      {evaluators.sitUps && <p className="text-[9px] text-green-600 font-bold italic">Aplicado por: {evaluators.sitUps}</p>}
                    </div>
                    {currentMentions && <MentionBadge mention={currentMentions.sitUps} />}
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={results.sitUps.toString()} 
                      onValueChange={v => handleValueChange('sitUps', Number(v))}
                    >
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        {Array.from({ length: 201 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className={`border-blue-200 ${savedModalities.sitUps ? 'bg-green-100 text-green-700 border-green-200' : 'text-blue-700 hover:bg-blue-50'}`}
                      onClick={() => handlePartialSave('sitUps')}
                    >
                      {savedModalities.sitUps ? 'Salvo' : 'Salvar'}
                    </Button>
                  </div>
                </div>

                <div className={`space-y-2 ${!isBarraApplicable ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pullUps" className={!isBarraApplicable ? 'text-gray-400' : ''}>Barra Fixa</Label>
                      {evaluators.pullUps && <p className="text-[9px] text-green-600 font-bold italic">Aplicado por: {evaluators.pullUps}</p>}
                    </div>
                    {currentMentions && isBarraApplicable && <MentionBadge mention={currentMentions.pullUps} />}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Select 
                        value={results.pullUps.toString()} 
                        onValueChange={v => handleValueChange('pullUps', Number(v))}
                        disabled={!isBarraApplicable || (selectedMilitary?.sex === 'F' && selectedMilitary.age >= 40)}
                      >
                        <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          {Array.from({ length: 51 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {(selectedMilitary?.sex === 'F' || results.pullUpsSuspension > 0) && (
                        <Select 
                          value={results.pullUpsSuspension.toString()} 
                          onValueChange={v => handleValueChange('pullUpsSuspension', Number(v))}
                          disabled={!isBarraApplicable || (selectedMilitary?.sex === 'F' && selectedMilitary.age < 40)}
                        >
                          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {Array.from({ length: 121 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>{i}"</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className={`w-full border-blue-200 ${savedModalities.pullUps ? 'bg-green-100 text-green-700 border-green-200' : 'text-blue-700 hover:bg-blue-50'}`}
                      onClick={() => handlePartialSave('pullUps')}
                    >
                      {savedModalities.pullUps ? 'Barra Fixa Salva' : 'Salvar Barra'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="button" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-sm"
                  onClick={handleSaveAll}
                  disabled={!selectedId}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Salvar Todas as Modalidades
                </Button>
              </div>
            </div>

            {selectedMilitary && (
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-2 animate-in zoom-in-95 duration-300">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Menção Final</span>
                {(() => {
                  const barraValueFinal = selectedMilitary.sex === 'F' 
                    ? (selectedMilitary.age >= 40 ? results.pullUpsSuspension : results.pullUps)
                    : results.pullUps;
                    
                  const calc = performTafCalculation(selectedMilitary, { ...results, pullUps: barraValueFinal });
                  const finalMention = calc.mentions.overall;
                  return (
                    <div className="flex items-center gap-3">
                      <span className={`text-4xl font-black ${MENTION_COLORS[finalMention as keyof typeof MENTION_COLORS]?.replace('bg-', 'text-') || 'text-gray-900'}`}>
                        {finalMention}
                      </span>
                      <Badge className={`${MENTION_COLORS[finalMention as keyof typeof MENTION_COLORS]} border-none text-lg py-1 px-4`}>
                        {MENTION_LABELS[finalMention as keyof typeof MENTION_LABELS]}
                      </Badge>
                    </div>
                  );
                })()}
              </div>
            )}

            {isGestorAuthenticated ? (
              <Button 
                type="submit" 
                className="w-full h-12 bg-green-700 hover:bg-green-800 text-base font-bold shadow-lg mt-6"
                disabled={!selectedId}
              >
                Registrar TAF (Finalizar)
              </Button>
            ) : (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col items-center gap-3">
                <p className="text-xs font-bold text-amber-800 text-center uppercase tracking-tight">
                  Status: {existingTAFId ? 'Em lançamento pelos aplicadores' : 'Aguardando lançamento'}
                </p>
                <p className="text-[10px] text-amber-600 text-center italic">
                  Apenas o Gestor pode realizar o registro (fechamento) final do TAF.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
