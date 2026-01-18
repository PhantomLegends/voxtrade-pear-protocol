import { useEffect, useState } from 'react';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useBalance } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Copy,
  ExternalLink,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Position {
  id: string;
  token_symbol: string;
  token_address: string;
  amount: number;
  avg_entry_price: number | null;
  current_value_usd: number | null;
  pnl_usd: number | null;
  pnl_percentage: number | null;
}

interface Transaction {
  id: string;
  type: 'swap' | 'deposit' | 'withdraw' | 'trade';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  from_token: string | null;
  to_token: string | null;
  from_amount: number | null;
  to_amount: number | null;
  tx_hash: string | null;
  created_at: string;
}

// ETH price in USD (you could fetch this from an API for real-time pricing)
const ETH_PRICE_USD = 3300;

const WalletContent = () => {
  const { 
    address, 
    isConnected, 
    chain,
    pearAccessToken,
    agentWalletAddress,
    authenticateWithPear,
    createAndApproveAgent,
    isSigning,
    isCreatingAgent
  } = useWalletConnection();

  // Fetch actual ETH balance from blockchain
  const { data: ethBalance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address: address as `0x${string}`,
  });
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPnl, setTotalPnl] = useState(0);
  const [totalPnlPercentage, setTotalPnlPercentage] = useState(0);

  // Calculate total value from ETH balance
  const ethBalanceNumber = ethBalance ? Number(ethBalance.value) / Math.pow(10, ethBalance.decimals) : 0;
  const totalValueUsd = ethBalanceNumber * ETH_PRICE_USD;

  // Fetch wallet data from database
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!address) return;
      
      setIsLoading(true);
      try {
        // Get wallet ID
        const { data: wallet } = await supabase
          .from('wallets')
          .select('id')
          .eq('address', address.toLowerCase())
          .maybeSingle();

        if (wallet) {
          setWalletId(wallet.id);

          // Fetch positions
          const { data: positionsData } = await supabase
            .from('positions')
            .select('*')
            .eq('wallet_id', wallet.id);

          if (positionsData) {
            setPositions(positionsData);
            
            // Calculate P&L from positions
            const pnl = positionsData.reduce((acc, pos) => acc + (pos.pnl_usd || 0), 0);
            setTotalPnl(pnl);
            const positionsValue = positionsData.reduce((acc, pos) => acc + (pos.current_value_usd || 0), 0);
            setTotalPnlPercentage(positionsValue > 0 ? (pnl / (positionsValue - pnl)) * 100 : 0);
          }

          // Fetch recent transactions
          const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .eq('wallet_id', wallet.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (txData) {
            setTransactions(txData);
          }
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, [address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-accent" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const handleFullSetup = async () => {
    const token = await authenticateWithPear();
    if (token) {
      await createAndApproveAgent(token);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-muted-foreground mb-4">
          Connect your wallet to view your portfolio, positions, and transaction history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview Card */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Wallet className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Connected Wallet</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-mono text-foreground">{formatAddress(address!)}</p>
                <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <a 
                  href={`https://etherscan.io/address/${address}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              {chain && (
                <p className="text-sm text-muted-foreground mt-1">
                  Network: {chain.name}
                </p>
              )}
            </div>
          </div>
          
          {/* Pear Protocol Status */}
          <div className="text-right">
            {pearAccessToken ? (
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Pear Authenticated</span>
              </div>
            ) : (
              <Button
                onClick={handleFullSetup}
                disabled={isSigning || isCreatingAgent}
                size="sm"
                className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
              >
                {isSigning || isCreatingAgent ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSigning ? 'Signing...' : 'Setting up...'}
                  </>
                ) : (
                  'Setup Trading'
                )}
              </Button>
            )}
            {agentWalletAddress && (
              <p className="text-xs text-muted-foreground mt-2">
                Agent: {formatAddress(agentWalletAddress)}
              </p>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background/30 rounded-xl p-4">
            <p className="text-muted-foreground text-sm mb-1">Total Balance</p>
            {isBalanceLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatCurrency(totalValueUsd)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {ethBalanceNumber.toFixed(6)} {ethBalance?.symbol || 'ETH'}
                </p>
              </>
            )}
          </div>
          <div className="bg-background/30 rounded-xl p-4">
            <p className="text-muted-foreground text-sm mb-1">Total P&L</p>
            <p className={cn(
              "text-2xl font-display font-bold flex items-center gap-1",
              totalPnl >= 0 ? "text-primary" : "text-destructive"
            )}>
              {totalPnl >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {formatCurrency(Math.abs(totalPnl))}
            </p>
          </div>
          <div className="bg-background/30 rounded-xl p-4">
            <p className="text-muted-foreground text-sm mb-1">P&L %</p>
            <p className={cn(
              "text-2xl font-display font-bold",
              totalPnlPercentage >= 0 ? "text-primary" : "text-destructive"
            )}>
              {totalPnlPercentage >= 0 ? '+' : ''}{totalPnlPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* ETH Balance Card */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-foreground">Assets</h2>
          <button 
            onClick={() => refetchBalance()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Ξ</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">Ethereum</p>
              <p className="text-sm text-muted-foreground">ETH</p>
            </div>
          </div>
          <div className="text-right">
            {isBalanceLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="font-semibold text-foreground">
                  {ethBalanceNumber.toFixed(6)} ETH
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(totalValueUsd)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-foreground">Positions</h2>
          <button 
            onClick={() => window.location.reload()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : positions.length > 0 ? (
          <div className="space-y-3">
            {positions.map((position) => (
              <div 
                key={position.id} 
                className="flex items-center justify-between p-4 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{position.token_symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {position.amount.toLocaleString()} tokens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatCurrency(position.current_value_usd || 0)}
                  </p>
                  {position.pnl_percentage !== null && (
                    <p className={cn(
                      "text-sm flex items-center justify-end gap-1",
                      position.pnl_percentage >= 0 ? "text-primary" : "text-destructive"
                    )}>
                      {position.pnl_percentage >= 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {position.pnl_percentage >= 0 ? '+' : ''}{position.pnl_percentage.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No positions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start trading to see your positions here
            </p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
        <h2 className="text-xl font-display font-bold text-foreground mb-6">Recent Transactions</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-4 bg-muted/20 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(tx.status)}
                  <div>
                    <p className="font-semibold text-foreground capitalize">{tx.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.from_token && tx.to_token 
                        ? `${tx.from_token} → ${tx.to_token}`
                        : tx.from_token || tx.to_token || 'N/A'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {tx.from_amount && (
                    <p className="font-semibold text-foreground">
                      {tx.from_amount.toLocaleString()} {tx.from_token}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatDate(tx.created_at)}
                  </p>
                </div>
                {tx.tx_hash && (
                  <a 
                    href={`https://etherscan.io/tx/${tx.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your transaction history will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletContent;