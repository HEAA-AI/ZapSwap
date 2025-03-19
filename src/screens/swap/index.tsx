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
import { Token } from "@/types/type";

export default function SwapPage() {
  const { setShowModal, connected } = useSolanaWallet(); // Wallet connection state
  const [sellAmount, setSellAmount] = useState<string>("0"); // Amount to sell
  const [buyAmount, setBuyAmount] = useState<string>("0"); // Amount to receive
  const [tokenSearch, setTokenSearch] = useState<string>(""); // Token search input
  const [sellCurrency, setSellCurrency] = useState<Token | null>(null); // Selected token to sell
  const [buyCurrency, setBuyCurrency] = useState<Token | null>(null); // Selected token to buy

  // Fetch available tokens
  const { tokens }: { tokens: any } = JUPITER_SWAPPER.getTokenList({});

  // Fetch price of selected pair
  const { pairPrice }: { pairPrice: any } = JUPITER_SWAPPER.getPairPrice({
    listAddress: `${sellCurrency?.address},${buyCurrency?.address}`,
  });

  // Compute token prices in USD
  const tokensPriceUsd = useMemo(() => {
    return {
      sellAmount:
        pairPrice?.data?.prices?.[sellCurrency?.address as string] ?? 0,
      buyAmount: pairPrice?.data?.prices?.[buyCurrency?.address as string] ?? 0,
    };
  }, [pairPrice, sellCurrency, buyCurrency]);

  // Fetch order info for swap
  const { order }: { order: any } = JUPITER_SWAPPER.getOrderInfo({
    inputMint: sellCurrency?.address,
    amount: parseUnits(
      sellAmount ? sellAmount : "0",
      sellCurrency?.decimals
    ).toString(),
    outputMint: buyCurrency?.address,
  });

  // Update buy amount when order info changes
  useEffect(() => {
    if (order?.data?.outAmount) {
      setBuyAmount(
        formatUnits(order?.data?.outAmount, buyCurrency?.decimals).toString()
      );
    }
  }, [order, buyCurrency]);

  // Generate filtered token list based on search input and selected tokens
  const tokensList = useMemo(() => {
    if (!tokens?.data?.tokens) return [];

    // Map tokens into desired format
    const allTokens: Token[] = tokens.data.tokens.map((token: any) => ({
      address: token?.address,
      decimals: token?.decimals,
      name: token?.name,
      img: token?.icon,
      symbol: token?.symbol,
      tags: token?.tags,
    }));

    // Filter out selected sell and buy tokens
    if (!tokenSearch) {
      return allTokens.filter(
        (token) =>
          token.address !== sellCurrency?.address &&
          token.address !== buyCurrency?.address
      );
    }

    return allTokens
      .filter(
        (token: Token) =>
          token.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
          token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
          token.address.toLowerCase().includes(tokenSearch.toLowerCase())
      )
      .filter(
        (token: Token) =>
          token.address !== sellCurrency?.address &&
          token.address !== buyCurrency?.address
      );
  }, [tokens, tokenSearch, sellCurrency, buyCurrency]);

  // Determine button text based on wallet and selection status
  const buttonText = useMemo(() => {
    if (!connected) return "Connect Wallet";
    if (!sellCurrency || !buyCurrency) return "Select Token";
    return "Swap Token";
  }, [sellCurrency, buyCurrency, connected]);

  //
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
