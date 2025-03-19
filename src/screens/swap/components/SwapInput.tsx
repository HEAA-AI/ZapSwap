import SelectTokenModal from "@/components/global/SelectTokenModal";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

function SwapInput({
  disabled,
  amount,
  handleAmount,
  token,
  tokens,
  title,
  handleToken,
  usdPrice,
}: any) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="bg-[#111] border border-transparent hover:border-[#d4ff00]/50 transition delay-100 rounded-xl p-4 font-minecraft">
      <div className="mb-2 text-sm text-gray-400">{title}</div>
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="0"
          value={amount}
          disabled={disabled}
          onChange={(e) => handleAmount(e.target.value)}
          className="w-1/2 text-3xl font-medium bg-transparent focus:outline-none"
        />
        <div className="flex items-center gap-2">
          {token ? (
            <Button
              onClick={() => setShowModal(true)}
              variant="outline"
              className="rounded-full border-gray-700 bg-[#222] hover:bg-[#333] hover:text-white flex items-center gap-2"
            >
              <img
                className="flex items-center justify-center w-6 h-6 text-xs bg-blue-500 rounded-full"
                src={token.img}
              />
              <span>{token?.symbol}</span>
              <ChevronDown size={16} />
            </Button>
          ) : (
            <Button
              onClick={() => setShowModal(true)}
              variant="outline"
              className="rounded-full border-gray-700  text-black bg-[#d4ff00] hover:bg-[#c2ee00]  flex items-center gap-2"
            >
              <span>Select Token</span>
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-gray-400">
          ${Number(amount * usdPrice).toLocaleString()}
        </span>
        {token && (
          <span className="text-[#d4ff00]">
            0 {token?.symbol} <span className="text-sm text-gray-400">Max</span>
          </span>
        )}
      </div>
      <SelectTokenModal
        tokens={tokens}
        showModal={showModal}
        setShowModal={setShowModal}
        handleToken={handleToken}
      />
    </div>
  );
}

export default SwapInput;
