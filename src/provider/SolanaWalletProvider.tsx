import { WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { useCallback, useMemo, ReactNode } from "react";
import SolanaWalletProvider from "./WalletProvider";
import { SOLANA_RPC_URL } from "@/utility/constant";

interface SolanaProviderProps {
  children: ReactNode;
}

function SolanaProvider({ children }: SolanaProviderProps) {
  // Define the Solana RPC endpoint
  const endpoint = useMemo(() => SOLANA_RPC_URL, []);

  // Initialize the wallet adapter
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter({
        // network: WalletAdapterNetwork.Mainnet,
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
          <SolanaWalletProvider endpoint={endpoint}>
            {children}
          </SolanaWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default SolanaProvider;
