import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

const BottomNavbar = () => {
  const { adminMenuItems } = useAppContext();

  return (
    <div className="fixed bottom-0 w-full flex sm:hidden gap-2 bg-white items-center justify-around min-h-11 max-h-16 box-border px-4 py-4">
      {adminMenuItems.map((item, index) => {
        return (
          <Link
            href={item.path}
            key={index}
            className={`flex flex-col items-center w-12 justify-center  sm:px-3 lg:px-6 py-2 gap-3 rounded-xl transition-all duration-300 ease-in-out
                    ${
                      item.active
                        ? "bg-pineGreen/10 text-pineGreen shadow-sm ring-1 border-b-0 ring-pineGreen"
                        : "text-liver hover:bg-ghostWhite"
                    }`}
          >
            <Image
              src={`/images/${item.active ? item.iconPath : item.iconPath}`}
              width={24}
              height={24}
              alt={item.name}
            />
            <span
              className={`font-medium text-xs whitespace-nowrap ${
                item.active ? "text-liver" : "text-liver"
              } hidden lg:flex `}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default memo(BottomNavbar);