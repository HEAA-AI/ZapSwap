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
import { Toaster } from "@/components/ui/sonner";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Loader,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

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
    toast.error("Wallet Connection Error:", {
      description: error?.message,
    });
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>
          <SolanaWalletProvider endpoint={endpoint}>
            {children}
            <Toaster
              theme="dark"
              toastOptions={{
                classNames: {
                  toast:
                    "group toast group-[.toaster]:bg-[#111] group-[.toaster]:text-white group-[.toaster]:border-[#27272a] group-[.toaster]:shadow-lg",
                  description: "group-[.toast]:text-muted-foreground",
                  actionButton:
                    "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                  cancelButton:
                    "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                },
              }}
              icons={{
                success: <CheckCircle className="w-4 h-4 text-green-500" />,
                info: <Info className="w-4 h-4 text-blue-500" />,
                warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
                error: <XCircle className="w-4 h-4 text-red-500" />,
                loading: (
                  <Loader className="w-4 h-4 text-gray-500 animate-spin" />
                ),
              }}
            />
          </SolanaWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default SolanaProvider;
