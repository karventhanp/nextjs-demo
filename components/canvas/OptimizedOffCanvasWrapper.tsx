import { useAppContext } from "@/context/AppContext";
import { useRef } from "react";
import { IconBox } from "../common/IconBox";
import useClickOutside from "@/hooks/useClickOutside";

const OptimizedOffCanvasWrapper = () => {
  const {
    showOptimizedOffCanvas,
    setShowOptimizedOffCanvas,
    optimizedOffCanvasContent,
  } = useAppContext();
  const optimizedOffCanvasRef = useRef<HTMLDivElement>(null);

  useClickOutside([optimizedOffCanvasRef], () =>
    setShowOptimizedOffCanvas(false)
  );
  return (
    <div
      className={`h-screen fixed top-0 w-screen z-50 flex justify-end backdrop-blur-sm transition-all duration-300 ease-in-out ${
        showOptimizedOffCanvas
          ? "bg-black/65 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={optimizedOffCanvasRef}
        className={`bg-snow w-full md:w-[40%] transition-transform duration-300 ease-in-out p-4 ${
          showOptimizedOffCanvas ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-full h-full flex flex-col gap-4">
          <div className="flex gap-4 w-full justify-between items-center">
            <h5 className="text-base font-medium text-smokyBlack">{optimizedOffCanvasContent?.title}</h5>
            <IconBox
              action="close"
              icon="close-black.svg"
              className="!bg-ghostWhite !rounded-2xl p-2.5 border-platinum border"
              onClick={() => setShowOptimizedOffCanvas(false)}
            />
          </div>
          <div className="w-full overflow-y-auto h-full custom-scrollbar">{optimizedOffCanvasContent?.content}</div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedOffCanvasWrapper;
