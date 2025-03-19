import { WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { useCallback, useMemo, ReactNode } from "react";
import SolanaWalletProvider from "./WalletProvider";

interface SolanaProviderProps {
  children: ReactNode;
}

function SolanaProvider({ children }: SolanaProviderProps) {
  // Define the Solana RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);

  // Initialize the wallet adapter
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter({
        network: WalletAdapterNetwork.Mainnet,
      }),
    ],
    []
  );

  // Handle wallet connection errors
  const onError = useCallback((error: WalletError) => {
    console.error("Wallet Connection Error:", error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>
          <SolanaWalletProvider>{children}</SolanaWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default SolanaProvider;
