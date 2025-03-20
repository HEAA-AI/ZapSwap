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
export default function SwapPage() {
  const { setShowModal, connected } = useSolanaWallet(); // Wallet connection
  const {
    sellAmount,
    setSellAmount,
    sellCurrency,
    tokensList,
    setSellCurrency,
    tokensPriceUsd,
    tokenSearch,
    setTokenSearch,
    buyCurrency,
    swapQuote,
    setBuyAmount,
    buyAmount,
    setBuyCurrency,
    signAndSendTransaction,
    tokenBalances,
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
            handleAmount={setSellAmount}
            token={sellCurrency}
            tokens={tokensList}
            handleToken={setSellCurrency}
            usdPrice={tokensPriceUsd?.sellAmount}
            tokenSearch={tokenSearch}
            handleTokenSearch={setTokenSearch}
          />
          <ArrowDivider />
          <SwapInput
            title="Buy"
            type="buy"
            amount={buyAmount}
            token={buyCurrency}
            handleAmount={setBuyAmount}
            tokens={tokensList}
            handleToken={setBuyCurrency}
            usdPrice={tokensPriceUsd?.buyAmount}
            tokenSearch={tokenSearch}
            handleTokenSearch={setTokenSearch}
          />

          <SlippageInfo slippage={swapQuote?.data?.slippageBps} />

          <SwapButton
            sellCurrency={sellCurrency}
            buyCurrency={buyCurrency}
            sellAmount={sellAmount}
            tokenBalances={tokenBalances}
            connected={connected}
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
