import { createContext, useContext, useState, ReactNode } from "react";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import WalletsConnectModal from "@/components/global/WalletsConnectModal";

// Define the shape of the Solana Wallet Context
interface SolanaWalletContextType extends WalletContextState {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}

const SolanaWalletContext = createContext<SolanaWalletContextType | null>(null);

interface SolanaWalletProviderProps {
  children: ReactNode;
}

function SolanaWalletProvider({ children }: SolanaWalletProviderProps) {
  const [showModal, setShowModal] = useState(false);
  const defaultWalletContext = useWallet();

  return (
    <SolanaWalletContext.Provider
      value={{ ...defaultWalletContext, showModal, setShowModal }}
    >
      <WalletsConnectModal />
      {children}
    </SolanaWalletContext.Provider>
  );
}

export function useSolanaWallet() {
  const context = useContext(SolanaWalletContext);
  if (!context) {
    throw new Error(
      "useSolanaWallet must be used within a SolanaWalletProvider"
    );
  }
  return context;
}

export default SolanaWalletProvider;
