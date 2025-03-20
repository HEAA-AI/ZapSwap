import { cn } from "@/lib/utils";
import { useSolanaWallet } from "@/provider/WalletProvider";
import { WalletAdapter, WalletReadyState } from "@solana/wallet-adapter-base";
import { Wallet } from "@solana/wallet-adapter-react";
import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const WalletsConnectModal = () => {
  const { wallets, showModal, setShowModal, select } = useSolanaWallet();

  const filteredAdapters = wallets?.reduce(
    (acc: any, wallet: Wallet) => {
      const adapterName = wallet?.adapter?.name;
      if (wallet.readyState === WalletReadyState.Installed && adapterName) {
        acc.installed.push(wallet?.adapter);
      }
      return acc;
    },
    { installed: [] }
  );

  const onClickWallet = useCallback((wallet: WalletAdapter) => {
    select(wallet?.name);
    setShowModal(false);
  }, []);

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="bg-[#000000] border-2 min-w-[400px]  max-w-[400px]  border-[#272727]  font-minecraft ">
        <DialogHeader className="">
          <DialogTitle className="mb-4 text-white ">
            Connect a wallet
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-2 ">
              {filteredAdapters?.installed?.map(
                (wallet: WalletAdapter, index: number) => (
                  <WalletListItem
                    handleClick={() => onClickWallet(wallet)}
                    wallet={wallet}
                    key={index}
                  />
                )
              )}{" "}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const WalletListItem = ({ wallet, handleClick }: any) => {
  const adapterName = wallet?.name;

  return (
    <div
      onClick={handleClick}
      className={cn(
        `flex items-center w-full px-5 py-4 space-x-3 transition-all border rounded-lg cursor-pointer bg-[#111111] border-none hover:border hover:border-primary hover:bg-white/10 hover:backdrop-blur-xl hover:shadow-2xl`
      )}
    >
      <img src={wallet?.icon} className="w-10 h-10" />
      <div className="text-white">{adapterName}</div>
    </div>
  );
};
export default WalletsConnectModal;
