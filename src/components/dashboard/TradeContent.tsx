import { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { usePearProtocol } from '@/hooks/usePearProtocol';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TradingPanel from './TradingPanel';

const TIMEFRAMES = ['1H', '4H', '1D', '1W'];

const TradeContent = () => {
  const { 
    address, 
    isConnected, 
    pearAccessToken,
    agentWalletAddress,
    authenticateWithPear,
    createAndApproveAgent,
    isSigning,
    isCreatingAgent
  } = useWalletConnection();

  const {
    marketData,
    priceHistory,
    positions,
    selectedAsset,
    isLoading,
    fetchMarketData,
    fetchPriceHistory,
    fetchPositions
  } = usePearProtocol(address, pearAccessToken);

  const [activeTimeframe, setActiveTimeframe] = useState('1H');
  const [activeAsset, setActiveAsset] = useState('BTC');

  // Initialize data
  useEffect(() => {
    fetchMarketData();
    fetchPriceHistory('BTC', '1H');
  }, [fetchMarketData, fetchPriceHistory]);

  // Fetch positions when authenticated
  useEffect(() => {
    if (pearAccessToken && address) {
      fetchPositions();
    }
  }, [pearAccessToken, address, fetchPositions]);

  const handleAssetChange = (symbol: string) => {
    setActiveAsset(symbol);
    fetchPriceHistory(symbol, activeTimeframe);
  };

  const handleTimeframeChange = (tf: string) => {
    setActiveTimeframe(tf);
    fetchPriceHistory(activeAsset, tf);
  };

  const handleFullSetup = async () => {
    const token = await authenticateWithPear();
    if (token) {
      await createAndApproveAgent(token);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toFixed(4);
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    return `$${vol.toLocaleString()}`;
  };

  const currentAssetData = marketData.find(m => m.symbol === activeAsset);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg p-3 shadow-xl">
          <p className="text-muted-foreground text-xs mb-1">{label}</p>
          <p className="text-foreground font-semibold">
            ${formatPrice(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-muted-foreground text-xs mt-1">
              Vol: {formatVolume(payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!isConnected) {
    return (
      <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">
          Connect Wallet to Trade
        </h3>
        <p className="text-muted-foreground mb-4">
          Connect your wallet to access trading features and view market data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Banner */}
      {!pearAccessToken && (
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-accent" />
            <div>
              <p className="text-foreground font-medium">Connect to Pear Protocol</p>
              <p className="text-muted-foreground text-sm">
                Authenticate to enable trading on Hyperliquid (requires 3 signatures)
              </p>
            </div>
          </div>
          <Button
            onClick={handleFullSetup}
            disabled={isSigning || isCreatingAgent}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isSigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sign in Wallet...
              </>
            ) : isCreatingAgent ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Approving Agent (2 sigs)...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Connect
              </>
            )}
          </Button>
        </div>
      )}

      {pearAccessToken && !agentWalletAddress && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-foreground font-medium">Approve Agent Wallet</p>
              <p className="text-muted-foreground text-sm">
                Complete setup by approving your agent wallet (2 signatures required)
              </p>
            </div>
          </div>
          <Button
            onClick={() => createAndApproveAgent()}
            disabled={isCreatingAgent}
            className="bg-orange-500 text-white hover:bg-orange-500/90"
          >
            {isCreatingAgent ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Check Wallet...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Approve Agent
              </>
            )}
          </Button>
        </div>
      )}

      {pearAccessToken && agentWalletAddress && (
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            <div>
              <p className="text-foreground font-medium">Trading Enabled</p>
              <p className="text-muted-foreground text-sm">
                Agent: {agentWalletAddress.slice(0, 8)}...{agentWalletAddress.slice(-6)}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-primary/30 text-primary">
            View on Hyperliquid
          </Button>
        </div>
      )}

      {/* Market Overview Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => handleAssetChange(asset.symbol)}
            className={cn(
              "bg-card/40 backdrop-blur-xl border rounded-2xl p-4 text-left transition-all hover:border-primary/50",
              activeAsset === asset.symbol 
                ? "border-primary/50 ring-2 ring-primary/20" 
                : "border-border/30"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-foreground">{asset.symbol}</span>
              <div className={cn(
                "flex items-center gap-1 text-sm",
                asset.change24h >= 0 ? "text-primary" : "text-destructive"
              )}>
                {asset.change24h >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
              </div>
            </div>
            <p className="text-xl font-display font-bold text-foreground">
              ${formatPrice(asset.price)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Vol: {formatVolume(asset.volume24h)}
            </p>
          </button>
        ))}
      </div>

      {/* Main Trading Area - Chart + Trading Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="xl:col-span-2 bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                {currentAssetData && currentAssetData.change24h >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">
                  {activeAsset}/USD
                </h2>
                {currentAssetData && (
                  <p className="text-sm text-muted-foreground">
                    H: ${formatPrice(currentAssetData.high24h)} · L: ${formatPrice(currentAssetData.low24h)}
                  </p>
                )}
              </div>
            </div>
            
            {currentAssetData && (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-2xl font-display font-bold text-foreground">
                  ${formatPrice(currentAssetData.price)}
                </span>
                <span className={cn(
                  "px-2 py-1 rounded-lg text-sm font-medium",
                  currentAssetData.change24h >= 0 
                    ? "bg-primary/20 text-primary" 
                    : "bg-destructive/20 text-destructive"
                )}>
                  {currentAssetData.change24h >= 0 ? '+' : ''}{currentAssetData.change24h.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTimeframe === tf
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {tf}
              </button>
            ))}
            <button 
              onClick={() => fetchPriceHistory(activeAsset, activeTimeframe)}
              className="p-2 rounded-lg bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors ml-2"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Price Chart */}
        <div className="h-80 w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(val) => `$${formatPrice(val)}`}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Volume Chart */}
        <div className="h-24 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priceHistory} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Bar 
                dataKey="volume" 
                fill="hsl(var(--muted-foreground))" 
                opacity={0.3}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>

        {/* Trading Panel */}
        <TradingPanel
          selectedAsset={activeAsset}
          currentPrice={currentAssetData?.price || 0}
          pearAccessToken={pearAccessToken}
          walletAddress={address || null}
          agentWalletAddress={agentWalletAddress}
          onOrderPlaced={fetchPositions}
        />
      </div>

      {/* Open Positions */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-foreground">Open Positions</h2>
          <button 
            onClick={fetchPositions}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>

        {positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b border-border/30">
                  <th className="pb-3 font-medium">Asset</th>
                  <th className="pb-3 font-medium">Size</th>
                  <th className="pb-3 font-medium">Entry</th>
                  <th className="pb-3 font-medium">Mark</th>
                  <th className="pb-3 font-medium">PnL</th>
                  <th className="pb-3 font-medium">Leverage</th>
                  <th className="pb-3 font-medium">Liq. Price</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, idx) => (
                  <tr key={idx} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td className="py-4 font-semibold text-foreground">{pos.asset}</td>
                    <td className="py-4 text-foreground">{pos.size.toFixed(4)}</td>
                    <td className="py-4 text-foreground">${formatPrice(pos.entryPrice)}</td>
                    <td className="py-4 text-foreground">${formatPrice(pos.markPrice)}</td>
                    <td className={cn(
                      "py-4 font-semibold flex items-center gap-1",
                      pos.unrealizedPnl >= 0 ? "text-primary" : "text-destructive"
                    )}>
                      {pos.unrealizedPnl >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      ${Math.abs(pos.unrealizedPnl).toFixed(2)}
                    </td>
                    <td className="py-4 text-foreground">{pos.leverage}x</td>
                    <td className="py-4 text-destructive">${formatPrice(pos.liquidationPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No open positions</p>
            <p className="text-sm text-muted-foreground mt-1">
              {pearAccessToken ? 'Your positions will appear here' : 'Connect to Pear Protocol to start trading'}
            </p>
          </div>
        )}
      </div>

      {/* Market Stats */}
      {currentAssetData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">24h High</p>
            <p className="text-lg font-display font-bold text-foreground">
              ${formatPrice(currentAssetData.high24h)}
            </p>
          </div>
          <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">24h Low</p>
            <p className="text-lg font-display font-bold text-foreground">
              ${formatPrice(currentAssetData.low24h)}
            </p>
          </div>
          <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">24h Volume</p>
            <p className="text-lg font-display font-bold text-foreground">
              {formatVolume(currentAssetData.volume24h)}
            </p>
          </div>
          <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-4">
            <p className="text-muted-foreground text-sm mb-1">Open Interest</p>
            <p className="text-lg font-display font-bold text-foreground">
              {currentAssetData.openInterest ? formatVolume(currentAssetData.openInterest) : 'N/A'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeContent;
