import { IMAGES } from "@/assets/images";
import { Button } from "../ui/button";
import { useSolanaWallet } from "@/provider/WalletProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import MyTokenListModal from "./MyTokenListModal";
import { useMemo, useState } from "react";
import useNetworkWallet from "@/hooks/useNetworkWallet";
import { SOLANA_ADDRESS } from "@/utility/constant";

function Header() {
  const { setShowModal } = useSolanaWallet();
  const [showMyTokensModal, setShowMyTokensModal] = useState(false);
  const { tokenBalances } = useNetworkWallet();
  const { publicKey, connected, disconnect, connecting, disconnecting } =
    useWallet();

  const solanaBalance = useMemo(
    () =>
      tokenBalances?.find(
        (token) => token.mint.toLowerCase() === SOLANA_ADDRESS.toLowerCase()
      ),
    [tokenBalances]
  );
  return (
    <header className="container z-10 flex items-center justify-between px-4 py-4 mx-auto font-minecraft">
      <div className="flex items-center gap-2 ">
        <div className="relative w-8 h-8 ">
          <img
            src={IMAGES.LOGO}
            alt="ZapSwap Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <span className="text-xl font-bold ">ZapSwap</span>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={() => setShowMyTokensModal(true)}
          variant="outline"
          className="rounded-full px-2 border-gray-700 bg-[#111111] hover:bg-[#272727] hover:text-white flex items-center gap-2"
        >
          <img
            className="flex items-center justify-center w-6 h-6 text-xs bg-blue-500 rounded-full"
            src={
              "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
            }
          />
          <span>{`${solanaBalance?.balance?.toLocaleString()} ${
            solanaBalance?.symbol
          }`}</span>
        </Button>
        <Button
          onClick={() => {
            if (connected) {
              disconnect();
            } else {
              setShowModal(true);
            }
          }}
          disabled={connecting || disconnecting}
          className="bg-[#d4ff00] font-minecraft hover:bg-[#c2ee00] text-black font-bold rounded-full px-6"
        >
          {connecting
            ? "Connecting..."
            : connected
            ? `${publicKey?.toString()?.slice(0, 4)}...${publicKey
                ?.toString()
                ?.slice(-6)}`
            : "Connect Wallet"}
        </Button>
        <MyTokenListModal
          tokenBalances={tokenBalances}
          showModal={showMyTokensModal}
          setShowModal={setShowMyTokensModal}
        />
      </div>
    </header>
  );
}

export default Header;
