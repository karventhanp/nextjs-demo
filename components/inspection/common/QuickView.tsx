import { useEffect, useState } from "react";
import { QuickViewDefect, QuickViewData } from "@/types/inpection";
import Image from "next/image";
import { formatDate } from "@/utils/utils";
import { calculateDefectPosition, getValidUrl } from "@/helpers/helper";
import { inspectionService } from "@/services/inspectionService";
import { useAppContext } from "@/context/AppContext";
import { useSession } from "next-auth/react";
import Skeleton from "@/components/common/Skeleton";

interface ImageDataOnHoverProps {
  data: QuickViewDefect;
  show: boolean;
}

const ImageDataOnHover: React.FC<ImageDataOnHoverProps> = ({ data, show }) => {
  return (
    <div
      className={`absolute bg-snow shadow-medium bottom-[192px] rounded-lg left-1/2 -translate-x-1/2 h-full w-40 transition-all duration-300 ease-in-out transform ${
        show
          ? "opacity-100 scale-100"
          : "opacity-0 scale-90 pointer-events-none"
      }`}
    >
      <Image
        src={data.imageUrl}
        className="rounded-t-lg h-[5.5rem]"
        width={2499}
        height={1666}
        alt="Defect"
        unoptimized
      />
      <div className="pt-1 px-2 pb-2 bg-snow shadow-medium rounded-b-lg flex flex-col gap-1">
        <h5 className="text-xs text-smokyBlack font-medium pb-1 truncate">
          {data.title}
        </h5>
        <div className="flex gap-2 justify-between">
          <label className="text-liver text-[10px] font-normal">Distance</label>
          <label className="text-smokyBlack text-[10px] font-medium">
            {`${data.distance} m`}
          </label>
        </div>
        <div className="flex justify-between gap-2">
          <label className="text-liver text-[10px] font-normal">
            Defect code
          </label>
          <label className="text-smokyBlack text-[10px] font-medium">
            {data.defect?.code}
          </label>
        </div>{" "}
        <div className="flex justify-between gap-2">
          <label className="text-liver text-[10px] font-normal">Rating</label>
          <label className="text-smokyBlack text-[10px] font-medium">
            {data.defect?.severity}
          </label>
        </div>
      </div>
      <div className="absolute w-0 h-0 left-1/2 -translate-x-1/2 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-snow"></div>
    </div>
  );
};

