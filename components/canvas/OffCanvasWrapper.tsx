import { useAppContext } from "@/context/AppContext";
import useClickOutside from "@/hooks/useClickOutside";
import { useRef } from "react";
import User from "../users/User";
import { IconBox } from "../common/IconBox";
import SolinasUser from "../users/SolinasUser";

const OffCanvasWrapper = () => {
  const { showOffCanvas, setShowOffCanvas, offCanvasType } = useAppContext();
  const offCanvasRef = useRef<HTMLDivElement>(null);

  useClickOutside([offCanvasRef], () => setShowOffCanvas(false));
  return (
    <div
      className={`h-screen fixed top-0 w-screen z-50 flex justify-end backdrop-blur-sm transition-all duration-300 ease-in-out ${
        showOffCanvas
          ? "bg-black/65 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={offCanvasRef}
        className={`bg-snow w-full md:w-[40%] h-full transition-transform duration-300 ease-in-out overflow-y-auto custom-scrollbar ${
          showOffCanvas ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <IconBox
          action="close"
          icon="close-black.svg"
          className="!bg-ghostWhite !rounded-2xl p-2.5 border-platinum border absolute right-2 top-2"
          onClick={() => setShowOffCanvas(false)}
        />
        <div className="w-full h-full p-4">
          {offCanvasType === "user" && <User />}
          {offCanvasType === "solinas" && <SolinasUser />}
        </div>
      </div>
    </div>
  );
};

export default OffCanvasWrapper;
