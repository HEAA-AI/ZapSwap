import { createContext, useContext, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";

import WalletsConnectModal from "@/components/global/WalletsConnectModal";
const SolanaWalletContext = createContext<any>(null);
function SolanaWalletProvider({ children }: any) {
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
  return useContext(SolanaWalletContext);
}

export default SolanaWalletProvider;
