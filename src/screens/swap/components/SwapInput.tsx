import SelectTokenModal from "@/components/global/modal/SelectTokenModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Token } from "@/types/type";
import {
  handleDecimalCount,
  handleSolanaPriceFormat,
} from "@/utility/formatHandler";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

type Props = {
  amount: string;
  handleAmount: (value: string) => void;
  title: string;
  type: "buy" | "sell";
  token: Token | null;
  usdPrice: string;
  tokenSearch: string;
  tokens: Token[];
  handleToken: (token: Token) => void;
  handleTokenSearch: (search: string) => void;
  loading?: boolean;
};
function SwapInput({
  amount,
  handleAmount,
  token,
  tokens,
  title,
  type,
  handleToken,
  usdPrice,
  tokenSearch,
  handleTokenSearch,
  loading,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-[#111] border border-transparent hover:border-[#d4ff00]/50 transition delay-100 rounded-xl p-4 font-minecraft">
      <div className="mb-2 text-sm text-gray-400">{title}</div>
      <div className="flex items-center justify-between">
        {loading ? (
          <Skeleton className="w-[100px] h-[20px] rounded-full" />
        ) : (
          <input
            type="text"
            placeholder="0"
            value={amount}
            disabled={type == "buy"}
            onChange={(e) => {
              const value = handleDecimalCount(e.target.value);
              handleAmount(value); // Only update state if input is valid
            }}
            onPaste={(e) => {
              e.preventDefault(); // Prevent default paste behavior
              const pastedValue = e.clipboardData.getData("text");
              const validValue = handleDecimalCount(pastedValue);
              handleAmount(validValue);
            }}
            className="w-1/2 text-3xl font-medium bg-transparent focus:outline-none"
          />
        )}

        <div className="flex items-center gap-2">
          {token ? (
            <Button
              onClick={() => setShowModal(true)}
              variant="outline"
              className="rounded-full px-2 border-gray-700 bg-[#111111] hover:bg-[#272727] hover:text-white flex items-center gap-2"
            >
              <img
                className="flex items-center justify-center w-6 h-6 text-xs bg-blue-500 rounded-full"
                src={token.img}
              />
              <span>{token?.symbol}</span>
              <ChevronDown size={16} />
            </Button>
          ) : (
            <Button
              onClick={() => setShowModal(true)}
              variant="outline"
              className="rounded-full border-gray-700  text-black bg-[#d4ff00] hover:bg-[#c2ee00]  flex items-center gap-2"
            >
              <span>Select Token</span>
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-gray-400">
          {loading ? (
            <Skeleton className="w-[100px] h-[15px] rounded-full" />
          ) : (
            <>
              $
              {handleSolanaPriceFormat(
                Number(Number(amount) * Number(usdPrice))
              )}
            </>
          )}
        </span>
        {token && (
          <span className="text-[#d4ff00]">
            {handleSolanaPriceFormat(token?.balance, undefined)} {token?.symbol}{" "}
            {type == "sell" && (
              <span
                onClick={() => {
                  handleAmount(String(token?.balance));
                }}
                className="text-sm text-gray-400 cursor-pointer hover:text-white"
              >
                Max
              </span>
            )}
          </span>
        )}
      </div>
      <SelectTokenModal
        tokenSearch={tokenSearch}
        handleTokenSearch={handleTokenSearch}
        tokens={tokens}
        showModal={showModal}
        setShowModal={setShowModal}
        handleToken={handleToken}
      />
    </div>
  );
}

export default SwapInput;
