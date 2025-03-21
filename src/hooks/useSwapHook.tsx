import { useSolanaWallet } from "@/provider/WalletProvider";
import { JUPITER_SWAPPER } from "@/services/api/jupiter";
import { Token } from "@/types/type";
import { ADMIN_FEE_ACCOUNT, SWAP_PLATFORM_FEE } from "@/utility/constant";
import { formatUnits, parseUnits } from "ethers";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import useNetworkWallet from "./useNetworkWallet";
import { VersionedTransaction } from "@solana/web3.js";
import { useAppSelector } from "@/store/hooks";

function useSwapHook() {
  const [sellAmount, setSellAmount] = useState<string>(""); // Amount to sell
  const [buyAmount, setBuyAmount] = useState<string>(""); // Amount to receive
  const [tokenSearch, setTokenSearch] = useState<string>(""); // Token search input
  const [sellCurrency, setSellCurrency] = useState<Token | null>(null); // Selected token to sell
  const [buyCurrency, setBuyCurrency] = useState<Token | null>(null); // Selected token to buy
  const { tokenBalances } = useNetworkWallet();
  const { slippageValue, manualSwapEnabled } = useAppSelector(
    (state) => state.global
  );
  const { connected, signTransaction, publicKey, connection } =
    useSolanaWallet(); // Wallet connection
  const { swapMutateAsync } = JUPITER_SWAPPER.swap();
  const { tokens }: any = JUPITER_SWAPPER.getTokenList({
    query: tokenSearch,
  });

  // Fetch price of selected pair
  const { pairPrice, pairPriceLoading }: any = JUPITER_SWAPPER.getPairPrice({
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
  const { swapQuote, swapQuoteRefetch }: any = JUPITER_SWAPPER.getSwapQuote({
    inputMint: sellCurrency?.address as string,
    amount: sellAmount
      ? parseUnits(sellAmount, sellCurrency?.decimals).toString()
      : "",
    outputMint: buyCurrency?.address as string,
    platformFeeBps: SWAP_PLATFORM_FEE,
    slippageBps: slippageValue ? Number(slippageValue) * 100 : "50",
  });

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

  const debounceQuoteCall = useCallback(_.debounce(swapQuoteRefetch, 500), []);
  useEffect(() => {
    debounceQuoteCall(sellAmount);
  }, [sellAmount, debounceQuoteCall, slippageValue, manualSwapEnabled]);

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
    const swapTransaction: any = await swapMutateAsync({
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
  return {
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
    pairPriceLoading,
  };
}

export default useSwapHook;
