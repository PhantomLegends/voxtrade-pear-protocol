-- Create enum for transaction types
CREATE TYPE public.transaction_type AS ENUM ('swap', 'deposit', 'withdraw', 'trade');

-- Create enum for transaction status
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Create wallets table to store connected wallet addresses
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  chain_id INTEGER NOT NULL DEFAULT 1,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(address, chain_id)
);

-- Create positions table to track user holdings
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  token_symbol TEXT NOT NULL,
  token_address TEXT NOT NULL,
  amount DECIMAL(38, 18) NOT NULL DEFAULT 0,
  avg_entry_price DECIMAL(38, 18),
  current_value_usd DECIMAL(38, 2),
  pnl_usd DECIMAL(38, 2),
  pnl_percentage DECIMAL(10, 4),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for trade history
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  tx_hash TEXT,
  type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  from_token TEXT,
  from_amount DECIMAL(38, 18),
  to_token TEXT,
  to_amount DECIMAL(38, 18),
  gas_used DECIMAL(38, 18),
  gas_price_gwei DECIMAL(20, 9),
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_data table for caching prices
CREATE TABLE public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_symbol TEXT NOT NULL UNIQUE,
  token_address TEXT,
  price_usd DECIMAL(38, 18) NOT NULL,
  price_change_24h DECIMAL(10, 4),
  volume_24h DECIMAL(38, 2),
  market_cap DECIMAL(38, 2),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- Wallets policies - users can only see/manage their own wallets
CREATE POLICY "Users can view their own wallets" 
ON public.wallets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets" 
ON public.wallets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets" 
ON public.wallets FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallets" 
ON public.wallets FOR DELETE 
USING (auth.uid() = user_id);

-- Positions policies - access via wallet ownership
CREATE POLICY "Users can view positions for their wallets" 
ON public.positions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.wallets 
    WHERE wallets.id = positions.wallet_id 
    AND wallets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert positions for their wallets" 
ON public.positions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wallets 
    WHERE wallets.id = positions.wallet_id 
    AND wallets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update positions for their wallets" 
ON public.positions FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.wallets 
    WHERE wallets.id = positions.wallet_id 
    AND wallets.user_id = auth.uid()
  )
);

-- Transactions policies - access via wallet ownership
CREATE POLICY "Users can view transactions for their wallets" 
ON public.transactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.wallets 
    WHERE wallets.id = transactions.wallet_id 
    AND wallets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert transactions for their wallets" 
ON public.transactions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wallets 
    WHERE wallets.id = transactions.wallet_id 
    AND wallets.user_id = auth.uid()
  )
);

-- Market data is public (read-only for all)
CREATE POLICY "Anyone can view market data" 
ON public.market_data FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_positions_updated_at
BEFORE UPDATE ON public.positions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_data_updated_at
BEFORE UPDATE ON public.market_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();