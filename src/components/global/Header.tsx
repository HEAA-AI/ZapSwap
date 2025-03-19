import { IMAGES } from "@/assets/images";
import { Button } from "../ui/button";
import { useSolanaWallet } from "@/provider/WalletProvider";
import { useWallet } from "@solana/wallet-adapter-react";

function Header() {
  const { setShowModal } = useSolanaWallet();
  const { publicKey, connected, disconnect, connecting, disconnecting } =
    useWallet();
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
    </header>
  );
}

export default Header;
