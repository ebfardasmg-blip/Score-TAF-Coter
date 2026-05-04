/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Military, Rank, TeachingLine, Sex } from '../types';
import { RANKS, TEACHING_LINES, DEFAULT_OMS, COTER_SECTIONS, BRANCH_OPTIONS } from '../constants';
import { firebaseService } from '../services/firebaseService';
import { UserPlus, Search, User, Landmark, Trash2, AlertTriangle, X, Pencil } from 'lucide-react';

interface MilitaryListProps {
  militaries: Military[];
  onAdded: () => void;
  onRegisterTAF: (id: string) => void;
}

export function MilitaryList({ militaries, onAdded, onRegisterTAF }: MilitaryListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOtherOM, setIsOtherOM] = useState(false);
  const [customOM, setCustomOM] = useState('');
  
  const [formData, setFormData] = useState<Partial<Military>>({
    rank: 'Soldado',
    teachingLine: 'BELICO',
    sex: 'M',
    om: DEFAULT_OMS[0],
    branch: ''
  });

  const [militaryToDelete, setMilitaryToDelete] = useState<string | null>(null);
  const [editingMilitary, setEditingMilitary] = useState<Military | null>(null);
  const [duplicateToConfirm, setDuplicateToConfirm] = useState<Partial<Military> | null>(null);

  // Only use default OMs for the dropdown selection
  const omOptions = [...DEFAULT_OMS].sort();

  const openDeleteConfirmation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMilitaryToDelete(id);
  };

  const openEditDialog = (e: React.MouseEvent, military: Military) => {
    e.stopPropagation();
    setEditingMilitary(military);
    setFormData({
      name: military.name,
      rank: military.rank,
      sex: military.sex,
      age: military.age,
      om: military.om,
      section: military.section,
      branch: military.branch,
      teachingLine: military.teachingLine
    });
    setIsOtherOM(!DEFAULT_OMS.includes(military.om));
    if (!DEFAULT_OMS.includes(military.om)) {
      setCustomOM(military.om);
    }
  };

  const confirmDelete = async () => {
    if (militaryToDelete) {
      await firebaseService.deleteMilitary(militaryToDelete);
      setMilitaryToDelete(null);
      onAdded(); // Refresh list
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOM = isOtherOM ? customOM : formData.om;
    if (!formData.name || !formData.age || !finalOM) return;

    // Duplicate check: Rank + Name (case insensitive and trimmed)
    const normalizedNewName = formData.name.trim().toLowerCase();
    const isDuplicate = militaries.some(m => 
      m.rank === formData.rank && 
      m.name.trim().toLowerCase() === normalizedNewName
    );

    if (isDuplicate) {
      setDuplicateToConfirm({ ...formData, om: finalOM });
      return;
    }

    await saveMilitary({ ...formData, om: finalOM });
  };

  const saveMilitary = async (data: Partial<Military>) => {
    await firebaseService.addMilitary({
      ...data as Omit<Military, 'id' | 'createdAt'>,
      createdAt: Date.now(),
      age: Number(data.age)
    });
    
    setIsAdding(false);
    setIsOtherOM(false);
    setCustomOM('');
    setDuplicateToConfirm(null);
    onAdded();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilitary) return;

    const finalOM = isOtherOM ? customOM : formData.om;
    if (!formData.name || !formData.age || !finalOM) return;

    await firebaseService.updateMilitary(editingMilitary.id, {
      ...formData as Omit<Military, 'id' | 'createdAt'>,
      om: finalOM,
      age: Number(formData.age)
    });
    
    setEditingMilitary(null);
    setIsOtherOM(false);
    setCustomOM('');
    onAdded();
  };

  const handleOMChange = (value: string) => {
    if (value === 'OTHER') {
      setIsOtherOM(true);
    } else {
      setIsOtherOM(false);
      setFormData({ ...formData, om: value });
    }
  };

  const filteredMilitaries = militaries.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.rank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Militares</h2>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
          <UserPlus className="w-4 h-4 mr-2" />
          {isAdding ? "Cancelar" : "Novo Militar"}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-green-600 shadow-lg animate-in slide-in-from-top duration-300">
          <CardHeader>
            <CardTitle>Cadastrar Novo Militar</CardTitle>
            <CardDescription>Preencha os dados conforme a ficha de cadastro da OM.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" required placeholder="Ex: João Silva" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rank">Posto/Graduação</Label>
                  <Select value={formData.rank} onValueChange={v => setFormData({...formData, rank: v as Rank})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sexo</Label>
                  <Select value={formData.sex} onValueChange={v => setFormData({...formData, sex: v as Sex})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input id="age" type="number" required placeholder="Ex: 25" value={formData.age || ''} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="om">Organização Militar (OM)</Label>
                  <Select value={isOtherOM ? 'OTHER' : formData.om} onValueChange={handleOMChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {omOptions.map(om => (
                        <SelectItem key={om} value={om}>{om}</SelectItem>
                      ))}
                      <SelectItem value="OTHER" className="text-blue-600 font-bold italic">Outra OM...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isOtherOM && (
                  <div className="space-y-2 animate-in slide-in-from-left duration-200">
                    <Label htmlFor="custom-om" className="text-blue-600 font-bold">Digite o nome da nova OM</Label>
                    <Input id="custom-om" required placeholder="Ex: 1º Batalhão de Infantaria" value={customOM} onChange={e => setCustomOM(e.target.value)} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="section">Chefias/Seção</Label>
                  {!isOtherOM && formData.om === 'Comando de Operações Terrestres' ? (
                    <Select value={formData.section} onValueChange={v => setFormData({...formData, section: v})}>
                      <SelectTrigger><SelectValue placeholder="Selecione a Seção" /></SelectTrigger>
                      <SelectContent>
                        {COTER_SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id="section" placeholder="Ex: 1ª Seção / S1" value={formData.section || ''} onChange={e => setFormData({...formData, section: e.target.value})} />
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="teachingLine">Linha de Ensino</Label>
                  <Select 
                    value={formData.teachingLine} 
                    onValueChange={v => setFormData({
                      ...formData, 
                      teachingLine: v as TeachingLine,
                      branch: BRANCH_OPTIONS[v as string]?.[0] || ''
                    })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TEACHING_LINES.map(line => <SelectItem key={line.id} value={line.id}>{line.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="branch">Arma/Quadro/Serviço</Label>
                  <Select 
                    value={formData.branch} 
                    onValueChange={v => setFormData({...formData, branch: v})}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione a Arma/Quadro/Serviço" /></SelectTrigger>
                    <SelectContent>
                      {(BRANCH_OPTIONS[formData.teachingLine || 'BELICO'] || []).map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full bg-green-700 hover:bg-green-800">Cadastrar Militar</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input 
          className="pl-10" 
          placeholder="Buscar por nome ou posto..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredMilitaries.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Nenhum militar cadastrado.</div>
        ) : (
          filteredMilitaries.map(military => (
            <Card key={military.id} className="hover:border-green-400 transition-colors cursor-pointer" onClick={() => onRegisterTAF(military.id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{military.rank} {military.name}</h3>
                    <p className="text-xs text-gray-500">
                      {military.om}{military.section ? ` • ${military.section}` : ''} • {military.age} anos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[10px]">
                    {military.teachingLine}
                  </Badge>
                  <div className="flex flex-col gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      onClick={(e) => openEditDialog(e, military)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => openDeleteConfirmation(e, military.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Military Modal */}
      {editingMilitary && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8 relative z-50">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle>Editar Militar</CardTitle>
                <CardDescription>Atualize as informações do militar.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingMilitary(null)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome Completo</Label>
                    <Input id="edit-name" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-rank">Posto/Graduação</Label>
                    <Select value={formData.rank} onValueChange={v => setFormData({...formData, rank: v as Rank})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sex">Sexo</Label>
                    <Select value={formData.sex} onValueChange={v => setFormData({...formData, sex: v as Sex})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-age">Idade</Label>
                    <Input id="edit-age" type="number" required value={formData.age || ''} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-om">Organização Militar (OM)</Label>
                    <Select value={isOtherOM ? 'OTHER' : formData.om} onValueChange={handleOMChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {omOptions.map(om => (
                          <SelectItem key={om} value={om}>{om}</SelectItem>
                        ))}
                        <SelectItem value="OTHER" className="text-blue-600 font-bold italic">Outra OM...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isOtherOM && (
                    <div className="space-y-2 animate-in slide-in-from-left duration-200">
                      <Label htmlFor="edit-custom-om" className="text-blue-600 font-bold">Digite o nome da nova OM</Label>
                      <Input id="edit-custom-om" required value={customOM} onChange={e => setCustomOM(e.target.value)} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="edit-section">Chefias/Seção</Label>
                    {!isOtherOM && formData.om === 'Comando de Operações Terrestres' ? (
                      <Select value={formData.section} onValueChange={v => setFormData({...formData, section: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione a Seção" /></SelectTrigger>
                        <SelectContent>
                          {COTER_SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input id="edit-section" value={formData.section || ''} onChange={e => setFormData({...formData, section: e.target.value})} />
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="edit-teachingLine">Linha de Ensino</Label>
                    <Select 
                      value={formData.teachingLine} 
                      onValueChange={v => setFormData({
                        ...formData, 
                        teachingLine: v as TeachingLine,
                        branch: BRANCH_OPTIONS[v as string]?.[0] || ''
                      })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TEACHING_LINES.map(line => <SelectItem key={line.id} value={line.id}>{line.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="edit-branch">Arma/Quadro/Serviço</Label>
                    <Select 
                      value={formData.branch} 
                      onValueChange={v => setFormData({...formData, branch: v})}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione a Arma/Quadro/Serviço" /></SelectTrigger>
                      <SelectContent>
                        {(BRANCH_OPTIONS[formData.teachingLine || 'BELICO'] || []).map(option => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingMilitary(null)}>Cancelar</Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Salvar Alterações</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {militaryToDelete && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Confirmar Exclusão</CardTitle>
                <CardDescription>Esta ação não pode ser desfeita.</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto" 
                onClick={() => setMilitaryToDelete(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Deseja realmente excluir este militar e <strong>todos os seus registros de TAF</strong> permanentemente?
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setMilitaryToDelete(null)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={confirmDelete}
                >
                  Excluir Permanentemente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Duplicate Confirmation Modal */}
      {duplicateToConfirm && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border-amber-200">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Militar já cadastrado</CardTitle>
                <CardDescription>Possível duplicidade detectada.</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto" 
                onClick={() => setDuplicateToConfirm(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Atenção: O militar <strong>{duplicateToConfirm.rank} {duplicateToConfirm.name}</strong> já consta no sistema. 
                Deseja continuar com este novo cadastro mesmo assim?
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setDuplicateToConfirm(null)}
                >
                  Não, Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" 
                  onClick={() => saveMilitary(duplicateToConfirm)}
                >
                  Sim, Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
