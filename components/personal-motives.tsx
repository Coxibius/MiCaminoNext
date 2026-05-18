'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus, X, Quote } from 'lucide-react';

const defaultMotives = [
  "Mejorar mi salud física y mental",
  "Tener la mente más clara para mis metas",
  "Ahorrar dinero para el futuro",
];

export function PersonalMotives() {
  const [motives, setMotives] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMotive, setNewMotive] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('micamino_motives');
    if (saved) {
      try {
        setMotives(JSON.parse(saved));
      } catch (e) {
        setMotives(defaultMotives);
      }
    } else {
      setMotives(defaultMotives);
    }
  }, []);

  const saveMotives = (newMotives: string[]) => {
    setMotives(newMotives);
    localStorage.setItem('micamino_motives', JSON.stringify(newMotives));
  };

  const handleAdd = () => {
    if (newMotive.trim()) {
      saveMotives([...motives, newMotive.trim()]);
      setNewMotive('');
      setIsAdding(false);
    }
  };

  const handleRemove = (index: number) => {
    saveMotives(motives.filter((_, i) => i !== index));
  };

  if (!mounted) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Quote className="w-24 h-24" />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-primary">
            <Target className="h-5 w-5" />
            Mis motivos para cambiar
          </CardTitle>
          {!isAdding && (
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)} className="h-8 text-xs">
              <Plus className="h-4 w-4 mr-1" /> Añadir
            </Button>
          )}
        </div>
        <CardDescription>
          Recuerda por qué empezaste este camino
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="flex gap-2 mb-4 animate-in slide-in-from-top-2">
            <input
              type="text"
              value={newMotive}
              onChange={(e) => setNewMotive(e.target.value)}
              placeholder="Escribe un motivo..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button size="sm" onClick={handleAdd}>Guardar</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {motives.length > 0 ? (
          <ul className="space-y-2">
            {motives.map((motive, idx) => (
              <li key={idx} className="flex items-start justify-between group rounded-md p-2 hover:bg-background/50 transition-colors border border-transparent hover:border-border/50">
                <span className="text-sm font-medium text-foreground/90 flex gap-2">
                  <span className="text-primary">•</span>
                  {motive}
                </span>
                <button 
                  onClick={() => handleRemove(idx)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="Eliminar motivo"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground italic">No has añadido motivos. ¡Añade uno para inspirarte!</p>
        )}
      </CardContent>
    </Card>
  );
}
