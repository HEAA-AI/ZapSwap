import { useMutation, useQuery } from "@tanstack/react-query";
import { fetcher } from ".";
import { JUPITER_API } from "../../utility/constant";

class JupiterSwapper {
  constructor() {}
  getSwapQuote = () => {
    const {
      data: swapQuote,
      isPending: swapQuoteLoading,
      mutateAsync: swapQuoteMutateAsync,
    } = useMutation({
      mutationFn: async ({
        inputMint,
        outputMint,
        amount,
        slippageBps,
        restrictIntermediateTokens,
        platformFeeBps,
      }: any) => {
        return await fetcher({
          url: `${JUPITER_API}/quote`,
          isBaseUrl: false,
          method: "GET",
          params: {
            inputMint,
            outputMint,
            amount,
            slippageBps,
            restrictIntermediateTokens,
            platformFeeBps,
          },
        });
      },
    });
    return {
      swapQuote,
      swapQuoteLoading,
      swapQuoteMutateAsync,
    };
  };

  getTokenList = ({ query = "" }: any) => {
    const {
      data: tokens,
      isPending: tokensLoading,
      refetch: tokensRefetch,
    } = useQuery({
      queryKey: ["tokens", query],
      queryFn: async () => {
        return await fetcher({
          url: `https://fe-api.jup.ag/api/v1/tokens/search`,
          isBaseUrl: false,
          method: "GET",
          params: {
            query,
          },
        });
      },
    });
    return {
      tokens,
      tokensLoading,
      tokensRefetch,
    };
  };

  getPairPrice = ({ listAddress = "" }: any) => {
    const {
      data: pairPrice,
      isPending: pairPriceLoading,
      refetch: pairPriceRefetch,
    } = useQuery({
      queryKey: ["pairPrice", listAddress],
      queryFn: async () => {
        return await fetcher({
          url: `https://fe-api.jup.ag/api/v1/prices`,
          isBaseUrl: false,
          method: "GET",
          params: {
            list_address: listAddress,
          },
        });
      },
    });
    return {
      pairPrice,
      pairPriceLoading,
      pairPriceRefetch,
    };
  };

  getOrderInfo = ({ inputMint, amount, outputMint }: any) => {
    const {
      data: order,
      isPending: orderLoading,
      refetch: orderRefetch,
    } = useQuery({
      queryKey: ["getOrderInfo", inputMint, amount, outputMint],
      queryFn: async () => {
        return await fetcher({
          url: `https://ultra-api.jup.ag/order`,
          isBaseUrl: false,
          method: "GET",
          params: {
            inputMint,
            amount,
            outputMint,
          },
        });
      },
    });
    return {
      order,
      orderLoading,
      orderRefetch,
    };
  };

  swap = () => {
    const {
      data: swap,
      isPending: swapLoading,
      mutateAsync: swapMutateAsync,
    } = useMutation({
      mutationFn: async ({ quoteResponse, userPublicKey, feeAccount }: any) => {
        return await fetcher({
          url: `${JUPITER_API}/swap`,
          isBaseUrl: false,
          method: "POST",
          bodyData: {
            quoteResponse,
            userPublicKey,
            feeAccount,

            // ADDITIONAL PARAMETERS TO OPTIMIZE FOR TRANSACTION LANDING
            // See next guide to optimize for transaction landing
            dynamicComputeUnitLimit: true,
            dynamicSlippage: true,
            prioritizationFeeLamports: {
              priorityLevelWithMaxLamports: {
                maxLamports: 1000000,
                priorityLevel: "veryHigh",
              },
            },
          },
        });
      },
    });
    return {
      swap,
      swapLoading,
      swapMutateAsync,
    };
  };
}
export const JUPITER_SWAPPER = new JupiterSwapper();
