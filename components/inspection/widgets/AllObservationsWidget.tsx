import { IconBox } from "@/components/common/IconBox";
import { useAppContext } from "@/context/AppContext";
import { TabSwitcherData } from "@/types/common";
import { ImageDefectMeta } from "@/types/response";
import Image from "next/image";
import { useEffect, useState } from "react";
import CreateObservation from "../create/CreateObservation";
import { getValidUrl } from "@/helpers/helper";
import EditDefect from "../create/EditDefect";
import ImageGallery from "../common/ImageGallery";
import NewWindow from "@/components/common/NewWindow";

interface AllObservationsWidgetProps {
  defectImages: ImageDefectMeta[];
  observationImages: ImageDefectMeta[];
  videoId: string;
  success?: () => void;
  onClick?: (defect: ImageDefectMeta) => void;
}

interface ClockProps {
  clock: string;
}

const Clock: React.FC<ClockProps> = ({ clock }) => {
  const start = clock ? parseFloat(clock.split(",")[0]) : 0;
  const end = clock ? parseFloat(clock.split(",")[1]) : 0;

  let startAngle = ((start % 12) / 12) * 360 - 90; // -90 so 12 is top
  let endAngle = ((end % 12) / 12) * 360 - 90;

  // If endAngle is less than startAngle, it means we wrap over 12
  if (endAngle <= startAngle) {
    endAngle += 360;
  }

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = 50 + 50 * Math.cos(startRad);
  const y1 = 50 + 50 * Math.sin(startRad);
  const x2 = 50 + 50 * Math.cos(endRad);
  const y2 = 50 + 50 * Math.sin(endRad);

  return (
    <div className="w-full flex justify-center items-center">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background */}
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="#e5e7eb"
          strokeWidth="4"
          fill="#FAFAFA"
        />

        {/* Highlighted Arc */}
        <path
          d={`M50,50 L${x1},${y1} A50,50 0 ${largeArc} 1 ${x2},${y2} Z`}
          fill="#29A38B"
        />

        {/* Outer Circle */}
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="#4D4D4D"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
};

