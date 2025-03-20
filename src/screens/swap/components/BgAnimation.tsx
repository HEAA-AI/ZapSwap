import { IMAGES } from "@/assets/images";

const BgAnimation = () => {
  return (
    <>
      <div className="fixed top-0 animate-pulse delay-1000 -bottom-[80%]  overflow-hidden    -left-[50%]">
        <img src={IMAGES.BG_CIRCLE} className="h-full max-w-full" />
      </div>
      <div className="fixed animate-pulse -top-[80%] bottom-0  overflow-hidden    -right-[50%]">
        <img src={IMAGES.BG_CIRCLE} className="h-full max-w-full" />
      </div>
    </>
  );
};

export default BgAnimation;
