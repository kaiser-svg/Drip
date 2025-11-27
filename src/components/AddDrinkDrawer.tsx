"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Slider } from "@/components/ui/slider";
import { DRINK_TYPES, DrinkType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AddDrinkDrawerProps {
  onAdd: (amount: number, type: DrinkType) => void;
  children: React.ReactNode;
}

export function AddDrinkDrawer({ onAdd, children }: AddDrinkDrawerProps) {
  const [amount, setAmount] = useState(250);
  const [selectedType, setSelectedType] = useState<DrinkType>("water");
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = () => {
    onAdd(amount, selectedType);
    setIsOpen(false);
    // Reset defaults after short delay
    setTimeout(() => {
      setAmount(250);
      setSelectedType("water");
    }, 300);
  };

  const adjustAmount = (delta: number) => {
    setAmount((prev) => Math.max(50, Math.min(1000, prev + delta)));
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add Drink</DrawerTitle>
            <DrawerDescription>Select drink type and amount.</DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0 space-y-6">
            {/* Drink Types Grid */}
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(DRINK_TYPES) as DrinkType[]).map((type) => {
                const def = DRINK_TYPES[type];
                const isSelected = selectedType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                      isSelected 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" 
                        : "border-transparent bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    )}
                  >
                    <span className="text-2xl">{def.icon}</span>
                    <span className={cn("text-xs font-medium", isSelected ? "text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400")}>
                      {def.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Amount Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full shrink-0" onClick={() => adjustAmount(-50)}>
                  <Minus className="h-6 w-6" />
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-5xl font-bold tracking-tighter">
                    {amount}
                    <span className="text-lg font-medium text-muted-foreground ml-1">ml</span>
                  </div>
                </div>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full shrink-0" onClick={() => adjustAmount(50)}>
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              <Slider
                value={[amount]}
                min={50}
                max={1000}
                step={10}
                onValueChange={(vals) => setAmount(vals[0])}
                className="py-4"
              />
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={handleAdd} className="h-12 rounded-xl text-lg">
              Add {amount}ml {DRINK_TYPES[selectedType].name}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="rounded-xl">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
