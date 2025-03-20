import { Button } from "@/components/ui/button";
import { JUPITER_SWAPPER } from "../services/api/jupiter";

function SwapPageasdas() {
  const { swapMutateAsync } = JUPITER_SWAPPER.swap();

  return (
    <div>
      <h1 className="text-xl text-center text-black">SwapPage</h1>
      <Button>sndfnsdm</Button>
      <div>
        {/* <button
          onClick={async () => {
            const response = await swapQuoteMutateAsync({
              inputMint: "So11111111111111111111111111111111111111112",
              outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              amount: "100000000",
              slippageBps: "50",
              restrictIntermediateTokens: "true",
              platformFeeBps: 20,
            });
            console.log(response?.data);
          }}
          className="p-2 text-white bg-black rounded-md hover:bg-slate-400"
        >
          getSwapQuote With Fee 0.2%
        </button> */}
        <button
          onClick={async () => {
            const response = await swapMutateAsync({
              quoteResponse: swapQuote?.data,
              userPublicKey: "GvPcXnYXpd1TQGxcyTPAPTtvJbkopyjeEeJg1AAx4Txh",
              feeAccount: "feeAccount",
            });
            console.log(response?.data);
          }}
          className="p-2 text-white bg-black rounded-md hover:bg-slate-400"
        >
          SWAP and fee will be admin waller
        </button>
      </div>
    </div>
  );
}

export default SwapPage;
