import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { CircularProgress } from "./Progress";

const Progress = () => {
  const { storedQueue, showProgressStatus, setShowProgressStatus } =
    useAppContext();
  return (
    <>
      {storedQueue.length > 0 && showProgressStatus.full && (
        <div className="fixed bottom-3 right-3 w-64 shadow-medium h-fit rounded-lg z-50">
          <div className="w-full bg-snow p-2 flex justify-between items-center rounded-t-lg">
            <h5 className="text-sm text-smokyBlack font-medium">In Progress</h5>
            <div className="flex gap-2 items-center">
              <div
                className="p-1.5 rounded-lg border border-platinum cursor-pointer"
                onClick={() =>
                  setShowProgressStatus({ full: false, half: true })
                }
              >
                <Image
                  src="/images/chevron-down-black.svg"
                  width={24}
                  height={24}
                  alt="Collapse"
                  className="w-5"
                />
              </div>
              <div
                className="p-1.5 rounded-lg border border-platinum cursor-pointer"
                onClick={() =>
                  setShowProgressStatus({ half: false, full: false })
                }
              >
                <Image
                  src="/images/close-black.svg"
                  width={24}
                  height={24}
                  alt="Close"
                  className="w-5"
                />
              </div>
            </div>
          </div>
          <div className="bg-platinum flex w-full shadow-medium flex-col gap-2 rounded-b-lg p-2">
            {storedQueue.map((item, index) => (
              <div
                className="w-full flex justify-between gap-2 items-center p-2"
                key={index}
              >
                <label className="text-sm text-smokyBlack font-medium truncate">
                  {item.name}
                </label>
                <div className="h-10 w-10">
                  <CircularProgress percent={item.percent} radius={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {storedQueue.length > 0 && showProgressStatus.half && (
        <div
          className="fixed bottom-3 right-3 w-fit h-fit cursor-pointer rounded-3xl shadow-medium bg-platinum p-2.5"
          onClick={() => setShowProgressStatus({ full: true, half: false })}
        >
          <div className="h-10 w-10">
            <CircularProgress percent={storedQueue[0].percent} radius={20} />
          </div>
        </div>
      )}
    </>
  );
};

export default Progress;
