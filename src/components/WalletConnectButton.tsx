import { useState } from "react";
import { Wallet, ChevronDown, LogOut, Save } from "lucide-react";
import { CryptoButton } from "./ui/crypto-button";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useAuth } from "@/contexts/AuthContext";
import WalletConnectModal from "./WalletConnectModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getChainColor = (chainId?: number) => {
  switch (chainId) {
    case 1: return "bg-blue-500"; // Ethereum
    case 137: return "bg-purple-500"; // Polygon
    case 42161: return "bg-blue-400"; // Arbitrum
    case 10: return "bg-red-500"; // Optimism
    case 8453: return "bg-blue-600"; // Base
    default: return "bg-primary";
  }
};

const WalletConnectButton = () => {
  const { address, isConnected, chain, isSaving, disconnectWallet, saveWalletToDatabase } = useWalletConnection();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSaveWallet = async () => {
    if (address && chain) {
      await saveWalletToDatabase(address, chain.id);
    }
  };

  if (!isConnected) {
    return (
      <>
        <CryptoButton
          onClick={() => setModalOpen(true)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </CryptoButton>
        <WalletConnectModal open={modalOpen} onOpenChange={setModalOpen} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CryptoButton variant="outline" size="sm" className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getChainColor(chain?.id)} animate-pulse`} />
          <span>{formatAddress(address!)}</span>
          <ChevronDown className="w-4 h-4" />
        </CryptoButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border min-w-[200px]">
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Connected to</p>
          <p className="text-sm font-medium text-foreground">{chain?.name || "Unknown Network"}</p>
        </div>
        <DropdownMenuSeparator />
        {user && (
          <DropdownMenuItem 
            onClick={handleSaveWallet} 
            disabled={isSaving}
            className="cursor-pointer"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save to Account"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={disconnectWallet} className="text-destructive cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletConnectButton;
