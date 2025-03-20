import { useMutation, useQuery } from "@tanstack/react-query";
import { fetcher } from ".";
import { JUPITER_API } from "../../utility/constant";

class JupiterSwapper {
  constructor() {}
  getSwapQuote = ({
    inputMint,
    outputMint,
    amount,
    slippageBps,
    restrictIntermediateTokens,
    platformFeeBps,
  }: any) => {
    const {
      data: swapQuote,
      isPending: swapQuoteLoading,
      refetch: swapQuoteRefetch,
    } = useQuery({
      queryKey: [
        "swapQuote",
        inputMint,
        outputMint,
        amount,
        slippageBps,
        restrictIntermediateTokens,
        platformFeeBps,
      ],
      queryFn: async () => {
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
      swapQuoteRefetch,
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

  swap = () => {
    const {
      data: swap,
      isPending: swapLoading,
      mutateAsync: swapMutateAsync,
    } = useMutation({
      mutationFn: async ({
        quoteResponse,
        userPublicKey,
        feeAccount,
      }: {
        quoteResponse: any;
        userPublicKey: string;
        feeAccount: string;
      }) => {
        return await fetcher({
          url: `${JUPITER_API}/swap`,
          isBaseUrl: false,
          method: "POST",
          bodyData: {
            quoteResponse,
            userPublicKey,
            feeAccount,
            wrapAndUnwrapSol: true,
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
