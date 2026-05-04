import React from 'react';
import { Book, X, ArrowLeft, Shield, Info, ClipboardList, History, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ManualProps {
  onClose: () => void;
}

export const Manual: React.FC<ManualProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-neutral-100 z-40 overflow-y-auto animate-in fade-in duration-300">
      {/* Manual Header */}
      <header className="bg-[#1a1a1a] text-white p-4 shadow-md sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-green-500" />
          <h1 className="text-lg font-bold tracking-tight uppercase">Manual de Utilização</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white hover:bg-neutral-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar ao App</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white hover:bg-red-900/30 text-red-400"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-12 pb-20">
        {/* Intro */}
        <section id="introducao" className="space-y-4">
          <div className="flex items-center gap-3 border-b-2 border-green-700 pb-2">
            <Shield className="w-6 h-6 text-green-700" />
            <h2 className="text-2xl font-black text-gray-900 uppercase">Introdução</h2>
          </div>
          <p className="text-gray-700 leading-relaxed font-medium">
            O <strong>TAF Digital EB</strong> é uma ferramenta desenvolvida para auxiliar militares e gestores no cálculo e registro do Teste de Avaliação Física do Exército Brasileiro, seguindo rigorosamente a <strong>PORTARIA – EME/C Ex Nº 850 (31 de agosto de 2022)</strong>.
          </p>
        </section>

        {/* Categories */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b-2 border-green-700 pb-2">
            <LayoutDashboard className="w-6 h-6 text-green-700" />
            <h2 className="text-2xl font-black text-gray-900 uppercase">Funcionalidades</h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white p-6 rounded-xl border-2 border-neutral-200 shadow-sm space-y-3">
              <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="font-bold text-gray-900 uppercase">Cálculo de TAF</h3>
              <p className="text-sm text-gray-600">
                Selecione o militar, insira a idade e os resultados das provas (Corrida, Flexão, Abdominal). O sistema calcula automaticamente a menção baseada na linha de ensino (LEMB, LEMS, LEMC, LEMCT).
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border-2 border-neutral-200 shadow-sm space-y-3">
              <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <History className="w-6 h-6 text-green-700" />
              </div>
              <h3 className="font-bold text-gray-900 uppercase">Histórico</h3>
              <p className="text-sm text-gray-600">
                Visualize todos os TAFs realizados anteriormente, com filtros por data e menção. Gere relatórios em PDF para impressão e arquivo.
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-white p-8 rounded-2xl border-2 border-green-700/20 shadow-xl space-y-6">
          <h2 className="text-xl font-black text-green-800 uppercase flex items-center gap-2">
            <Info className="w-5 h-5" /> Passo a Passo para Cálculo
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">1</span>
              <div>
                <h4 className="font-bold text-gray-900">Configurar Perfil</h4>
                <p className="text-sm text-gray-600">Selecione o Gênero e a Linha de Ensino. Isso é fundamental para que o sistema utilize a tabela de índices correta.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">2</span>
              <div>
                <h4 className="font-bold text-gray-900">Inserir Dados</h4>
                <p className="text-sm text-gray-600">Preencha a idade do militar e os resultados atingidos em cada prova (Metros na corrida, Repetições nos demais).</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">3</span>
              <div>
                <h4 className="font-bold text-gray-900">Consultar Menção</h4>
                <p className="text-sm text-gray-600">A menção final será exibida instantaneamente: E (Excelente), MB (Muito Bom), B (Bom), R (Regular) ou I (Insuficiente).</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center pt-8 border-t border-neutral-200">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            Desenvolvido para apoio às operações terrestres (COTER)
          </p>
        </div>
      </main>

      {/* Manual Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-neutral-200 flex justify-center gap-4">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="border-2 border-neutral-900 font-bold uppercase py-6 px-10 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Retornar ao App
        </Button>
        <Button 
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase py-6 px-10 rounded-xl shadow-lg transition-all active:scale-95"
        >
          Fechar Manual
        </Button>
      </div>
    </div>
  );
};
