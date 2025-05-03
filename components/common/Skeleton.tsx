import { SkeletonProps } from "@/types/common";

const Skeleton: React.FC<SkeletonProps> = ({ type }) => {
  return (
    <>
      {type === "table" && (
        <div className="w-full h-full rounded-lg -z-10">
          <div className="grid grid-cols-12 gap-x-4 rounded-lg bg-ghostWhite border p-4 border-platinum h-fit">
            <div className="col-span-4 p-2 animate-pulse bg-gray-200 rounded-lg"></div>
            <div className="col-span-5 p-2 animate-pulse bg-gray-200 rounded-lg"></div>
            <div className="col-span-2 p-2 animate-pulse bg-gray-200 rounded-lg"></div>
            <div className="col-span-1 p-2 animate-pulse bg-gray-200 rounded-lg"></div>
          </div>
          <div className="w-full h-fit pt-4">
            {[...Array(10)].map((_, index) => (
              <div
                className="grid grid-cols-12 gap-x-4 rounded-lg p-4 h-fit"
                key={index}
              >
                <div className="col-span-4 p-2 animate-pulse bg-gray-200 rounded-lg"></div>
                <div className="col-span-5 p-2 animate-pulse bg-gray-200 rounded-lg"></div>
                <div className="col-span-2 p-2 animate-pulse bg-gray-200 rounded-lg"></div>
                <div className="col-span-1 p-2 animate-pulse bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {type === "quick-view" && (
        <div className="w-[calc(90vw-2rem)] h-full">
          {[...Array(3)].map((_, index) => (
            <div
              className="w-full flex rounded-lg gap-4 py-3 h-fit"
              key={index}
            >
              <div className="flex-1 p-5 animate-pulse bg-gray-200 rounded-lg"></div>
              <div className="flex-1 p-5 animate-pulse bg-gray-200 rounded-lg"></div>
              <div className="flex-1 p-5 animate-pulse bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      )}
      {type === "quick-view-half" && (
        <div className="w-full h-full">
          {[...Array(1)].map((_, index) => (
            <div
              className="w-full flex rounded-lg gap-4 h-fit"
              key={index}
            >
              <div className="flex-1 p-4 animate-pulse bg-gray-200 rounded-lg"></div>
              <div className="flex-1 p-4 animate-pulse bg-gray-200 rounded-lg"></div>
              <div className="flex-1 p-4 animate-pulse bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      )}
      {
        type === "box" && (
          <div className="w-full h-full">
            <div className="h-full animate-pulse bg-gray-200 rounded-lg"></div>
          </div>
        )
      }
    </>
  );
};

export default Skeleton;
