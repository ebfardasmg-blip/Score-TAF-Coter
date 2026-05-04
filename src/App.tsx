/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, ClipboardList, History, LayoutDashboard, Shield, FileBarChart, Book, Lock, Settings, Clock, Cloud, CloudOff, Monitor } from 'lucide-react';
import { MilitaryList } from './components/MilitaryList';
import { TAFRecord } from './components/TAFRecord';
import { HistoryList } from './components/HistoryList';
import { PendingTAFList } from './components/PendingTAFList';
import { LiveMonitor } from './components/LiveMonitor';
import { Dashboard } from './components/Dashboard';
import { Reports } from './components/Reports';
import { Manual } from './components/Manual';
import { Military } from './types';
import { firebaseService } from './services/firebaseService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [gestorSubTab, setGestorSubTab] = useState('history');
  const [militaries, setMilitaries] = useState<Military[]>([]);
  const [isDbSynced, setIsDbSynced] = useState(false);
  const [selectedMilitaryId, setSelectedMilitaryId] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isGestorAuthenticated, setIsGestorAuthenticated] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeMilitaries((data) => {
      setMilitaries(data);
      setIsDbSynced(firebaseService.isFirebaseConfigured());
    });
    
    // Check every few seconds if Firebase became available (in case of dynamic loading delay)
    const interval = setInterval(() => {
      if (!isDbSynced && firebaseService.isFirebaseConfigured()) {
        setIsDbSynced(true);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isDbSynced]);

  const handleMilitaryAdded = () => {
    // With subscriptions, we don't strictly need to refresh, but it doesn't hurt
    setActiveTab('militaries');
  };

  const handleRegisterTAF = (id: string) => {
    setSelectedMilitaryId(id);
    setActiveTab('new-taf');
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'gestor' && !isGestorAuthenticated) {
      setPendingTab('gestor');
      setShowPasswordModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '@coter') {
      setIsGestorAuthenticated(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      if (pendingTab) {
        setActiveTab(pendingTab);
        setPendingTab(null);
      }
    } else {
      alert('Senha incorreta!');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 pb-20 md:pb-0 md:pt-0">
      {/* Manual Overlay */}
      {showManual && <Manual onClose={() => setShowManual(false)} />}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 text-green-700" />
              </div>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>Digite a senha de Gestor para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gestor-password">Senha</Label>
                  <Input 
                    id="gestor-password" 
                    type="password" 
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Digite a senha..."
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1 bg-green-700 hover:bg-green-800">Entrar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1a1a1a] text-white p-4 shadow-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://lh3.googleusercontent.com/d/17kc2nUXkquKM3y3uN0242Nl_r2BMWZfV" 
            alt="COTER Logo" 
            className="w-10 h-10 object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col items-center">
            <h1 className="text-xs md:text-sm font-bold tracking-tight uppercase leading-tight text-center">Comando de operações terrestres</h1>
            <span className="text-[9px] md:text-[10px] font-black uppercase text-green-500 tracking-[0.1em] text-center">TAF Score</span>
            <span className="text-[7px] md:text-[8px] italic text-gray-400 leading-tight text-center">Desenvolvido pelo ST Ernani Pinto Júnior</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDbSynced ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
              <Cloud className="w-3 h-3 text-green-500" />
              <span className="text-[8px] font-bold text-green-500 uppercase tracking-wider">Sincronizado</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
              <CloudOff className="w-3 h-3 text-amber-500" />
              <span className="text-[8px] font-bold text-amber-500 uppercase tracking-wider">Offline (Local)</span>
            </div>
          )}

          <button 
            onClick={() => setShowManual(true)}
          className="flex items-center gap-2 bg-green-700/20 hover:bg-green-700/40 text-green-400 px-3 py-1.5 rounded-lg border border-green-700/50 transition-all active:scale-95"
        >
          <Book className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">Manual</span>
        </button>
      </div>
    </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="dashboard">
            <Dashboard 
              militaries={militaries} 
              onSelectMilitary={handleRegisterTAF} 
            />
          </TabsContent>

          <TabsContent value="monitor">
            <LiveMonitor militaries={militaries} />
          </TabsContent>

          <TabsContent value="militaries">
            <MilitaryList 
              militaries={militaries} 
              onAdded={handleMilitaryAdded} 
              onRegisterTAF={handleRegisterTAF}
            />
          </TabsContent>

          <TabsContent value="new-taf">
            <TAFRecord 
              militaries={militaries} 
              initialMilitaryId={selectedMilitaryId}
              isGestorAuthenticated={isGestorAuthenticated}
              onSuccess={() => {
                if (isGestorAuthenticated) {
                  setActiveTab('gestor');
                  setGestorSubTab('history');
                } else {
                  setActiveTab('dashboard');
                }
              }}
            />
          </TabsContent>

          <TabsContent value="gestor">
            <div className="space-y-6">
              <div className="bg-white p-1 rounded-xl border border-gray-200 flex gap-1">
                <button 
                  onClick={() => setGestorSubTab('pending')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${gestorSubTab === 'pending' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Clock className="w-4 h-4" />
                  Pendentes
                </button>
                <button 
                  onClick={() => setGestorSubTab('history')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${gestorSubTab === 'history' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <History className="w-4 h-4" />
                  Histórico
                </button>
                <button 
                  onClick={() => setGestorSubTab('reports')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${gestorSubTab === 'reports' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <FileBarChart className="w-4 h-4" />
                  Exportar
                </button>
              </div>

              {gestorSubTab === 'pending' ? (
                <PendingTAFList militaries={militaries} />
              ) : gestorSubTab === 'history' ? (
                <HistoryList militaries={militaries} />
              ) : (
                <Reports militaries={militaries} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center z-30 md:hidden">
        <button 
          onClick={() => handleTabChange('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-green-700' : 'text-gray-500'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold text-center">Início</span>
        </button>
        <button 
          onClick={() => handleTabChange('monitor')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'monitor' ? 'text-blue-700' : 'text-gray-500'}`}
        >
          <Monitor className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold text-center">Monitor</span>
        </button>
        <button 
          onClick={() => handleTabChange('militaries')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'militaries' ? 'text-green-700' : 'text-gray-500'}`}
        >
          <UserPlus className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold text-center">Militar</span>
        </button>
        <button 
          onClick={() => handleTabChange('new-taf')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'new-taf' ? 'text-green-700' : 'text-gray-500'}`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold text-center">Novo</span>
        </button>
        <button 
          onClick={() => handleTabChange('gestor')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'gestor' ? 'text-green-700' : 'text-gray-500'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] uppercase font-bold text-center">Gestor</span>
        </button>
      </nav>

      {/* Sidebar for Desktop */}
      <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 flex-col items-center py-8 gap-8 bg-white border-r border-gray-200">
        <button onClick={() => handleTabChange('dashboard')} className={`p-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-100'}`}>
          <LayoutDashboard className="w-6 h-6" />
        </button>
        <button onClick={() => handleTabChange('monitor')} className={`p-3 rounded-xl transition-colors ${activeTab === 'monitor' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:bg-gray-100'}`}>
          <Monitor className="w-6 h-6" />
        </button>
        <button onClick={() => handleTabChange('militaries')} className={`p-3 rounded-xl transition-colors ${activeTab === 'militaries' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-100'}`}>
          <UserPlus className="w-6 h-6" />
        </button>
        <button onClick={() => handleTabChange('new-taf')} className={`p-3 rounded-xl transition-colors ${activeTab === 'new-taf' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-100'}`}>
          <ClipboardList className="w-6 h-6" />
        </button>
        <button onClick={() => handleTabChange('gestor')} className={`p-3 rounded-xl transition-colors ${activeTab === 'gestor' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:bg-gray-100'}`}>
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

