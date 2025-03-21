import { useSolanaWallet } from "@/provider/WalletProvider";
import { JUPITER_SWAPPER } from "@/services/api/jupiter";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Token } from "@/types/type";
import { ADMIN_FEE_ACCOUNT, SWAP_PLATFORM_FEE } from "@/utility/constant";
import { formatUnits, parseUnits } from "ethers";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import useNetworkWallet from "./useNetworkWallet";
import {
  AddressLookupTableAccount,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { ToastAction } from "@/components/ui/toast";

function useSwapHook() {
  const [sellAmount, setSellAmount] = useState<string>(""); // Amount to sell
  const [buyAmount, setBuyAmount] = useState<string>(""); // Amount to receive
  const [tokenSearch, setTokenSearch] = useState<string>(""); // Token search input
  const [sellCurrency, setSellCurrency] = useState<Token | null>(null); // Selected token to sell
  const [buyCurrency, setBuyCurrency] = useState<Token | null>(null); // Selected token to buy
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { tokenBalances } = useNetworkWallet();
  const { slippageValue, manualSwapEnabled } = useAppSelector(
    (state) => state.global
  );
  const { connected, signTransaction, publicKey, connection, sendTransaction } =
    useSolanaWallet(); // Wallet connection
  const { swapMutateAsync, swapLoading } = JUPITER_SWAPPER.swap();
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
    restrictIntermediateTokens: true,
    taker: publicKey?.toString() as string,
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
    if (!connected || !signTransaction || !sendTransaction || !publicKey) {
      console.error(
        "Wallet is not connected or does not support signing transactions"
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const outputTokenMint = new PublicKey(swapQuote?.data?.outputMint);
      const feeWallet = new PublicKey(ADMIN_FEE_ACCOUNT);
      const feeATA = await getAssociatedTokenAddress(
        outputTokenMint,
        feeWallet
      );
      const ataInfo = await connection.getAccountInfo(feeATA);
      const instructions: TransactionInstruction[] = [];

      // Perform ATA creation FIRST if it does not exist
      if (!ataInfo) {
        console.log("Creating ATA for fee collection...");
        const createAtaIx = createAssociatedTokenAccountInstruction(
          publicKey, // Fee payer (user)
          feeATA, // New ATA address
          feeWallet, // Owner of the ATA
          outputTokenMint // Token mint address
        );
        instructions.push(createAtaIx);
      }

      // Now execute the swap transaction
      console.log("Executing swap transaction...");
      const swapTransaction: any = await swapMutateAsync({
        quoteResponse: swapQuote?.data,
        feeAccount: feeATA.toString(), // Use the created ATA
        userPublicKey: publicKey.toString(),
      });

      // Deserialize Jupiter swap transaction
      const swapTransactionBuf = new Uint8Array(
        atob(swapTransaction?.data?.swapTransaction)
          .split("")
          .map((char) => char.charCodeAt(0))
      );

      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Fetch Address Lookup Table accounts
      const addressLookupTableAccounts = await Promise.all(
        transaction.message.addressTableLookups.map(async (lookup) => {
          return new AddressLookupTableAccount({
            key: lookup.accountKey,
            state: AddressLookupTableAccount.deserialize(
              await connection
                .getAccountInfo(lookup.accountKey)
                .then((res: any) => res.data)
            ),
          });
        })
      );

      // Decompile the Jupiter transaction
      const message = TransactionMessage.decompile(transaction.message, {
        addressLookupTableAccounts: addressLookupTableAccounts,
      });

      // Add the ATA creation instruction FIRST (if needed)
      instructions.forEach((ix) => message.instructions.unshift(ix));

      // Compile everything into a single Versioned Transaction
      transaction.message = message.compileToV0Message(
        addressLookupTableAccounts
      );

      // Sign and send the combined transaction
      const signedTransaction = await signTransaction(transaction);
      const txid = await sendTransaction(signedTransaction, connection, {
        skipPreflight: true,
        preflightCommitment: "confirmed",
      });

      toast.success("Transaction:", {
        description: `Swap Transaction Successful: https://solscan.io/tx/${txid}`,

        action: (
          <ToastAction
            className="hover:bg-[#111] border-white/10"
            altText="Go to Solscan"
            onClick={() => {
              window.open(`https://solscan.io/tx/${txid}`, "_blank");
            }}
          >
            Go to Solscan
          </ToastAction>
        ),
      });
      return txid;
    } catch (error: any) {
      toast.error("Error signing or sending the transaction:", {
        description: error?.message,
      });
    } finally {
      setIsSubmitting(false);
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
    swapLoading,
    isSubmitting,
    debounceQuoteCall,
  };
}

export default useSwapHook;
