import { useState } from "react";
import { Wallet, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useConnect, useAccount } from "wagmi";
import { toast } from "sonner";

interface WalletConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const walletInfo: Record<string, { name: string; icon: string; description: string }> = {
  injected: {
    name: "Browser Wallet",
    icon: "🦊",
    description: "MetaMask, Brave, or other browser extension",
  },
  "io.metamask": {
    name: "MetaMask",
    icon: "🦊",
    description: "Connect using MetaMask extension",
  },
  walletConnect: {
    name: "WalletConnect",
    icon: "🔗",
    description: "Scan with any WalletConnect compatible wallet",
  },
  coinbaseWalletSDK: {
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "Connect using Coinbase Wallet",
  },
};

const WalletConnectModal = ({ open, onOpenChange, onSuccess }: WalletConnectModalProps) => {
  const { connectors, connect, isPending } = useConnect();
  const { isConnected } = useAccount();
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId);
    if (!connector) return;

    setConnectingId(connectorId);
    
    try {
      await connect(
        { connector },
        {
          onSuccess: () => {
            toast.success("Wallet connected successfully!");
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error) => {
            console.error("Connection error:", error);
            if (error.message.includes("rejected")) {
              toast.error("Connection rejected by user");
            } else if (error.message.includes("No provider")) {
              toast.error("Wallet not found. Please install a wallet extension.");
            } else {
              toast.error("Failed to connect wallet");
            }
          },
        }
      );
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setConnectingId(null);
    }
  };

  // Get unique connectors (avoid duplicates)
  const uniqueConnectors = connectors.reduce((acc, connector) => {
    // Skip if we already have this connector type
    if (acc.find((c) => c.id === connector.id)) return acc;
    return [...acc, connector];
  }, [] as typeof connectors);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="w-5 h-5 text-primary" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a wallet to connect to Voxtrade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {uniqueConnectors.map((connector) => {
            const info = walletInfo[connector.id] || {
              name: connector.name,
              icon: "💼",
              description: `Connect using ${connector.name}`,
            };
            const isConnecting = connectingId === connector.id;

            return (
              <Button
                key={connector.id}
                variant="outline"
                className="w-full justify-between h-auto py-4 px-4 bg-background/50 border-border hover:bg-primary/10 hover:border-primary/50 transition-all"
                onClick={() => handleConnect(connector.id)}
                disabled={isPending || isConnected}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{info.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{info.name}</p>
                    <p className="text-xs text-muted-foreground">{info.description}</p>
                  </div>
                </div>
                {isConnecting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            );
          })}

          {uniqueConnectors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No wallet detected</p>
              <Button variant="outline" asChild>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  Install MetaMask
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          By connecting, you agree to our Terms of Service
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
