import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import CryptoBackground from "@/components/CryptoBackground";
import VoxtradeLogo from "@/components/VoxtradeLogo";
import { CryptoButton } from "@/components/ui/crypto-button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <CryptoBackground />
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo section */}
        <div className="mb-12">
          <VoxtradeLogo />
        </div>

        {/* Hero card */}
        <div className="w-full max-w-md">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl text-center">
            <h2 className="text-2xl font-display font-bold text-foreground mb-4">
              Trade Smarter with Voxtrade
            </h2>
            <p className="text-muted-foreground mb-8">
              Connect your wallet, access real-time market data, and trade seamlessly with Pear Protocol integration.
            </p>

            <div className="space-y-4">
              <CryptoButton 
                onClick={() => navigate("/auth")} 
                className="w-full"
              >
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </CryptoButton>
              
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/auth")}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>256-bit SSL encrypted</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
