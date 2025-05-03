import { useRouter } from "next/navigation";
import Image from "next/image";
import { Actions } from "@/types/common";

interface IconBoxProps {
  icon: string;
  action: Actions;
  className?: string;
  onClick?: (name: Actions) => void;
  loading?: boolean;
}

export const IconBox: React.FC<IconBoxProps> = ({
  icon,
  action,
  className,
  onClick,
  loading,
}) => {
  const router = useRouter();

  const handleRouter = () => {
    if (action === "back") router.back();
    if (action === "next") router.forward();
  };

  return (
    <div
      className={`${className} cursor-pointer bg-white/60 rounded-md p-1 w-fit hover:border hover:border-primary`}
      onClick={onClick ? () => onClick(action) : () => handleRouter()}
    >
      <Image
        src="/images/loading.svg"
        className={`w-5 animate-spin ${loading ? "block" : "hidden"}`}
        width={24}
        height={24}
        alt="loading"
      />
      <Image
        src={`/images/${icon}`}
        width={24}
        height={24}
        alt={action}
        className={`w-5 cursor-pointer ${loading ? "hidden" : "block"}`}
      />
    </div>
  );
};
