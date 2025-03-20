import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

function SlippageInfo({ slippage }: any) {
  return (
    <div className="flex items-center justify-between px-2 mt-4">
      <div className="text-xs bg-[#222] rounded-full px-3 py-2">
        Slippage: {slippage ? slippage / 1000 : 0}%
      </div>
      <Button
        variant="default"
        size="icon"
        className="text-gray-400 hover:text-white"
      >
        <Settings size={20} />
      </Button>
    </div>
  );
}

export default SlippageInfo;
