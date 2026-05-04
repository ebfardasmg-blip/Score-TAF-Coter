/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Military, TAFResult } from '../types';
import { firebaseService } from '../services/firebaseService';
import { FileBarChart, Download, FileSpreadsheet, FileText, Send } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportsProps {
  militaries: Military[];
}

const RANK_ABBREVIATIONS: Record<string, string> = {
  'General': 'Gen',
  'Coronel': 'Cel',
  'Tenente-Coronel': 'Ten Cel',
  'Major': 'Maj',
  'Capitão': 'Cap',
  '1º Tenente': '1º Ten',
  '2º Tenente': '2º Ten',
  'Aspira': 'Asp',
  'Subtenente': 'ST',
  '1º Sargento': '1º Sgt',
  '2º Sargento': '2 Sgt',
  '3º Sargento': '3º Sgt',
  'Cabo': 'Cb',
  'Soldado': 'Sd'
};

const RANK_ORDER: Record<string, number> = {
  'General': 1,
  'Coronel': 4,
  'Tenente-Coronel': 5,
  'Major': 6,
  'Capitão': 7,
  '1º Tenente': 8,
  '2º Tenente': 9,
  'Aspira': 10,
  'Subtenente': 11,
  '1º Sargento': 12,
  '2º Sargento': 13,
  '3º Sargento': 14,
  'Cabo': 15,
  'Soldado': 16
};

