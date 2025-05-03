import { ProgressBar } from "@/components/common/Progress";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { formatBytes } from "@/utils/utils";

const VideoQueue = () => {
  const { storedQueue } = useAppContext();

  return (
    <>
      {storedQueue.length > 0 && (
        <div className="w-full flex flex-col h-full gap-4 border border-platinum rounded-lg p-4">
          <h5 className="text-md text-smokyBlack font-medium">Queue</h5>
          {storedQueue.map((data, index) => (
            <div className="flex gap-4 w-full items-center" key={index}>
              <div className="text-sm font-medium text-smokyBlack">
                {index + 1}
              </div>
              <div className="flex flex-col gap-2 w-full border border-platinum rounded-lg p-2">
                <div className="w-full flex gap-2 flex-col md:flex-row items-center justify-between">
                  <div className="flex gap-2">
                    <Image
                      src={data.thumbnailUrl}
                      className="rounded-lg"
                      width={80}
                      height={46.64}
                      alt="Uploading..."
                    />
                    <div className="flex flex-col gap-2 items-start justify-center">
                      <h5 className="text-xs font-normal text-smokyBlack">
                        {data.name}
                      </h5>
                      <label className="text-[10px] font-normal text-liver">
                        {formatBytes(data.size)}
                      </label>
                    </div>
                  </div>
                  <label className="text-xs text-liver font-normal flex gap-1 items-center">
                    {data.percent === 100 ? "Upload Completed" : "Uploading"}
                    <span className="text-sm text-liver font-medium">
                      {data.percent}%
                    </span>
                  </label>
                </div>
                {data.percent !== 100 && (
                  <div className="w-full flex flex-col gap-2 justify-center items-center">
                    <ProgressBar percent={data.percent ?? 0} />{" "}
                    <label className="text-xs text-liver font-normal">
                      Progress will continue in the background. You can proceed
                      with completing the inspection onboarding.
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default VideoQueue;
