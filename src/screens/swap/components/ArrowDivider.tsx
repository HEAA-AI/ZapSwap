import {
  setBuyAmount,
  setBuyCurrency,
  setSellAmount,
  setSellCurrency,
} from "@/store/reducers/globalSlice";
import { Token } from "@/types/type";
import { ArrowDownUp } from "lucide-react";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

type Props = {
  sellAmount: string;
  buyAmount: string;
  sellCurrency: Token | null;
  buyCurrency: Token | null;
  disabled: boolean;
};
function ArrowDivider({
  sellAmount,
  buyAmount,
  sellCurrency,
  buyCurrency,
  disabled,
}: Props) {
  const dispatch = useDispatch();

  const handelSwap = useCallback(() => {
    dispatch(setBuyAmount(sellAmount));
    dispatch(setSellAmount(buyAmount));
    dispatch(setSellCurrency(buyCurrency));
    dispatch(setBuyCurrency(sellCurrency));
  }, [sellAmount, buyAmount, sellCurrency, buyCurrency]);

  return (
    <div className="relative h-2">
      <button
        disabled={disabled}
        onClick={handelSwap}
        className="absolute hover:bg-[#d4ff00] transition ease-in-out active:scale-95  group cursor-pointer border border-transparent left-1/2 top-1 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-[#222] flex items-center justify-center"
      >
        <ArrowDownUp size={20} className="group-hover:text-black" />
      </button>
    </div>
  );
}

export default ArrowDivider;
