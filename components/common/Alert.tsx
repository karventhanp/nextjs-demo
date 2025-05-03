import Image from "next/image";

interface AlertProps {
  message: string;
  icon?: string;
  onClick?: (proceed: boolean) => void;
}

const Alert: React.FC<AlertProps> = ({ message, icon, onClick = () => {} }) => {
  return (
    <div className="w-full flex flex-col gap-4 justify-center items-center">
      <div>
        {icon && (
          <Image
            src={`/images/${icon}`}
            width={60}
            height={60}
            alt="Alert Icon"
          />
        )}
      </div>
      <div className="flex flex-col w-full gap-6">
        <div className="text-smokyBlack font-medium text-base max-w-100 text-center">
          {message}
        </div>
        <div className="w-full flex gap-4">
          <button
            onClick={() => onClick(false)}
            className="border border-platinum text-sm w-full text-smokyBlack font-medium rounded-lg p-2.5"
          >
            Cancel
          </button>
          <button
            onClick={() => onClick(true)}
            className="border  text-sm text-snow font-medium w-full bg-royalBlue rounded-lg p-2.5"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;
