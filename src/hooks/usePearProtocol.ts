import { useState, useCallback } from 'react';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  openInterest?: number;
}

interface PricePoint {
  time: string;
  price: number;
  volume: number;
}

interface Position {
  asset: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnl: number;
  leverage: number;
  liquidationPrice: number;
}

export const usePearProtocol = (address?: string, pearAccessToken?: string | null) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('BTC');

  // Fetch market data - using mock data since Pear Protocol API requires private access
  const fetchMarketData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Note: Pear Protocol API requires contacting them for access URLs
      // Using realistic mock data for demonstration
      setMarketData([
        { symbol: 'BTC', price: 67234.50, change24h: 2.34, volume24h: 28500000000, high24h: 68100, low24h: 65800, openInterest: 15000000000 },
        { symbol: 'ETH', price: 3456.78, change24h: 1.56, volume24h: 12000000000, high24h: 3520, low24h: 3380, openInterest: 8000000000 },
        { symbol: 'SOL', price: 178.90, change24h: -0.89, volume24h: 2500000000, high24h: 184, low24h: 175, openInterest: 1500000000 },
        { symbol: 'ARB', price: 1.24, change24h: 3.21, volume24h: 450000000, high24h: 1.28, low24h: 1.19, openInterest: 250000000 },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate price history for charting
  const fetchPriceHistory = useCallback(async (asset: string, timeframe: string = '1H') => {
    setIsLoading(true);
    try {
      // In production, fetch from Pear Protocol API
      // For now, generate realistic mock data
      const now = Date.now();
      const points = timeframe === '1H' ? 60 : timeframe === '4H' ? 240 : timeframe === '1D' ? 1440 : 60;
      const interval = timeframe === '1H' ? 60000 : timeframe === '4H' ? 60000 : timeframe === '1D' ? 60000 : 60000;
      
      const basePrice = asset === 'BTC' ? 67234 : asset === 'ETH' ? 3456 : asset === 'SOL' ? 178 : 1.24;
      const volatility = asset === 'BTC' ? 0.002 : asset === 'ETH' ? 0.003 : asset === 'SOL' ? 0.005 : 0.008;
      
      let price = basePrice * (1 - volatility * 10);
      const history: PricePoint[] = [];
      
      for (let i = points; i >= 0; i--) {
        const change = (Math.random() - 0.48) * volatility * basePrice;
        price = Math.max(price + change, basePrice * 0.9);
        price = Math.min(price, basePrice * 1.1);
        
        history.push({
          time: new Date(now - i * interval).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: Number(price.toFixed(2)),
          volume: Math.floor(Math.random() * 1000000 + 500000)
        });
      }
      
      setPriceHistory(history);
      setSelectedAsset(asset);
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch positions - using mock data since Pear Protocol API requires private access
  const fetchPositions = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // Note: Pear Protocol API requires contacting them for access URLs
      // Using realistic mock data for demonstration
      if (pearAccessToken) {
        setPositions([
          {
            asset: 'BTC-PERP',
            size: 0.5,
            entryPrice: 66500,
            markPrice: 67234.5,
            unrealizedPnl: 367.25,
            leverage: 5,
            liquidationPrice: 58000,
          },
          {
            asset: 'ETH-PERP',
            size: 2.0,
            entryPrice: 3400,
            markPrice: 3456.78,
            unrealizedPnl: 113.56,
            leverage: 3,
            liquidationPrice: 2800,
          },
        ]);
      } else {
        setPositions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [address, pearAccessToken]);

  return {
    marketData,
    priceHistory,
    positions,
    selectedAsset,
    isLoading,
    fetchMarketData,
    fetchPriceHistory,
    fetchPositions
  };
};
