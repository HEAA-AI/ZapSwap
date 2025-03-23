import { useMemo } from "react";
import { Button } from "@/components/ui/button"; // Ensure correct import path
import { cn } from "@/lib/utils";
import { Token, TokenBalanceInfo } from "@/types/type";
import { LoaderCircle } from "lucide-react";
// Utility function for conditional classNames

type Props = {
  connected: boolean;
  onClick: () => void;
  sellCurrency: Token | null;
  buyCurrency: Token | null;
  sellAmount: string;
  loading?: boolean;
  disabled?: boolean;
  tokenBalances: TokenBalanceInfo[];
};
const SwapButton = ({
  onClick,
  sellCurrency,
  buyCurrency,
  sellAmount,
  connected,
  tokenBalances,
  loading = false,
  disabled = false,
}: Props) => {
  const { buttonText, extraClass } = useMemo(() => {
    const balance =
      tokenBalances?.find(
        (token) =>
          token.mint.toLowerCase() === sellCurrency?.address?.toLowerCase()
      )?.balance ?? 0;

    if (!connected) {
      return {
        buttonText: "Connect Wallet",
        extraClass: "bg-[#d4ff00] hover:bg-[#c2ee00] text-black",
      };
    }
    if (!sellCurrency || !buyCurrency) {
      return {
        buttonText: "Select Token",
        extraClass:
          "hover:bg-primary text-white bg-[#111] border border-[#d4ff00]/10",
      };
    }

    if (
      sellAmount === undefined ||
      sellAmount === null ||
      sellAmount === "" ||
      !Number(sellAmount)
    ) {
      return {
        buttonText: "Enter Amount",
        extraClass:
          "hover:bg-primary text-white bg-[#111] border border-[#d4ff00]/10",
      };
    }
    if (Number(sellAmount) > balance) {
      return {
        buttonText: "Insufficient Funds",
        extraClass:
          "hover:bg-primary text-white bg-[#111] border border-[#d4ff00]/10",
      };
    }
    return {
      buttonText: "Swap Token",
      extraClass: "bg-[#d4ff00] hover:bg-[#c2ee00] text-black",
    };
  }, [connected, sellCurrency, buyCurrency, sellAmount, tokenBalances]);

  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full font-minecraft font-bold rounded-full py-6 mt-4 transition-all",
        extraClass
      )}
    >
      {loading ? (
        <span className=" animate-spin">
          <LoaderCircle />
        </span>
      ) : (
        buttonText
      )}
    </Button>
  );
};

export default SwapButton;
