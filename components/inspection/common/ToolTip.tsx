import { TooltipProps } from "@/types/tooltip";
import React from "react";

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  position = "top",
  className = "",
}) => {
  return (
    <div className="relative group inline-block">
      {children}
      <div
        className={`absolute z-50 px-3 py-1 text-xs text-trollyGray bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-pre ${positionClasses[position]} ${className}`}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
