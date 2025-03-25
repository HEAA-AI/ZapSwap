import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import HeroText from "./components/HeroText";
import SwapInput from "./components/SwapInput";
import ArrowDivider from "./components/ArrowDivider";
import SlippageInfo from "./components/SlippageInfo";

import { useSolanaWallet } from "@/provider/WalletProvider";

import SwapButton from "./components/SwapButton";
import BgAnimation from "./components/BgAnimation";
import useSwapHook from "@/hooks/useSwapHook";
import {
  setBuyAmount,
  setBuyCurrency,
  setSellAmount,
  setSellCurrency,
} from "@/store/reducers/globalSlice";
import { useAppDispatch } from "@/store/hooks";
export default function SwapPage() {
  const { setShowModal, connected } = useSolanaWallet(); // Wallet connection
  const dispatch = useAppDispatch();
  const {
    sellAmount,
    sellCurrency,
    tokensList,
    tokensPriceUsd,
    tokenSearch,
    setTokenSearch,
    buyCurrency,
    swapQuote,
    buyAmount,
    signAndSendTransaction,
    tokenBalances,
    pairPriceLoading,
    swapLoading,
    isSubmitting,
  } = useSwapHook();
  return (
    <div className="relative flex flex-col min-h-screen text-white bg-black">
      <Header />

      <main className="container z-10 flex flex-col items-center justify-center flex-1 px-4 py-12 mx-auto">
        <HeroText />
        {/* Swap Interface */}
        <div className="w-full max-w-md">
          <SwapInput
            title="Sell"
            type="sell"
            amount={sellAmount}
            handleAmount={(value) => {
              dispatch(setSellAmount(value));
            }}
            token={sellCurrency}
            tokens={tokensList}
            handleToken={(value) => {
              dispatch(setSellCurrency(value));
            }}
            usdPrice={tokensPriceUsd?.sellAmount}
            tokenSearch={tokenSearch}
            tokenBalances={tokenBalances}
            handleTokenSearch={setTokenSearch}
          />
          <ArrowDivider
            sellCurrency={sellCurrency}
            buyCurrency={buyCurrency}
            sellAmount={sellAmount}
            buyAmount={buyAmount}
            disabled={swapLoading || isSubmitting}
          />
          <SwapInput
            title="Buy"
            type="buy"
            amount={buyAmount}
            token={buyCurrency}
            handleAmount={(value) => {
              dispatch(setBuyAmount(value));
            }}
            tokens={tokensList}
            handleToken={(value) => {
              dispatch(setBuyCurrency(value));
            }}
            tokenBalances={tokenBalances}
            usdPrice={tokensPriceUsd?.buyAmount}
            tokenSearch={tokenSearch}
            handleTokenSearch={setTokenSearch}
            loading={pairPriceLoading}
          />

          <SlippageInfo
            // swapQuoteUpdate={swapQuoteUpdate}
            slippage={swapQuote?.data?.slippageBps}
          />

          <SwapButton
            sellCurrency={sellCurrency}
            buyCurrency={buyCurrency}
            sellAmount={sellAmount}
            tokenBalances={tokenBalances}
            connected={connected}
            loading={swapLoading || isSubmitting}
            disabled={swapLoading || isSubmitting}
            onClick={() => {
              if (!connected) {
                setShowModal(true);
              } else {
                signAndSendTransaction();
              }
            }}
          />
        </div>
      </main>
      <BgAnimation />
      <Footer />
    </div>
  );
}
