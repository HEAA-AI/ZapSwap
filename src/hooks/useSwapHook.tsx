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
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
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
  const { connected, signTransaction, publicKey, connection, sendTransaction } =
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
    restrictIntermediateTokens: true,
    taker: publicKey?.toString() as string,
  });

  console.log(
    swapQuote?.data,
    sellAmount,
    sellAmount ? parseUnits(sellAmount, sellCurrency?.decimals).toString() : "",
    "swapQuote?.data?.outAmount"
  );

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

  // async function signAndSendTransaction() {
  //   if (!connected || !signTransaction) {
  //     console.error(
  //       "Wallet is not connected or does not support signing transactions"
  //     );
  //     return;
  //   }

  //   const swapTransaction: any = await swapMutateAsync({
  //     quoteResponse: swapQuote?.data,
  //     feeAccount: ADMIN_FEE_ACCOUNT,
  //     userPublicKey: publicKey?.toString(),
  //   });

  //   console.log(swapQuote);

  //   try {
  //     const transactionBase64 = swapTransaction?.data?.swapTransaction;
  //     const transaction = VersionedTransaction.deserialize(
  //       new Uint8Array(
  //         atob(transactionBase64)
  //           .split("")
  //           .map((char) => char.charCodeAt(0))
  //       )
  //     );

  //     const transferInstruction = SystemProgram.transfer({
  //       fromPubkey: publicKey as PublicKey,
  //       toPubkey: new PublicKey(ADMIN_FEE_ACCOUNT),
  //       lamports: 1000000, ///swapQuote?.data?.platformFee?.amount,
  //     });

  //     const addressLookupTableAccounts = await Promise.all(
  //       transaction.message.addressTableLookups.map(async (lookup) => {
  //         return new AddressLookupTableAccount({
  //           key: lookup.accountKey,
  //           state: AddressLookupTableAccount.deserialize(
  //             await connection
  //               .getAccountInfo(lookup.accountKey)
  //               .then((res) => res.data)
  //           ),
  //         });
  //       })
  //     );
  //     const message = TransactionMessage.decompile(transaction.message, {
  //       addressLookupTableAccounts: addressLookupTableAccounts,
  //     });
  //     message.instructions.push(transferInstruction);
  //     transaction.message = message.compileToV0Message(
  //       addressLookupTableAccounts
  //     );

  //     const signedTransaction = await signTransaction(transaction);

  //     const rawTransaction = signedTransaction.serialize();
  //     const txid = await connection.sendRawTransaction(rawTransaction, {
  //       skipPreflight: true,
  //       maxRetries: 2,
  //     });

  //     const latestBlockHash = await connection.getLatestBlockhash();
  //     await connection.confirmTransaction(
  //       {
  //         blockhash: latestBlockHash.blockhash,
  //         lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  //         signature: txid,
  //       },
  //       "confirmed"
  //     );
  //   } catch (error) {
  //     console.error("Error signing or sending the transaction:", error);
  //   }
  // }

  async function signAndSendTransaction() {
    if (!connected || !signTransaction || !sendTransaction || !publicKey) {
      console.error(
        "Wallet is not connected or does not support signing transactions"
      );
      return;
    }

    // IMPORTANT: This is incorrect - outputTokenMint should be the mint address of the token
    // NOT your wallet address. This is a critical mistake.
    // const outputTokenMint = new PublicKey(ADMIN_FEE_ACCOUNT); // WRONG!

    // Use the actual mint address of the output token (e.g., USDC mint)
    const outputTokenMint = new PublicKey(swapQuote?.data?.outputMint); // USDC mint address as example

    // Your fee wallet address
    const feeWallet = new PublicKey(ADMIN_FEE_ACCOUNT);

    // Derive the ATA for this token and your fee wallet
    const feeATA = await getAssociatedTokenAddress(
      outputTokenMint, // token mint address
      feeWallet // owner wallet
    );

    // Check if the ATA exists
    const ataInfo = await connection.getAccountInfo(feeATA);

    // If ATA doesn't exist, create it first
    if (!ataInfo) {
      console.log("Creating ATA for fee collection...");
      const createAtaIx = createAssociatedTokenAccountInstruction(
        publicKey, // payer
        feeATA, // ata address
        feeWallet, // owner
        outputTokenMint // token mint
      );

      const createAtaTx = new Transaction().add(createAtaIx);
      const createAtaSig = await sendTransaction(createAtaTx, connection);
      console.log("Created ATA:", createAtaSig);

      // Wait for confirmation
      await connection.confirmTransaction(createAtaSig);
    }

    // Now use the fee ATA address in the swap request
    const swapTransaction: any = await swapMutateAsync({
      quoteResponse: swapQuote?.data,
      // Use the derived ATA address, not the wallet address
      feeAccount: feeATA.toString(),
      userPublicKey: publicKey.toString(),
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

      const addressLookupTableAccounts = await Promise.all(
        transaction.message.addressTableLookups.map(async (lookup) => {
          return new AddressLookupTableAccount({
            key: lookup.accountKey,
            state: AddressLookupTableAccount.deserialize(
              await connection
                .getAccountInfo(lookup.accountKey)
                .then((res) => res.data)
            ),
          });
        })
      );

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

      console.log("Transaction confirmed:", txid);
      return txid;
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
    debounceQuoteCall,
  };
}

export default useSwapHook;
