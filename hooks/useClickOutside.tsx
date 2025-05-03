import { useEffect, RefObject } from "react";

const useClickOutside = (
  refs: RefObject<HTMLElement | HTMLDivElement>[],
  onClickOutside: () => void
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isInsideClick = refs.some(
        (ref) => ref.current && ref.current.contains(event.target as Node)
      );

      if (!isInsideClick) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs, onClickOutside]);
};

export default useClickOutside;
