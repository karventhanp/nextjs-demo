import { useEffect, useState } from "react";

const getCurrentWidth = (): number => (typeof window !== "undefined" ? window.innerWidth : 0);

export const useScreenWidth = (): number => {
  const [width, setWidth] = useState<number>(getCurrentWidth());

  useEffect(() => {
    const handleResize = (): void => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return width;
};
