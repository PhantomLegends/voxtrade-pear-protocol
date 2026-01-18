import { useAccount, useConnect, useDisconnect, useSignTypedData, useWalletClient } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';
import { ExchangeClient, HttpTransport } from '@nktkas/hyperliquid';

// Pear Protocol API configuration (proxied via backend function to avoid browser CORS)
const CLIENT_ID = 'HLHackathon1';
const BUILDER_ADDRESS = '0xA47D4d99191db54A4829cdf3de2417E527c3b042';
const MAX_FEE_RATE = '0.1%';

export const useWalletConnection = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signTypedDataAsync } = useSignTypedData();
  const { data: walletClient } = useWalletClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [pearAccessToken, setPearAccessToken] = useState<string | null>(null);
  const [agentWalletAddress, setAgentWalletAddress] = useState<string | null>(null);

  // Authenticate with Pear Protocol using EIP-712 signature
  const authenticateWithPear = useCallback(async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsSigning(true);
    try {
      console.log('Starting Pear Protocol authentication...');
      
      // Step 1: Get EIP-712 message (via backend proxy to avoid CORS)
      console.log('Fetching EIP-712 message from Pear Protocol...');
      const { data: msgData, error: msgError } = await supabase.functions.invoke('pear-garden-proxy', {
        body: {
          action: 'getEip712Message',
          params: { address, clientId: CLIENT_ID },
        },
      });

      if (msgError) {
        console.error('EIP-712 message error:', msgError);
        throw new Error(msgError.message);
      }

      const eipData = msgData?.data;
      if (!eipData) {
        throw new Error('Failed to get EIP-712 message');
      }
      console.log('EIP-712 message received successfully');

      // Prepare domain, types, and message
      const domain = eipData.domain;
      const types = { ...eipData.types };
      const value = eipData.message;

      // Remove EIP712Domain from types if present (wagmi handles this automatically)
      if (types.EIP712Domain) {
        delete types.EIP712Domain;
      }

      // Step 2: Sign the typed data - this triggers the wallet popup
      console.log('Requesting wallet signature... Please check your wallet!');
      toast.info('Please sign the message in your wallet', { duration: 5000 });
      
      const signature = await signTypedDataAsync({
        account: address,
        domain,
        types,
        primaryType: Object.keys(types)[0],
        message: value,
      });
      
      console.log('Signature obtained successfully');

      // Step 3: Login with the signature to get access token (via backend proxy)
      console.log('Logging in to Pear Protocol...');
      const { data: loginProxyData, error: loginProxyError } = await supabase.functions.invoke('pear-garden-proxy', {
        body: {
          action: 'login',
          params: {
            method: 'eip712',
            address,
            clientId: CLIENT_ID,
            details: {
              signature,
              timestamp: value.timestamp,
            },
          },
        },
      });

      if (loginProxyError) {
        console.error('Login error:', loginProxyError);
        throw new Error(loginProxyError.message);
      }

      const loginData = loginProxyData?.data;
      const accessToken = loginData?.accessToken;
      if (!accessToken) {
        console.error('No access token in response:', loginData);
        throw new Error('Failed to authenticate with Pear Protocol');
      }

      console.log('Pear Protocol authentication successful!');
      setPearAccessToken(accessToken);
      toast.success('Successfully authenticated with Pear Protocol!');
      return accessToken;
    } catch (error: any) {
      console.error('Error authenticating with Pear Protocol:', error);
      if (error.message?.includes('rejected') || error.message?.includes('denied')) {
        toast.error('Signature request was rejected');
      } else if (error.message?.includes('timeout')) {
        toast.error('Signing timed out. Please try again.');
      } else {
        toast.error('Failed to authenticate. Check console for details.');
      }
      return null;
    } finally {
      setIsSigning(false);
    }
  }, [address, signTypedDataAsync]);

  // Create and approve agent wallet
  const createAndApproveAgent = useCallback(async (accessToken?: string) => {
    const token = accessToken || pearAccessToken;
    
    if (!token) {
      toast.error('Please authenticate with Pear Protocol first');
      return null;
    }

    if (!walletClient || !address) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsCreatingAgent(true);
    try {
      // Step 1: Create agent wallet (via backend proxy to avoid CORS)
      const { data: agentProxyData, error: agentProxyError } = await supabase.functions.invoke('pear-garden-proxy', {
        body: {
          action: 'createAgentWallet',
          params: { accessToken: token },
        },
      });

      if (agentProxyError) {
        throw new Error(`Agent wallet creation failed: ${agentProxyError.message}`);
      }

      const agentData = agentProxyData?.data;
      const agentAddress = agentData?.agentWalletAddress;
      if (!agentAddress) {
        throw new Error(`Agent wallet creation failed: ${agentData?.message || 'No agent wallet address returned'}`);
      }

      // Store agent address immediately so UI can show "Approve" state even if approvals fail
      setAgentWalletAddress(agentAddress);
      console.log(`Agent Address: ${agentAddress}`);

      // Step 2: Create a custom wallet adapter for Hyperliquid SDK
      const walletAdapter = {
        address: address as `0x${string}`,
        signTypedData: async (params: {
          domain: { name: string; version: string; chainId: number; verifyingContract: `0x${string}` };
          types: { [key: string]: { name: string; type: string }[] };
          primaryType: string;
          message: Record<string, unknown>;
        }) => {
          const typesWithoutDomain = { ...params.types };
          if ('EIP712Domain' in typesWithoutDomain) {
            delete typesWithoutDomain['EIP712Domain'];
          }

          return await walletClient.signTypedData({
            account: address,
            domain: params.domain,
            types: typesWithoutDomain,
            primaryType: params.primaryType,
            message: params.message,
          });
        },
      };

      // Step 3: Approve agent using Hyperliquid ExchangeClient
      const exchangeClient = new ExchangeClient({
        wallet: walletAdapter,
        transport: new HttpTransport(),
      });

      try {
        const agentApprovalResult = await exchangeClient.approveAgent({
          agentAddress: agentAddress as `0x${string}`,
          agentName: 'Voxtrade Agent',
        });

        console.log('Agent approval result:', agentApprovalResult);

        // Step 4: Approve builder fee for trading
        const builderFeeResult = await exchangeClient.approveBuilderFee({
          builder: BUILDER_ADDRESS as `0x${string}`,
          maxFeeRate: MAX_FEE_RATE,
        });

        console.log('Builder fee approval result:', builderFeeResult);

        toast.success('Agent wallet created and fully approved for trading!');
        return { agentAddress, agentApprovalResult, builderFeeResult };
      } catch (approvalError: any) {
        const msg = approvalError?.message || String(approvalError);

        // Common: user has not deposited collateral on Hyperliquid
        if (msg.toLowerCase().includes('must deposit')) {
          toast.error('Deposit USDC on Hyperliquid before approving the agent.');
        } else {
          toast.error(`Agent approval failed: ${msg}`);
        }

        // Still return the agent address so user can retry approvals later
        return { agentAddress };
      }
    } catch (error: any) {
      const msg = error?.message || String(error);
      console.error('Error creating/approving agent wallet:', error);
      toast.error(msg);
      return null;
    } finally {
      setIsCreatingAgent(false);
    }
  }, [pearAccessToken, walletClient, address]);

  const saveWalletToDatabase = useCallback(async (walletAddress: string, chainId: number) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to save your wallet');
        return null;
      }

      // Check if wallet already exists
      const { data: existingWallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('address', walletAddress.toLowerCase())
        .eq('chain_id', chainId)
        .maybeSingle();

      if (existingWallet) {
        // Update last active
        await supabase
          .from('wallets')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', existingWallet.id);
        return existingWallet.id;
      }

      // Insert new wallet
      const { data: newWallet, error } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          address: walletAddress.toLowerCase(),
          chain_id: chainId,
          is_primary: true,
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Wallet connected successfully!');
      return newWallet?.id;
    } catch (error) {
      console.error('Error saving wallet:', error);
      toast.error('Failed to save wallet connection');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const walletConnector = connectors.find(c => c.id === 'walletConnect');
    if (walletConnector) {
      connect({ connector: walletConnector });
    } else if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [connect, connectors]);

  const disconnectWallet = useCallback(async () => {
    disconnect();
    setPearAccessToken(null);
    setAgentWalletAddress(null);
    toast.success('Wallet disconnected');
  }, [disconnect]);

  return {
    address,
    isConnected,
    chain,
    isPending,
    isSaving,
    isSigning,
    isCreatingAgent,
    pearAccessToken,
    agentWalletAddress,
    connectors,
    connectWallet,
    disconnectWallet,
    saveWalletToDatabase,
    authenticateWithPear,
    createAndApproveAgent,
  };
};
