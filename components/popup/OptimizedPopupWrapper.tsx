import { useAppContext } from "@/context/AppContext";
import useClickOutside from "@/hooks/useClickOutside";
import Image from "next/image";
import { useRef } from "react";

const OptimizedPopupWrapper = () => {
  const { showOptimizedPopup, setShowOptimizedPopup, optimizedPopupContent } =
    useAppContext();
  const optimizedPopupRef = useRef<HTMLDivElement>(null);

  useClickOutside([optimizedPopupRef], () => setShowOptimizedPopup(false));
  return (
    <div
      className={`h-screen flex justify-center 
         items-center shadow-medium fixed top-0 w-screen z-50 backdrop-blur-sm transition-all duration-300 ease-in-out ${
           showOptimizedPopup
             ? "bg-black/65 pointer-events-auto"
             : "opacity-0 pointer-events-none"
         }`}
    >
      <div
        className={`bg-snow p-4 border flex flex-col rounded-2xl gap-4 relative border-platinum w-fit max-w-9/10 h-fit max-h-[96vh] transition-transform duration-300 ease-in-out ${
          showOptimizedPopup ? "scale-100" : "scale-95"
        }`}
        ref={optimizedPopupRef}
      >
        <div className={`w-full flex gap-4 items-center ${optimizedPopupContent?.hideHeader && 'hidden'} justify-between`}>
          <h5 className="font-medium text-base text-smokyBlack">
            {optimizedPopupContent?.title}
          </h5>
          <div
            className={`bg-ghostWhite cursor-pointer p-2.5 border border-platinum rounded-2xl`}
            onClick={() => setShowOptimizedPopup(false)}
          >
            <Image
              src="/images/close-black.svg"
              className="w-5 xl:w-auto"
              width={24}
              height={24}
              alt="Close"
            />
          </div>
        </div>
        <div className="w-full h-full overflow-auto scrollbar-none">
          {optimizedPopupContent?.content}
        </div>
      </div>
    </div>
  );
};

export default OptimizedPopupWrapper;