export function Reports({ militaries }: ReportsProps) {
  const [results, setResults] = useState<TAFResult[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedTafType, setSelectedTafType] = useState<string>("Todos");
  const [selectedCallType, setSelectedCallType] = useState<string>("Todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    setLoading(true);
    const data = await firebaseService.getTAFResults();
    setResults(data.filter(r => r.status === 'final' || !r.status));
    setLoading(false);
  };

  const filteredResults = results.filter(r => {
    const matchYear = (r.year || 0).toString() === selectedYear;
    
    // Normalização para comparação (ignora case e espaços extras)
    const rTaf = r.tafType?.toLowerCase().trim();
    const rCall = r.callType?.toLowerCase().trim();

    // Mapeamento de filtros para valores possíveis no BD
    const matchTaf = selectedTafType === "Todos" || 
      (selectedTafType === "1º TAF" && (rTaf === "1º taf" || rTaf === "primeiro taf")) ||
      (selectedTafType === "2º TAF" && (rTaf === "2º taf" || rTaf === "segundo taf")) ||
      (selectedTafType === "3º TAF" && (rTaf === "3º taf" || rTaf === "terceiro taf")) ||
      r.tafType === selectedTafType;

    const matchCall = selectedCallType === "Todas" ||
      (selectedCallType === "1ª CHAMADA" && (rCall === "1ª chamada" || rCall === "primeira chamada")) ||
      (selectedCallType === "2ª CHAMADA" && (rCall === "2ª chamada" || rCall === "segunda chamada")) ||
      (selectedCallType === "3ª CHAMADA" && (rCall === "3ª chamada" || rCall === "terceira chamada")) ||
      (selectedCallType === "4ª CHAMADA" && (rCall === "4ª chamada" || rCall === "quarta chamada")) ||
      (selectedCallType === "5ª CHAMADA" && (rCall === "5ª chamada" || rCall === "quinta chamada")) ||
      r.callType?.toUpperCase() === selectedCallType;

    return matchYear && matchTaf && matchCall;
  });

  const isExportDisabled = filteredResults.length === 0 || (selectedTafType !== "Todos" && selectedCallType !== "Todas");

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(18);
    const subtitle = `${selectedTafType !== "Todos" ? selectedTafType : "TAF Geral"} - ${selectedCallType !== "Todas" ? selectedCallType : "Todas as Chamadas"}`;
    doc.text(`RELATÓRIO CONSOLIDADO DO TAF - ANO ${selectedYear}`, 148, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(subtitle, 148, 22, { align: 'center' });
    
    const tableData = filteredResults.map(r => {
      const military = militaries.find(m => m.id === r.militaryId);
      return [
        military?.rank || '',
        military?.name || '',
        military?.section || '-',
        `${r.results?.run || 0}m`,
        `${r.results?.pushUps || 0}`,
        `${r.results?.sitUps || 0}`,
        `${r.results?.pullUps || 0}`,
        r.mentions?.overall || '-',
        '' // Espaço para assinatura
      ];
    });

    autoTable(doc, {
      startY: 30,
      head: [['Posto/Grad', 'Nome Completo', 'Chefia/Seção', 'Corrida', 'Flexão', 'Abd', 'Barras', 'Menção', 'Ciente do Militar']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [21, 128, 61], halign: 'center' }, // EB Green
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        8: { cellWidth: 40 } // Largura maior para a coluna de assinatura
      }
    });

    const fileName = `TAF_${selectedYear}_${selectedTafType}_${selectedCallType}`.replace(/\s/g, '_');
    doc.save(`${fileName}.pdf`);
  };

  const exportToBI_Text = () => {
    if (filteredResults.length === 0) return;

    // Sort results by rank hierarchy
    const sortedResults = [...filteredResults].sort((a, b) => {
      const milA = militaries.find(m => m.id === a.militaryId);
      const milB = militaries.find(m => m.id === b.militaryId);
      const orderA = RANK_ORDER[milA?.rank || 'Soldado'] || 99;
      const orderB = RANK_ORDER[milB?.rank || 'Soldado'] || 99;
      
      if (orderA !== orderB) return orderA - orderB;
      return (milA?.name || '').localeCompare(milB?.name || '');
    });

    const firstResult = sortedResults[0];
    const reportDate = new Date(firstResult.date);
    const dia = reportDate.getDate();
    const mes = format(reportDate, 'MMMM', { locale: ptBR });
    const ano = reportDate.getFullYear();

    const header = `Na ${selectedCallType} do ${selectedTafType}/${selectedYear}, da Linha de Ensino Militar Bélico (LEMB), Linha de Ensino Militar de Saúde, Complementar e Científico-Tecnológico (LMS, LMC e LMCT), conforme o contido no Nr 2.1 da Portaria-EME/C Ex Nr 850, de 31 ago 22, realizada no dia ${dia} de ${mes} de ${ano}, obteve o seguinte resultado:\n\n`;
    
    const militaryLines = sortedResults.map((r, index) => {
      const military = militaries.find(m => m.id === r.militaryId);
      const mention = r.mentions?.overall || 'I';
      const suficiencia = (mention === 'I' || mention === '-') ? 'I' : 'S';
      const rankAbbr = RANK_ABBREVIATIONS[military?.rank || 'Soldado'] || military?.rank || '';
      
      let punctuation = ';';
      if (index === sortedResults.length - 2) {
        punctuation = '; e';
      } else if (index === sortedResults.length - 1) {
        punctuation = '.';
      }

      return `${rankAbbr.toUpperCase()} ${military?.name.toUpperCase()}\nSuficiência "${suficiencia}" e Menção "${mention}"${punctuation}`;
    });

    const content = header + militaryLines.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `BI_TEXTO_TAF_${selectedYear}.txt`;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToBI_PDF = () => {
    if (filteredResults.length === 0) return;

    const doc = new jsPDF();
    
    // Sort results by rank hierarchy
    const sortedResults = [...filteredResults].sort((a, b) => {
      const milA = militaries.find(m => m.id === a.militaryId);
      const milB = militaries.find(m => m.id === b.militaryId);
      const orderA = RANK_ORDER[milA?.rank || 'Soldado'] || 99;
      const orderB = RANK_ORDER[milB?.rank || 'Soldado'] || 99;
      
      if (orderA !== orderB) return orderA - orderB;
      return (milA?.name || '').localeCompare(milB?.name || '');
    });

    const firstResult = sortedResults[0];
    const reportDate = new Date(firstResult.date);
    const dia = reportDate.getDate();
    const mes = format(reportDate, 'MMMM', { locale: ptBR });
    const ano = reportDate.getFullYear();

    doc.setFontSize(11);
    const header = `Na ${selectedCallType} do ${selectedTafType}/${selectedYear}, da Linha de Ensino Militar Bélico (LEMB), Linha de Ensino Militar de Saúde, Complementar e Científico-Tecnológico (LMS, LMC e LMCT), conforme o contido no Nr 2.1 da Portaria-EME/C Ex Nr 850, de 31 ago 22, realizada no dia ${dia} de ${mes} de ${ano}, obteve o seguinte resultado:`;
    
    const splitHeader = doc.splitTextToSize(header, 180);
    doc.text(splitHeader, 15, 20);

    let currentY = 20 + (splitHeader.length * 5) + 10;

    sortedResults.forEach((r, index) => {
      const military = militaries.find(m => m.id === r.militaryId);
      const mention = r.mentions?.overall || 'I';
      const suficiencia = (mention === 'I' || mention === '-') ? 'I' : 'S';
      const rankAbbr = RANK_ABBREVIATIONS[military?.rank || 'Soldado'] || military?.rank || '';
      
      let punctuation = ';';
      if (index === sortedResults.length - 2) {
        punctuation = '; e';
      } else if (index === sortedResults.length - 1) {
        punctuation = '.';
      }

      const milInfo = `${rankAbbr.toUpperCase()} ${military?.name.toUpperCase()}`;
      const resultInfo = `Suficiência "${suficiencia}" e Menção "${mention}"${punctuation}`;

      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(milInfo, 15, currentY);
      currentY += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(resultInfo, 15, currentY);
      currentY += 12;
    });

    const fileName = `PUBL_BI_TAF_${selectedYear}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = () => {
    const headers = ['Posto/Grad', 'Nome Completo', 'Chefia/Seção', 'Corrida', 'Flexão', 'Abdominal', 'Barras', 'Menção Geral'];
    const rows = filteredResults.map(r => {
      const military = militaries.find(m => m.id === r.militaryId);
      return [
        military?.rank || '',
        military?.name || '',
        military?.section || '',
        r.results?.run || 0,
        r.results?.pushUps || 0,
        r.results?.sitUps || 0,
        r.results?.pullUps || 0,
        r.mentions?.overall || ''
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = `TAF_${selectedYear}_${selectedTafType}_${selectedCallType}`.replace(/\s/g, '_');
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileBarChart className="w-6 h-6 text-green-700" />
        <h2 className="text-2xl font-bold">Extração de Dados</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de Exportação</CardTitle>
          <CardDescription>Refine a busca para gerar o relatório consolidado da OM.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => 2001 + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de TAF</Label>
              <Select value={selectedTafType} onValueChange={setSelectedTafType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os TAF</SelectItem>
                  <SelectItem value="1º TAF">1º TAF</SelectItem>
                  <SelectItem value="2º TAF">2º TAF</SelectItem>
                  <SelectItem value="3º TAF">3º TAF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chamada</Label>
              <Select value={selectedCallType} onValueChange={setSelectedCallType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas as Chamadas</SelectItem>
                  <SelectItem value="1ª CHAMADA">1ª CHAMADA</SelectItem>
                  <SelectItem value="2ª CHAMADA">2ª CHAMADA</SelectItem>
                  <SelectItem value="3ª CHAMADA">3ª CHAMADA</SelectItem>
                  <SelectItem value="4ª CHAMADA">4ª CHAMADA</SelectItem>
                  <SelectItem value="5ª CHAMADA">5ª CHAMADA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
                onClick={exportToPDF} 
                className="flex items-center gap-2 bg-red-700 hover:bg-red-800 h-12"
                disabled={isExportDisabled}
            >
              <Download className="w-4 h-4" /> Exportar PDF
            </Button>
            <Button 
                onClick={exportToExcel} 
                className="flex items-center gap-2 bg-green-700 hover:bg-green-800 h-12"
                disabled={isExportDisabled}
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar CSV / Excel
            </Button>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Exportar para Boletim Interno (BI)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                  onClick={exportToBI_Text} 
                  variant="outline"
                  className="flex items-center gap-2 border-2 border-neutral-800 hover:bg-neutral-50 h-12 text-neutral-800 font-bold"
                  disabled={isExportDisabled}
              >
                <FileText className="w-4 h-4" /> Texto para BI (Bloco de Notas)
              </Button>
              <Button 
                  onClick={exportToBI_PDF} 
                  variant="outline"
                  className="flex items-center gap-2 border-2 border-blue-600 hover:bg-blue-50 h-12 text-blue-600 font-bold"
                  disabled={isExportDisabled}
              >
                <Send className="w-4 h-4" /> PDF Formatado para BI
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
             <p className="text-sm text-gray-500">
               {selectedTafType !== "Todos" && selectedCallType !== "Todas"
                ? '⚠️ Selecione apenas o Tipo de TAF ou apenas a Chamada para exportar relatórios consolidados.'
                : filteredResults.length === 0 
                  ? 'Nenhum registro encontrado para este ano.' 
                  : `${filteredResults.length} registros prontos para exportação.`
               }
             </p>
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle className="text-base">Visualização Rápida</CardTitle>
          </CardHeader>
          <CardContent>
              {loading ? (
                  <p className="text-center py-4">Carregando dados...</p>
              ) : (
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                          <thead>
                              <tr className="border-b text-left text-gray-400 uppercase text-[10px]">
                                  <th className="pb-2">Grad/Nome</th>
                                  <th className="pb-2">Seção</th>
                                  <th className="pb-2 text-center">TAF</th>
                                  <th className="pb-2 text-right">Menção</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y">
                              {filteredResults.slice(0, 5).map(r => {
                                  const m = militaries.find(mil => mil.id === r.militaryId);
                                  return (
                                      <tr key={r.id}>
                                          <td className="py-2">
                                              <p className="font-bold">{m?.rank} {m?.name}</p>
                                          </td>
                                          <td className="py-2 text-gray-500">{m?.section || '-'}</td>
                                          <td className="py-2 text-center">{r.tafType ? r.tafType.split(' ')[0] : '-'}</td>
                                          <td className="py-2 text-right font-bold">{r.mentions?.overall || '-'}</td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                      {filteredResults.length > 5 && (
                          <p className="text-center text-[10px] text-gray-400 mt-4 italic">E mais {filteredResults.length - 5} registros...</p>
                      )}
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}
