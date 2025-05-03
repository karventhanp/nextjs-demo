import { useAppContext } from "@/context/AppContext";
import SingleInspectionPopup from "./components/SingleInspectionPopup";
import SelectedInspectionsPopup from "./components/SelectedInspectionsPopup";
import { useRef } from "react";
import useClickOutside from "@/hooks/useClickOutside";
import Image from "next/image";
import ImagePopup from "./components/ImagePopup";
import SearchCustomers from "./components/SearchCustomers";

const PopupWrapper: React.FC = () => {
  const { showPopup, popupType, setShowPopup } = useAppContext();
  const popupRef = useRef<HTMLDivElement>(null);

  useClickOutside([popupRef], () => setShowPopup(false));

  return (
    <div
      className={`h-screen flex justify-center ${popupType === "search" ? "items-start" : "items-center shadow-medium"} fixed top-0 w-screen z-50 backdrop-blur-sm transition-all duration-300 ease-in-out ${
        showPopup
          ? "bg-black/65 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`${
          popupType === "search"
            ? "bg-transparent p-0 border-0"
            : "bg-snow p-4 border"
        }  flex rounded-2xl relative border-platinum ${
          popupType === "search" ? "w-full md:w-1/2" : "w-fit"
        } max-w-9/10 h-fit transition-transform duration-300 ease-in-out ${
          showPopup ? "scale-100" : "scale-95"
        }`}
        ref={popupRef}
      >
        <div
          className={`bg-ghostWhite cursor-pointer p-2.5 border border-platinum ${
            popupType === "search" && "hidden"
          } rounded-2xl absolute top-4 right-4`}
          onClick={() => setShowPopup(false)}
        >
          <Image
            src="/images/close-black.svg"
            className="w-5 xl:w-auto"
            width={24}
            height={24}
            alt="Close"
          />
        </div>
        {popupType === "single-inspection" && <SingleInspectionPopup />}
        {popupType === "selected-inspections" && <SelectedInspectionsPopup />}
        {popupType === "image" && <ImagePopup />}
        {popupType === "search" && <SearchCustomers />}
      </div>
    </div>
  );
};

export default PopupWrapper;