const QuickView: React.FC<{ inPopup?: boolean }> = ({ inPopup }) => {
  const { inspectionId, sideBar } = useAppContext();
  const [view, setView] = useState<QuickViewData>();
  const [defects, setDefects] = useState<QuickViewDefect[]>([]);
  const [showDefect, setShowDefect] = useState<number>();
  const { data: session } = useSession();
  const [showHalf, setShowHalf] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>();

  const getQuickInspection = async () => {
    setLoading(true);
    if (inspectionId) {
      const response = await inspectionService.getQuickInspection(inspectionId);
      if (response.status === 200) {
        setView(response.data);
      }
    }
    setLoading(false);
  };

  const transformToQuickViewDefects = (response: any): QuickViewDefect[] => {
    const defectsImages = Array.isArray(response?.defectsImages)
      ? response.defectsImages
      : [];
    const observationImages = Array.isArray(response?.observationImages)
      ? response.observationImages
      : [];

    const mapToQuickViewDefects = (images: any[]) =>
      images.flatMap((image: any) =>
        (image.defects || []).map((defect: any) => ({
          defect: defect.defect,
          description: image.description ?? "",
          distance: defect.distance?.toString() ?? "0",
          imageUrl: getValidUrl(image.imageUrl ?? "", session?.sub ?? ""),
          imgId: image.imgId ?? 0,
          title: image.title ?? "",
        }))
      );

    return [
      ...mapToQuickViewDefects(defectsImages),
      ...mapToQuickViewDefects(observationImages),
    ];
  };

  useEffect(() => {
    if (view) {
      const quickViewDefects = transformToQuickViewDefects(view.images[0]);
      if (view.totalLength && quickViewDefects.length > 0) {
        setDefects(calculateDefectPosition(view.totalLength, quickViewDefects));
      }
    }
  }, [view]);

  useEffect(() => {
    setDefects([]);
    getQuickInspection();
  }, [inspectionId]);

  return (
    <div className="w-full h-full flex flex-col gap-6 min-w-9/10">
      {loading ? (
        <Skeleton
          type={`${!inPopup && showHalf ? "quick-view-half" : "quick-view"}`}
        />
      ) : (
        <>
          {inPopup ? (
            <div className="flex w-full gap-4 py-2 justify-between items-center pt-2 flex-wrap">
              <div className="flex gap-2 items-center">
                <label className="text-xs xl:text-sm text-liver font-normal">
                  Site name
                </label>
                <h5 className="text-sm xl:text-base text-smokyBlack font-medium">
                  {view?.name}
                </h5>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <label className="text-xs xl:text-sm text-liver font-normal">
                  Address
                </label>
                <h5 className="text-sm xl:text-base text-smokyBlack font-medium">
                  {view?.address}
                </h5>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-xs xl:text-sm text-liver font-normal">
                  Date
                </label>
                <h5 className="text-sm xl:text-base text-smokyBlack font-medium">
                  {formatDate(view?.date ? view.date : "NA")}
                </h5>
              </div>
            </div>
          ) : (
            <div
              className={`w-full flex justify-between items-center gap-4 ${
                showHalf ? "cursor-pointer" : "cursor-default"
              }`}
              onClick={showHalf ? () => setShowHalf(false) : undefined}
            >
              <div className="flex justify-between flex-wrap gap-2 w-full">
                <h5 className="text-sm text-smokyBlack font-normal">
                  {view?.name ? view.name : "NA"}
                </h5>
                <h5 className="text-sm text-liver font-normal">
                  {view?.address ? view.address : "NA"}
                </h5>
                <h5 className="text-sm text-liver font-normal">
                  {formatDate(view?.date ?? "")}
                </h5>
              </div>
              <div
                className="cursor-pointer rounded-lg w-6 h-6 flex justify-center items-center"
                onClick={() => setShowHalf(!showHalf)}
              >
                <Image
                  src="/images/chevron-down-black.svg"
                  width={20}
                  height={20}
                  className={`${!showHalf && "rotate-180"}`}
                  alt="Down Arrow Icon"
                />
              </div>
            </div>
          )}

          <div
            className={`w-full ${
              !inPopup && showHalf ? "hidden" : "flex"
            } flex-col gap-4`}
          >
            <div className="flex flex-col justify-center items-center w-full">
              <div className="py-2.5 relative">
                <div className="w-full h-full">
                  <Image
                    src="/images/pipe.svg"
                    className="w-full"
                    width={1185}
                    height={60}
                    alt="Pipe"
                  />
                </div>
                {view && view.totalLength && defects.length > 0
                  ? defects.map((defect, index) => (
                      <div
                        key={index}
                        style={{
                          left: `${defect.position}%`,
                          top: `${defect.top}%`,
                        }}
                        onMouseLeave={() => setShowDefect(undefined)}
                        onMouseOver={() => setShowDefect(index)}
                        className={`absolute top-1/2 -translate-y-1/2 bg-primary w-2.5 h-2.5 rounded-full`}
                      >
                        <ImageDataOnHover
                          show={index === showDefect}
                          data={defect}
                        />
                      </div>
                    ))
                  : ""}
              </div>
              <div className="flex flex-col justify-center items-center pt-2 gap-1">
                <Image
                  src="/images/line.svg"
                  width={1216}
                  height={0}
                  alt="Line"
                />
                <label className="font-normal text-xs xl:text-sm text-liver">
                  {view?.totalLength ? `${view.totalLength} m` : "NA"}
                </label>
              </div>
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <div className="flex gap-2 items-center">
                <label className="text-xs xl:text-sm text-liver font-normal">
                  Area
                </label>
                <h5 className="text-sm xl:text-base text-smokyBlack font-medium">
                  {view?.area ? view.area : "NA"}
                </h5>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-xs xl:text-sm text-liver font-normal">
                  Issue
                </label>
                <h5 className="text-sm xl:text-base text-smokyBlack font-medium">
                  {view?.pipelineIssue ? view.pipelineIssue : "NA"}
                </h5>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-xs xl:text-sm text-liver font-normal">
                  Direction
                </label>
                <h5 className="text-sm xl:text-base text-smokyBlack font-medium">
                  {view?.direction ? view.direction : "NA"}
                </h5>
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-xs xl:text-sm text-liver font-normal">
                  GPS Coordinates
                </label>
                <h5 className="text-sm xl:text-base text-smokyBlack font-medium">
                  {view?.gpsCoordinates ? view.gpsCoordinates : "NA"}
                </h5>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuickView;
