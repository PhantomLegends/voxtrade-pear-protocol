import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoClient, HttpTransport } from '@nktkas/hyperliquid';

interface TradingPanelProps {
  selectedAsset: string;
  currentPrice: number;
  pearAccessToken: string | null;
  walletAddress: string | null;
  agentWalletAddress: string | null;
  onOrderPlaced?: () => void;
}

const TradingPanel = ({ 
  selectedAsset, 
  currentPrice, 
  pearAccessToken,
  walletAddress,
  agentWalletAddress,
  onOrderPlaced 
}: TradingPanelProps) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState([1]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [lastOrderResult, setLastOrderResult] = useState<{ success: boolean; orderId?: string } | null>(null);

  const estimatedTotal = useMemo(
    () => parseFloat(amount || '0') * (orderType === 'limit' ? parseFloat(limitPrice || '0') : currentPrice),
    [amount, orderType, limitPrice, currentPrice]
  );

  const handlePlaceOrder = async () => {
    if (!pearAccessToken) {
      toast.error('Please authenticate with Pear Protocol first');
      return;
    }

    if (!walletAddress) {
      toast.error('Wallet not connected');
      return;
    }

    if (!agentWalletAddress) {
      toast.error('Agent wallet not approved yet. Click Connect above.');
      return;
    }

    // Check exchange funding (Hyperliquid spot balances) before sending the order.
    try {
      const info = new InfoClient({ transport: new HttpTransport() });
      const spot = await info.spotClearinghouseState({ user: walletAddress as `0x${string}` });
      const usdc = spot.balances.find(
        (b) => b.coin.toUpperCase() === 'USDC' || b.coin.toUpperCase() === 'USDC.E'
      );
      const usdcTotal = usdc ? Number(usdc.total) : 0;
      if (!Number.isFinite(usdcTotal) || usdcTotal <= 0) {
        toast.error('No USDC deposited on Hyperliquid. Deposit USDC to enable trading.');
        return;
      }
    } catch (e) {
      // If this check fails for any reason, we still allow the order attempt.
      console.warn('Could not verify Hyperliquid balance:', e);
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Pear Protocol has a minimum order size of 0.1
    if (parseFloat(amount) < 0.1) {
      toast.error('Minimum order size is 0.1');
      return;
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error('Please enter a valid limit price');
      return;
    }

    setIsPlacingOrder(true);
    setLastOrderResult(null);

    try {
      console.log(`Placing ${side} order for ${amount} ${selectedAsset}...`);
      
      // Call the pear-garden-proxy to place the order
      const { data, error } = await supabase.functions.invoke('pear-garden-proxy', {
        body: {
          action: 'placeSpotOrder',
          params: {
            accessToken: pearAccessToken,
            asset: selectedAsset,
            isBuy: side === 'buy',
            amount: parseFloat(amount),
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('Order response:', data);

      if (data?.data?.orderId) {
        setLastOrderResult({ success: true, orderId: data.data.orderId });
        toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order placed successfully!`);
        setAmount('');
        setLimitPrice('');
        onOrderPlaced?.();
      } else if (data?.data?.error || data?.data?.response || data?.status >= 400) {
        const errorMsg = data?.data?.message || data?.data?.response || data?.data?.error || 'Order failed';
        throw new Error(errorMsg);
      } else {
        // Treat as success even without orderId (API might return different structure)
        setLastOrderResult({ success: true });
        toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order submitted!`);
        setAmount('');
        onOrderPlaced?.();
      }
    } catch (error: any) {
      console.error('Order error:', error);
      setLastOrderResult({ success: false });
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleQuickAmount = (percentage: number) => {
    // In a real app, this would calculate based on available balance
    const mockBalance = 10000; // Mock USDC balance
    const maxAmount = (mockBalance * percentage) / 100 / currentPrice;
    setAmount(maxAmount.toFixed(6));
  };

  return (
    <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-display font-bold text-foreground">
          Trade {selectedAsset}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Mark Price:</span>
          <span className="font-semibold text-foreground">${currentPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={side === 'buy' ? 'default' : 'outline'}
          onClick={() => setSide('buy')}
          className={cn(
            "flex-1 h-12 text-base font-semibold transition-all",
            side === 'buy' 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "border-border/50 hover:bg-primary/10 hover:border-primary/50"
          )}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Buy / Long
        </Button>
        <Button
          variant={side === 'sell' ? 'default' : 'outline'}
          onClick={() => setSide('sell')}
          className={cn(
            "flex-1 h-12 text-base font-semibold transition-all",
            side === 'sell' 
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
              : "border-border/50 hover:bg-destructive/10 hover:border-destructive/50"
          )}
        >
          <TrendingDown className="w-4 h-4 mr-2" />
          Sell / Short
        </Button>
      </div>

      {/* Order Type Tabs */}
      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as 'market' | 'limit')} className="mb-6">
        <TabsList className="w-full bg-muted/30">
          <TabsTrigger value="market" className="flex-1">Market</TabsTrigger>
          <TabsTrigger value="limit" className="flex-1">Limit</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="mt-4 space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm mb-2 block">
              Amount ({selectedAsset})
            </Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg bg-background/50 border-border/50"
            />
          </div>
        </TabsContent>

        <TabsContent value="limit" className="mt-4 space-y-4">
          <div>
            <Label className="text-muted-foreground text-sm mb-2 block">
              Limit Price (USD)
            </Label>
            <Input
              type="number"
              placeholder={currentPrice.toString()}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="h-12 text-lg bg-background/50 border-border/50"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-sm mb-2 block">
              Amount ({selectedAsset})
            </Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg bg-background/50 border-border/50"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Amount Buttons */}
      <div className="flex gap-2 mb-6">
        {[25, 50, 75, 100].map((pct) => (
          <Button
            key={pct}
            variant="outline"
            size="sm"
            onClick={() => handleQuickAmount(pct)}
            className="flex-1 text-xs bg-muted/20 border-border/30 hover:bg-muted/40"
          >
            {pct}%
          </Button>
        ))}
      </div>

      {/* Leverage Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-muted-foreground text-sm">Leverage</Label>
          <span className="text-foreground font-semibold">{leverage[0]}x</span>
        </div>
        <Slider
          value={leverage}
          onValueChange={setLeverage}
          min={1}
          max={50}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1x</span>
          <span>25x</span>
          <span>50x</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-muted/20 rounded-xl p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Order Type</span>
          <span className="text-foreground capitalize">{orderType}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Size</span>
          <span className="text-foreground">{amount || '0'} {selectedAsset}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Leverage</span>
          <span className="text-foreground">{leverage[0]}x</span>
        </div>
        <div className="flex justify-between text-sm border-t border-border/30 pt-2 mt-2">
          <span className="text-muted-foreground">Est. Total</span>
          <span className="text-foreground font-semibold">
            ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Place Order Button */}
      {!pearAccessToken ? (
        <div className="flex items-center gap-2 p-4 bg-accent/10 border border-accent/30 rounded-xl text-accent">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Connect to Pear Protocol to trade</span>
        </div>
      ) : (
        <Button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || !amount}
          className={cn(
            "w-full h-14 text-lg font-semibold",
            side === 'buy'
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          )}
        >
          {isPlacingOrder ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Placing Order...
            </>
          ) : (
            <>
              {side === 'buy' ? 'Buy' : 'Sell'} {selectedAsset}
            </>
          )}
        </Button>
      )}

      {/* Order Result */}
      {lastOrderResult && (
        <div className={cn(
          "mt-4 p-4 rounded-xl flex items-center gap-3",
          lastOrderResult.success 
            ? "bg-primary/10 border border-primary/30" 
            : "bg-destructive/10 border border-destructive/30"
        )}>
          {lastOrderResult.success ? (
            <>
              <CheckCircle className="w-5 h-5 text-primary" />
              <div>
                <p className="text-foreground font-medium">Order Placed</p>
                {lastOrderResult.orderId && (
                  <p className="text-xs text-muted-foreground">ID: {lastOrderResult.orderId}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-foreground">Order failed. Please try again.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TradingPanel;
