import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Search } from "lucide-react";
import { Input } from "../ui/input";

const SelectTokenModal = ({
  showModal,
  setShowModal,
  tokens,
  handleToken,
}: any) => {
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="bg-[#111] pb-0  border-2 min-w-[400px] px-5  max-w-[400px]  border-[#646464]  font-minecraft ">
        <DialogHeader className="">
          <DialogTitle className="mb-2 text-white ">Select a token</DialogTitle>
          <DialogDescription>
            <InputSearch />
            <div className="flex pb-5 flex-col max-h-[400px] overflow-y-scroll">
              {tokens?.map((token, index: number) => (
                <TokenListItem
                  handleToken={() => {
                    handleToken(token);
                    setShowModal(false);
                  }}
                  token={token}
                  key={index}
                />
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const TokenListItem = ({ token, handleToken }: any) => {
  return (
    <div
      onClick={handleToken}
      className={cn(
        `flex items-center w-full p-2.5   space-x-3 transition-all border rounded-xl cursor-pointer hover:bg-[#1C1C1C] border-none hover:bg-white/10 hover:backdrop-blur-xl hover:shadow-2xl`
      )}
    >
      <img src={token?.img} className="w-10 h-10 rounded-full" />
      <div>
        <div className="text-white text-md">{token?.name}</div>
        <div className="text-xs text-white/50">{token?.symbol}</div>
      </div>
    </div>
  );
};

const InputSearch = () => {
  return (
    <div className="p-2 px-5 bg-[#1C1C1C] rounded-full mb-2">
      <div className="flex items-center ">
        <Search size={18} />
        <Input
          className="border-none focus-visible:ring-0"
          placeholder="Search tokens"
        />
      </div>
    </div>
  );
};
export default SelectTokenModal;
