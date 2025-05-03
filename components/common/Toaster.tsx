import Image from "next/image";
import { useEffect, useState } from "react";
import { ToasterData } from "@/types/common";
const Toaster: React.FC<ToasterData> = ({ message, type, visibility }) => {
  const [show, setShow] = useState<boolean>(visibility);
  const [toaster, setToaster] = useState<ToasterData>({
    message,
    type,
    visibility,
  });

  const close = () => {
    setShow(false);
  };

  useEffect(() => {
    setShow(visibility);
    switch (type) {
      case "error":
        setToaster({
          message,
          type,
          path: "/images/fail.svg",
          visibility: visibility,
          title: "Oh snap!",
          background: "bg-[#F63E50]",
        });
        break;
      case "success":
        setToaster({
          message,
          type,
          path: "/images/success.svg",
          visibility: visibility,
          title: "Well done!",
          background: "bg-[#03A65A]",
        });
        break;
      case "warning":
        setToaster({
          message,
          type,
          path: "/images/warning.svg",
          visibility: visibility,
          title: "Warning!",
          background: "bg-[#F88F01]",
        });
        break;
      case "info":
        setToaster({
          message,
          type,
          path: "/images/info.svg",
          visibility: visibility,
          title: "Hi there!",
          background: "bg-[#0070E0]",
        });
        break;
    }
    const timer = setTimeout(() => {
      setShow(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [visibility]);

  return (
    <>
      {show && (
        <div
          className={`absolute z-50 top-4 gap-4 left-1/2 -translate-x-1/2 w-11/12 sm:max-w-[400px] sm:w-fit sm:min-w-[280px] sm:right-4 sm:translate-x-0 sm:left-auto ${toaster.background} flex justify-between p-4 rounded-lg`}
        >
          <div className="flex gap-3">
            <div className="min-w-10 min-h-10">
              {toaster && toaster.path && toaster.path.length > 0 && (
                <Image src={toaster.path} width="30" height="30" alt="Fail" />
              )}
            </div>
            <div>
              <h5 className="text-md text-white font-bold pb-1">
                {toaster.title}
              </h5>
              <p className="text-sm text-white font-normal">
                {toaster.message}
              </p>
            </div>
          </div>
          <div className="min-w-3.5 min-h-3.5">
            <Image
              className="cursor-pointer"
              src="/images/close.svg"
              width="12"
              height="12"
              alt="Close"
              onClick={close}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Toaster;
