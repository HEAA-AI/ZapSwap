import SwapSettingModal from "@/components/global/modal/SwapSettingModal";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { Settings } from "lucide-react";
import { useState } from "react";

function SlippageInfo({
  slippage,
}: // swapQuoteUpdate,
{
  slippage: number;
  // swapQuoteUpdate: any;
}) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { manualSwapEnabled, slippageValue } = useAppSelector(
    (state) => state.global
  );

  return (
    <>
      <div className="flex items-center justify-between px-2 mt-4">
        <div className="flex items-center space-x-3">
          <div className="text-xs bg-[#222] rounded-full px-3 py-2">
            Slippage:{" "}
            {slippageValue ? slippageValue : slippage ? slippage / 100 : 0}%
          </div>
          {/* <RefreshCw
            onClick={swapQuoteUpdate}
            className="opacity-50 cursor-pointer hover:opacity-80"
          /> */}
        </div>

        <div className="flex items-center space-x-3">
          {/* <>{manualSwapEnabled ? <BotOff /> : <Bot />}</> */}
          <Button
            onClick={() => setShowModal(true)}
            variant="default"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <Settings size={20} />
          </Button>
        </div>
      </div>
      <SwapSettingModal
        showModal={showModal}
        setShowModal={setShowModal}
        manualSwapEnabled={manualSwapEnabled}
        slippageValue={slippageValue}
      />
    </>
  );
}

export default SlippageInfo;