const AllObservationsWidget: React.FC<AllObservationsWidgetProps> = ({
  defectImages,
  observationImages,
  videoId,
  success = () => {},
  onClick = () => {}
}) => {
  const [tabs, setTabs] = useState<TabSwitcherData>({
    active: 1,
    tabs: [
      { id: 1, label: "All", disabled: false },
      { id: 2, label: "Defect", disabled: false },
      { id: 3, label: "Observation", disabled: false },
    ],
  });
  const {
    setOptimizedOffCanvasContent,
    setShowOptimizedOffCanvas,
    setShowOptimizedPopup,
    setOptimizedPopupContent,
    userId,
    activeTimeStamp,
    handleSideBar,
    handleNewWindow,
    newWindow,
  } = useAppContext();
  const [filteredData, setFilteredData] = useState<ImageDefectMeta[]>([]);

  const handleTabSwitch = (id: number) => {
    setTabs((prev) => ({ ...prev, active: id }));
  };

  const createObservation = () => {
    const key = Date.now();
    setShowOptimizedOffCanvas(true);
    setOptimizedOffCanvasContent({
      title: "Observation",
      content: (
        <CreateObservation time={key} videoId={videoId} success={success} />
      ),
    });
  };

  const showGallery = (selectedImage?: ImageDefectMeta) => {
    setOptimizedPopupContent({
      title: "Gallery",
      content: (
        <ImageGallery images={filteredData} selectedImage={selectedImage} />
      ),
    });
    setShowOptimizedPopup(true);
  };

  const showPreview = (url: string) => {
    const imageDiv = (
      <div className="w-full h-full">
        <Image
          src={getValidUrl(url, userId)}
          width={600}
          height={600}
          className="w-full h-full object-contain rounded-lg"
          alt="Preview Image"
        />
      </div>
    );
    setOptimizedPopupContent({ title: "Preview", content: imageDiv });
    setShowOptimizedPopup(true);
  };

  const handleActions = (img: ImageDefectMeta) => {
    setOptimizedOffCanvasContent({
      title: img.defect ? "Defect" : "Observation",
      content: <EditDefect image={img} success={success} />,
    });
    setShowOptimizedOffCanvas(true);
  };

  useEffect(() => {
    const tabId = tabs.active;
    if (tabId === 1) setFilteredData([...defectImages, ...observationImages]);
    if (tabId === 2) setFilteredData(defectImages);
    if (tabId === 3) setFilteredData(observationImages);
  }, [tabs.active]);

  useEffect(() => {
    setFilteredData([...defectImages, ...observationImages]);
  }, [defectImages, observationImages]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex justify-between bg-primary/30 h-12 rounded-t-lg items-center p-2">
        <div className="flex items-center gap-2">
          <div className="flex bg-snow rounded-md p-1">
            {tabs.tabs.map((tab, index) => (
              <button
                key={index}
                className={`text-sm font-medium rounded-md py-0.5 px-2.5 flex justify-center items-center ${
                  index + 1 === tabs.active
                    ? "bg-primary text-snow"
                    : "text-liver"
                }`}
                onClick={() => handleTabSwitch(index + 1)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-grow cursor-grabbing drag-handle">
          <div className="invisible">Drag</div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="flex gap-2 bg-snow rounded-lg border justify-center h-8 items-center hover:border-primary py-1 px-2 text-sm font-medium"
            onClick={createObservation}
          >
            <Image
              src="/images/upload-primary.svg"
              width={24}
              height={24}
              alt="Capture"
            />
            <label className="cursor-pointer bg-gradient-to-r from-pineGreen to-secondary bg-clip-text text-transparent">
              Observation
            </label>
          </button>
          <IconBox
            action="click"
            icon="window-maximize.svg"
            className="!bg-snow h-8 flex justify-center items-center min-w-8"
            onClick={() => handleNewWindow({type: 'open', id: 4})}
          />
          <IconBox
            action="close"
            icon="close-black.svg"
            className="!bg-snow h-8 flex justify-center items-center min-w-8"
            onClick={() => handleSideBar(4)}
          />
        </div>
      </div>
      <div className="w-full h-full flex flex-col px-2 py-1 overflow-auto scrollbar-none">
        {filteredData.length > 0 ? (
          <div className="w-full min-w-max flex flex-col gap-2">
            <div className="grid grid-cols-9 font-medium text-liver text-center text-sm">
              <div className="py-2">Time</div>
              <div className="py-2 ">Distance</div>
              <div className="py-2 ">Direction</div>
              <div className="py-2 ">Clock</div>
              <div className="py-2 ">Defect</div>
              <div className="py-2 ">Code</div>
              <div className="py-2 ">Severity</div>
              <div className="py-2 ">Image</div>
              <div className="py-2">Action</div>
            </div>
            {filteredData.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-9 text-smokyBlack place-items-center font-medium text-sm text-center border border-transparent ${
                  activeTimeStamp === item.timestamp && "bg-secondary"
                } hover:border-primary cursor-pointer rounded-lg`}
                onClick={() => onClick(item)}
                onDoubleClick={() => showGallery(item)}
              >
                <div className="py-2 truncate">{item.timestamp}</div>
                <div className="py-2 truncate">{item.distance}</div>
                <div className="py-2 truncate">{item.direction}</div>
                <div className="flex justify-center items-center">
                  <div className="w-4 h-4">
                   {item.clock ? <Clock clock={item.clock} /> : "NA"}
                  </div>
                </div>
                <div className="py-2 truncate max-w-28">
                  {item.defect ? item.defect.name : "NA"}
                </div>
                <div className="py-2 truncate">
                  {item.defect ? item.defect.code : "NA"}
                </div>
                <div className="py-2 truncate">
                  {item.defect ? item.defect.severity : "NA"}
                </div>
                <div
                  className="py-2 truncate flex items-center justify-center"
                  onClick={() => showPreview(item.imageUrl)}
                >
                  <Image
                    src="/images/image.svg"
                    width={20}
                    height={20}
                    alt="Preview"
                  />
                </div>
                <div className="py-2 truncate flex items-center justify-center relative">
                  <div
                    className="w-fit rounded-lg p-0.5 hover:bg-ghostWhite"
                    onClick={() => handleActions(item)}
                  >
                    <Image
                      src="/images/edit.svg"
                      width={20}
                      height={20}
                      alt="Actions"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>No data found</div>
        )}
      </div>
      {newWindow.clicked && newWindow.active.includes(4) && (
        <NewWindow id={4} title="Observations">
          <div className="w-full h-full flex flex-col px-2 py-1 overflow-auto scrollbar-none">
            {filteredData.length > 0 ? (
              <div className="w-full min-w-max flex flex-col gap-2">
                <div className="grid grid-cols-9 font-medium text-liver text-center text-sm">
                  <div className="py-2">Time</div>
                  <div className="py-2 ">Distance</div>
                  <div className="py-2 ">Direction</div>
                  <div className="py-2 ">Clock</div>
                  <div className="py-2 ">Defect</div>
                  <div className="py-2 ">Code</div>
                  <div className="py-2 ">Severity</div>
                  <div className="py-2 ">Image</div>
                  <div className="py-2">Action</div>
                </div>
                {filteredData.map((item, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-9 text-smokyBlack place-items-center font-medium text-sm text-center border border-transparent ${
                      activeTimeStamp === item.timestamp && "bg-secondary"
                    } hover:border-primary cursor-pointer rounded-lg`}
                    onDoubleClick={() => showGallery(item)}
                  >
                    <div className="py-2 truncate">{item.timestamp}</div>
                    <div className="py-2 truncate">{item.distance}</div>
                    <div className="py-2 truncate">{item.direction}</div>
                    <div className="flex justify-center items-center">
                      <div className="w-4 h-4">
                        {item.clock ? <Clock clock={item.clock} /> : "NA"}
                      </div>
                    </div>
                    <div className="py-2 truncate max-w-28">
                      {item.defect ? item.defect.name : "NA"}
                    </div>
                    <div className="py-2 truncate">
                      {item.defect ? item.defect.code : "NA"}
                    </div>
                    <div className="py-2 truncate">
                      {item.defect ? item.defect.severity : "NA"}
                    </div>
                    <div
                      className="py-2 truncate flex items-center justify-center"
                      onClick={() => showPreview(item.imageUrl)}
                    >
                      <Image
                        src="/images/image.svg"
                        width={20}
                        height={20}
                        alt="Preview"
                      />
                    </div>
                    <div className="py-2 truncate flex items-center justify-center relative">
                      <div
                        className="w-fit rounded-lg p-0.5 hover:bg-ghostWhite"
                        onClick={() => handleActions(item)}
                      >
                        <Image
                          src="/images/edit.svg"
                          width={20}
                          height={20}
                          alt="Actions"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>No data found</div>
            )}
          </div>
        </NewWindow>
      )}
    </div>
  );
};

export default AllObservationsWidget;
