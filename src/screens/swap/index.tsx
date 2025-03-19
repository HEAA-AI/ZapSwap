import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import HeroText from "./components/HeroText";
import SwapInput from "./components/SwapInput";
import ArrowDivider from "./components/ArrowDivider";
import SlippageInfo from "./components/SlippageInfo";
import { IMAGES } from "@/assets/images";
import { useSolanaWallet } from "@/provider/WalletProvider";
import { cn } from "@/lib/utils";
import { JUPITER_SWAPPER } from "@/services/api/jupiter";
import { formatUnits, parseUnits } from "ethers";

interface Token {
  address: string;
  decimals: number;
  name: string;
  img: string;
  symbol: string;
  tags?: string[]; // Optional, assuming it's an array of strings
}

export default function SwapPage() {
  const { setShowModal, connected } = useSolanaWallet();
  const [sellAmount, setSellAmount] = useState("0");
  const [buyAmount, setBuyAmount] = useState("0");
  const [tokenSearch, setTokenSearch] = useState("");
  const [sellCurrency, setSellCurrency] = useState<Token | null>(null);
  const [buyCurrency, setBuyCurrency] = useState<Token | null>(null);
  const { tokens }: any = JUPITER_SWAPPER.getTokenList({});
  const { pairPrice }: any = JUPITER_SWAPPER.getPairPrice({
    listAddress: `${sellCurrency?.address},${buyCurrency?.address}`,
  });

  const tokensPriceUsd = useMemo(() => {
    return {
      sellAmount: pairPrice?.data?.prices?.[sellCurrency?.address] ?? 0,
      buyAmount: pairPrice?.data?.prices?.[buyCurrency?.address] ?? 0,
    };
  }, [pairPrice]);

  const { order }: any = JUPITER_SWAPPER.getOrderInfo({
    inputMint: sellCurrency?.address,
    amount: parseUnits(
      sellAmount ? sellAmount : "0",
      sellCurrency?.decimals
    ).toString(),
    outputMint: buyCurrency?.address,
  });

  useEffect(() => {
    if (order?.data?.outAmount) {
      setBuyAmount(
        formatUnits(order?.data?.outAmount, buyCurrency?.decimals).toString()
      );
    }
  }, [order]);

  const tokensList = useMemo(() => {
    if (!tokens?.data?.tokens) {
      return [];
    }

    const allTokens = tokens.data.tokens.map((token: any) => ({
      address: token?.address,
      decimals: token?.decimals,
      name: token?.name,
      img: token?.icon,
      symbol: token?.symbol,
      tags: token?.tags,
    }));

    if (!tokenSearch) {
      return allTokens.filter(
        (token) =>
          token.address !== sellCurrency?.address &&
          token.address !== buyCurrency?.address
      );
    }

    return allTokens
      .filter(
        (token: any) =>
          token.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
          token.symbol.toLowerCase().includes(tokenSearch.toLowerCase())
      )
      .filter(
        (token: any) =>
          token.address !== sellCurrency?.address &&
          token.address !== buyCurrency?.address
      );
  }, [tokens, tokenSearch, sellCurrency, buyCurrency]);

  const buttonText = useMemo(() => {
    if (!connected) {
      return "Connect Wallet";
    }
    if (!sellCurrency || !buyCurrency) {
      return "Select Token";
    }
    return "Swap Token";
  }, [sellCurrency, buyCurrency, connected]);

  // bg-gradient-to-b from-black to-[#1a1a00]
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

          <SlippageInfo slippage={order?.data?.slippageBps} />

          <Button
            onClick={() => {
              if (!connected) {
                setShowModal(true);
              }
            }}
            className={cn(
              "w-full font-minecraft bg-[#d4ff00] hover:bg-[#c2ee00] text-black font-bold rounded-full py-6 mt-4",
              (!sellCurrency || !buyCurrency) &&
                "hover:bg-primary text-white bg-[#111] border border-[#d4ff00]/10 ",
              !connected && "bg-[#d4ff00] hover:bg-[#c2ee00] text-black"
            )}
          >
            {buttonText}
          </Button>
        </div>
      </main>
      <BgAnimation />
      <Footer />
    </div>
  );
}

const BgAnimation = () => {
  return (
    <>
      <div className="fixed top-0 animate-pulse delay-1000 -bottom-[80%]  overflow-hidden    -left-[50%]">
        <img src={IMAGES.BG_CIRCLE} className="h-full max-w-full" />
      </div>
      <div className="fixed animate-pulse -top-[80%] bottom-0  overflow-hidden    -right-[50%]">
        <img src={IMAGES.BG_CIRCLE} className="h-full max-w-full" />
      </div>
    </>
  );
};
