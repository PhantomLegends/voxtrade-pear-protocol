import { createConfig, http } from 'wagmi';
import { mainnet, arbitrum, optimism, polygon, base } from 'wagmi/chains';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

// WalletConnect Project ID
const WALLETCONNECT_PROJECT_ID = '466abbd9c16d66de36a4f065a5b33145';

// Configure chains
export const chains = [mainnet, arbitrum, optimism, polygon, base] as const;

// Create wagmi config with proper wallet connectors
export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: 'Voxtrade',
        description: 'Voxtrade - Web3 Trading Platform',
        url: 'https://voxtrade.app',
        icons: ['https://voxtrade.app/favicon.ico'],
      },
      showQrModal: true,
    }),
    coinbaseWallet({
      appName: 'Voxtrade',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
  },
});
