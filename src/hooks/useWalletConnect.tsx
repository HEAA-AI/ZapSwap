import { useWallet } from "@solana/wallet-adapter-react";

function useWalletConnect() {
  const { publicKey, connected, disconnect, connecting, disconnecting } =
    useWallet();
  return {};
}

export default useWalletConnect;
