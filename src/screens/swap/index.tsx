import { useEffect, useMemo, useState } from "react";

import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import HeroText from "./components/HeroText";
import SwapInput from "./components/SwapInput";
import ArrowDivider from "./components/ArrowDivider";
import SlippageInfo from "./components/SlippageInfo";
import { IMAGES } from "@/assets/images";
import { useSolanaWallet } from "@/provider/WalletProvider";

import { JUPITER_SWAPPER } from "@/services/api/jupiter";
import { formatUnits, parseUnits } from "ethers";
import { Token } from "@/types/type";
import useNetworkWallet from "@/hooks/useNetworkWallet";
import SwapButton from "./components/SwapButton";
import { ADMIN_FEE_ACCOUNT, SWAP_PLATFORM_FEE } from "@/utility/constant";
import { VersionedTransaction } from "@solana/web3.js";

export default function SwapPage() {
  const [sellAmount, setSellAmount] = useState<string>(""); // Amount to sell
  const [buyAmount, setBuyAmount] = useState<string>(""); // Amount to receive
  const [tokenSearch, setTokenSearch] = useState<string>(""); // Token search input
  const [sellCurrency, setSellCurrency] = useState<Token | null>(null); // Selected token to sell
  const [buyCurrency, setBuyCurrency] = useState<Token | null>(null); // Selected token to buy

  const { setShowModal, connected, signTransaction, publicKey, connection } =
    useSolanaWallet(); // Wallet connection
  const { swapMutateAsync } = JUPITER_SWAPPER.swap();
  const { tokenBalances } = useNetworkWallet();
  // Fetch available tokens
  const { tokens }: { tokens: any } = JUPITER_SWAPPER.getTokenList({
    query: tokenSearch,
  });

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
  const { swapQuote }: { swapQuote: any } = JUPITER_SWAPPER.getSwapQuote({
    inputMint: sellCurrency?.address,
    amount: sellAmount
      ? parseUnits(sellAmount, sellCurrency?.decimals).toString()
      : "",
    outputMint: buyCurrency?.address,
    platformFee: SWAP_PLATFORM_FEE,
  });

  console.log(swapQuote);

  // Update buy amount when order info changes
  useEffect(() => {
    if (swapQuote?.data?.outAmount) {
      setBuyAmount(
        formatUnits(
          swapQuote?.data?.outAmount,
          buyCurrency?.decimals
        ).toString()
      );
    }
  }, [swapQuote, buyCurrency]);

  // Generate filtered token list based on search input and selected tokens
  const tokensList = useMemo(() => {
    if (!tokens?.data?.tokens) return [];

    // Map tokens into desired format and add balance from tokenBalances if available
    const allTokens: Token[] = tokens.data.tokens.map((token: any) => {
      const foundToken = tokenBalances.find((t) => t.mint === token.address);
      return {
        address: token?.address,
        decimals: token?.decimals,
        name: token?.name,
        img: token?.icon,
        symbol: token?.symbol,
        tags: token?.tags,
        balance: foundToken ? foundToken.balance : 0, // Set balance if found, otherwise 0
      };
    });

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
  }, [tokens, tokenBalances, tokenSearch, sellCurrency, buyCurrency]);

  async function signAndSendTransaction() {
    if (!connected || !signTransaction) {
      console.error(
        "Wallet is not connected or does not support signing transactions"
      );
      return;
    }
    console.log(swapQuote?.data);
    const swapTransaction = await swapMutateAsync({
      quoteResponse: swapQuote?.data,
      feeAccount: ADMIN_FEE_ACCOUNT,
      userPublicKey: publicKey?.toString() as string,
    });

    try {
      const transactionBase64 = swapTransaction?.data?.swapTransaction;
      const transaction = VersionedTransaction.deserialize(
        new Uint8Array(
          atob(transactionBase64)
            .split("")
            .map((char) => char.charCodeAt(0))
        )
      );

      console.log(transaction, transactionBase64);

      const signedTransaction = await signTransaction(transaction);

      const rawTransaction = signedTransaction.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
      });

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: txid,
        },
        "confirmed"
      );

      // console.log(`https://solscan.io/tx/${txid}`);
    } catch (error) {
      console.error("Error signing or sending the transaction:", error);
    }
  }

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
