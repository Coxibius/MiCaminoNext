'use client';

import { useState } from 'react';
import { Package, Check, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { addStockUpdate } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function StockDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      await addStockUpdate(amount);
      setSaved(true);
      setTimeout(() => {
        setOpen(false);
        setSaved(false);
        setSaving(false);
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(error);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary hover:text-foreground">
          <Package className="h-4 w-4" />
          <span className="sr-only">Actualizar Stock</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar Inventario</DialogTitle>
          <DialogDescription>
            Registra la cantidad actual de stock que tienes disponible. Esto ayuda a llevar un control preciso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground w-8 font-bold">0g</span>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <span className="text-sm text-muted-foreground w-8 font-bold text-right">20g+</span>
          </div>
          
          <div className="text-center flex flex-col items-center justify-center">
            <span 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold text-white shadow-sm transition-colors duration-300"
              style={{
                backgroundColor: 
                  amount === 0 ? '#2a9d8f' :
                  amount <= 2 ? '#e9c46a' :
                  amount <= 5 ? '#f4a261' :
                  '#e76f51'
              }}
            >
              {amount.toFixed(1)}g
            </span>
            <span className={cn(
              'badge mt-3 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm',
              amount === 0 ? 'bg-success/20 text-success border border-success/30' :
              amount <= 2 ? 'bg-warning/20 text-warning-foreground border border-warning/30' :
              amount <= 5 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              'bg-destructive/20 text-destructive border border-destructive/30'
            )}>
              {amount === 0 ? "Sin inventario (Excelente para evitar recaídas)" :
               amount <= 2 ? "Inventario bajo (Riesgo de ansiedad de escasez)" :
               amount <= 5 ? "Inventario moderado (Vulnerabilidad media)" :
               "Inventario alto (Exposición alta)"}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
            {saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Guardado
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
