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
} from "../../ui/dialog";
import { toast } from "sonner";

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

  const onClickWallet = useCallback(
    async (wallet: WalletAdapter) => {
      try {
        select(wallet?.name);
        toast.success("Wallet connected successfully.", {
          description: "Your wallet has been connected securely.",
        });
        setShowModal(false);
      } catch (error) {
        console.log(error);
      }
    },
    [select]
  );

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
                    walletAdapter={wallet}
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

const WalletListItem = ({
  walletAdapter,
  handleClick,
}: {
  walletAdapter: WalletAdapter;
  handleClick: () => void;
}) => {
  const adapterName = walletAdapter?.name;

  return (
    <div
      onClick={handleClick}
      className={cn(
        `flex items-center w-full px-5 py-4 space-x-3 transition-all border rounded-lg cursor-pointer bg-[#111111] border-none hover:border hover:border-primary hover:bg-white/10 hover:backdrop-blur-xl hover:shadow-2xl`
      )}
    >
      <img
        src={walletAdapter?.icon}
        className="w-10 h-10 border border-[#d4ff00]/50 rounded-full"
      />
      <div className="text-white">{adapterName}</div>
    </div>
  );
};
export default WalletsConnectModal;
