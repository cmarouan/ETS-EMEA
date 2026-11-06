import { ChevronDown } from "lucide-react";

export function AppHeader() {
  return (
    <header className="border-border/80 bg-card/80 sticky top-0 z-20 flex h-16 items-center justify-end border-b px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-2">
        <button className="hover:bg-muted ml-2 flex items-center gap-2 rounded-lg p-1.5 text-left transition">
          <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full text-xs font-semibold">
            EM
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-medium">Espace candidat</span>
            <span className="text-muted-foreground block text-xs">Mon compte</span>
          </span>
          <ChevronDown className="text-muted-foreground size-4" />
        </button>
      </div>
    </header>
  );
}
