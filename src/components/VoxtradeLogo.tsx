import { TrendingUp } from "lucide-react";

const VoxtradeLogo = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-primary animate-pulse-glow">
          <TrendingUp className="w-10 h-10 text-primary-foreground" strokeWidth={2.5} />
        </div>
        {/* Decorative ring */}
        <div className="absolute -inset-2 rounded-3xl border border-primary/20 animate-pulse-glow" />
      </div>
      
      {/* Brand name */}
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-wider text-foreground text-glow">
          VOXTRADE
        </h1>
        <p className="mt-1 text-sm text-muted-foreground tracking-widest uppercase">
          Trade the Future
        </p>
      </div>
    </div>
  );
};

export default VoxtradeLogo;
