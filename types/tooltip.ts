import { ReactNode } from "react";

export type TooltipProps = {
    children: ReactNode;
    text: string;
    position?: "top" | "right" | "bottom" | "left";
    className?: string;
};