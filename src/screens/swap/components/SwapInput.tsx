import SelectTokenModal from "@/components/global/modal/SelectTokenModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Token, TokenBalanceInfo } from "@/types/type";
import {
  handleDecimalCount,
  handleSolanaPriceFormat,
} from "@/utility/formatHandler";
import { ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";

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
  tokenBalances: TokenBalanceInfo[];
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
  tokenBalances,
  handleTokenSearch,
  loading,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const tokenBalance = useMemo(() => {
    if (!token?.address) return null;
    return (
      tokenBalances.find(
        (t) => t.mint.toLowerCase() === token.address.toLowerCase()
      )?.balance || 0
    );
  }, [token?.address, tokenBalances]);

  return (
    <div className="bg-[#111] border border-transparent hover:border-[#d4ff00]/50 transition delay-100 rounded-xl p-4 font-minecraft">
      <div className="mb-2 text-sm text-gray-400">{title}</div>
      <div className="flex items-center justify-between space-x-5 ">
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
            className="flex-1 w-full text-2xl font-medium bg-transparent focus:outline-none"
          />
        )}

        <div className="flex items-center justify-end gap-2">
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
              className="rounded-full border-gray-700  text-black bg-[#d4ff00] hover:bg-[#c2ee00]   flex items-center gap-2"
            >
              <span>Select Token</span>
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 space-x-8">
        <span className="flex-[0.60] text-xs text-gray-400 break-all">
          {loading ? (
            <Skeleton className="min-w-[100px] h-[15px] rounded-full" />
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
          <div className="text-[#d4ff00] items-center space-x-2 flex flex-[0.40] justify-end">
            <span>
              {handleSolanaPriceFormat(Number(tokenBalance), undefined)}{" "}
              {token?.symbol}
            </span>
            {type == "sell" && (
              <span
                onClick={() => {
                  handleAmount(String(tokenBalance));
                }}
                className="text-sm text-gray-400 cursor-pointer hover:text-white"
              >
                Max
              </span>
            )}
          </div>
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
