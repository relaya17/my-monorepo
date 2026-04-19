import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { SlidersHorizontal } from "lucide-react";
import { SERVICE_OPTIONS } from "@/lib/constants";

export interface Filters {
  maxDistance: number;
  maxPrice: number;
  services: string[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_FILTERS: Filters = {
  maxDistance: 50,
  maxPrice: 500,
  services: [],
};

interface FilterDrawerProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const FilterDrawer = ({ filters, onChange }: FilterDrawerProps) => {
  const [local, setLocal] = useState<Filters>(filters);
  const [open, setOpen] = useState(false);

  const toggleService = (s: string) => {
    setLocal((f) => ({
      ...f,
      services: f.services.includes(s)
        ? f.services.filter((x) => x !== s)
        : [...f.services, s],
    }));
  };

  const handleApply = () => {
    onChange(local);
    setOpen(false);
  };

  const handleReset = () => {
    setLocal(DEFAULT_FILTERS);
    onChange(DEFAULT_FILTERS);
    setOpen(false);
  };

  const activeCount =
    (filters.maxDistance < 50 ? 1 : 0) +
    (filters.maxPrice < 500 ? 1 : 0) +
    filters.services.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="פתח פילטרים"
          title="פילטרים"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>סינון תוצאות</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-4">
          {/* Distance */}
          <div>
            <div className="flex justify-between mb-3 text-sm font-medium">
              <span>מרחק מקסימלי</span>
              <span className="text-primary font-bold">
                {local.maxDistance >= 50 ? 'ללא הגבלה' : `${local.maxDistance} ק"מ`}
              </span>
            </div>
            <Slider
              min={1}
              max={50}
              step={1}
              value={[local.maxDistance]}
              onValueChange={([v]) => setLocal((f) => ({ ...f, maxDistance: v }))}
            />
          </div>

          {/* Price */}
          <div>
            <div className="flex justify-between mb-3 text-sm font-medium">
              <span>מחיר מקסימלי לשעה</span>
              <span className="text-primary font-bold">
                {local.maxPrice >= 500 ? "ללא הגבלה" : `₪${local.maxPrice}`}
              </span>
            </div>
            <Slider
              min={20}
              max={500}
              step={10}
              value={[local.maxPrice]}
              onValueChange={([v]) => setLocal((f) => ({ ...f, maxPrice: v }))}
            />
          </div>

          {/* Services */}
          <div>
            <p className="text-sm font-medium mb-3">סוג שירות</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((s) => (
                <Badge
                  key={s}
                  variant={local.services.includes(s) ? "default" : "outline"}
                  className="cursor-pointer select-none py-1.5 px-3"
                  onClick={() => toggleService(s)}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            איפוס
          </Button>
          <Button onClick={handleApply} className="flex-1">
            החל פילטרים
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterDrawer;
