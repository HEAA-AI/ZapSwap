import { ArrowDown } from "lucide-react";

function ArrowDivider() {
  return (
    <div className="relative h-2">
      <div className="absolute left-1/2 top-1 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-[#222] flex items-center justify-center">
        <ArrowDown size={20} />
      </div>
    </div>
  );
}

export default ArrowDivider;
