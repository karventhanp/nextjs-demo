import { useAppContext } from "@/context/AppContext";
import { ImageDefectMeta } from "@/types/response";
import { useEffect, useState } from "react";
import ImageCard from "./ImageCard";
import { getSeverityColor, getValidUrl } from "@/helpers/helper";

interface ImageGalleryProps {
  images: ImageDefectMeta[];
  selectedImage?: ImageDefectMeta;
}

interface ClockProps {
  clock: string;
}

const Clock: React.FC<ClockProps> = ({ clock }) => {
  const start = clock ? parseFloat(clock.split(",")[0]) : 0;
  const end = clock ? parseFloat(clock.split(",")[1]) : 0;

  let startAngle = ((start % 12) / 12) * 360 - 90; // -90 so 12 is top
  let endAngle = ((end % 12) / 12) * 360 - 90;

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

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  selectedImage,
}) => {
  const { userId } = useAppContext();
  const [showImage, setShowImage] = useState<ImageDefectMeta>();

  useEffect(() => {
    setShowImage(selectedImage);
  }, [selectedImage]);

  return (
    <div className="w-full h-full">
      {images.length > 0 ? (
        <div className="flex gap-4 flex-col md:flex-row w-full h-full">
          {showImage && (
            <div className="w-full md:w-[80%] max-w-[50vw] h-full flex flex-col gap-4 items-center justify-center">
              <div className="w-auto h-full flex flex-col justify-center items-center">
                <img
                  src={getValidUrl(showImage.imageUrl, userId)}
                  className="w-auto rounded-t-md object-contain"
                />
                <div
                  className={`w-full h-2 ${
                    showImage.defect
                      ? `bg-${getSeverityColor(showImage.defect.severity)}`
                      : "bg-snow"
                  } rounded-b-lg`}
                ></div>
              </div>
              <div className="flex flex-col gap-4 w-full h-full p-4 rounded-md border border-platinum">
                <div className="w-full flex gap-2 flex-col">
                  <h5 className="text-base text-smokyBlack font-medium">
                    {showImage.title ? showImage.title : "NA"}
                  </h5>
                  <p
                    className="text-xs text-liver font-normal truncate"
                    title=" In this direction the pipeline appears clean and clear"
                  >
                    {showImage.description ? showImage.description : "NA"}
                  </p>
                </div>
                <div className="w-full flex gap-4 justify-between flex-wrap">
                  <div className="flex gap-1 flex-col">
                    <h5 className="text-sm text-liver font-normal">
                      Time Stamp
                    </h5>
                    <p className="text-sm text-smokyBlack font-medium">
                      {showImage.timestamp}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-col">
                    <h5 className="text-sm text-liver font-normal">Distance</h5>
                    <p className="text-sm text-smokyBlack font-medium">
                      {showImage.distance}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-col">
                    <h5 className="text-sm text-liver font-normal">
                      Direction
                    </h5>
                    <p className="text-sm text-smokyBlack font-medium">
                      {showImage.direction}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-col items-center">
                    <h5 className="text-sm text-liver font-normal">Clock</h5>
                    <div className="w-4 h-4">
                      <Clock clock={showImage.clock} />
                    </div>
                  </div>
                  <div className="flex gap-1 flex-col">
                    <h5 className="text-sm text-liver font-normal">
                      Defect Name
                    </h5>
                    <p className="text-sm text-smokyBlack font-medium">
                      {showImage.defect ? showImage.defect.name : "NA"}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-col">
                    <h5 className="text-sm text-liver font-normal">
                      Defect Code
                    </h5>
                    <p className="text-sm text-smokyBlack font-medium">
                      {showImage.defect ? showImage.defect.code : "NA"}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-col">
                    <h5 className="text-sm text-liver font-normal">Severity</h5>
                    <p className="text-sm text-smokyBlack font-medium">
                      {showImage.defect ? showImage.defect.severity : "NA"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className={`flex flex-wrap gap-4 overflow-y-auto custom-scrollbar justify-center ${
              showImage
                ? "w-full md:w-[260px] md:min-w-[260px] max-h-[80vh]"
                : "w-full h-full"
            }`}
          >
            {images.map((image, index) => (
              <ImageCard
                key={index}
                image={image}
                userId={userId}
                hightLight={showImage?.imgId === image.imgId}
                onClick={setShowImage}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-liver text-center">No images found</div>
      )}
    </div>
  );
};

export default ImageGallery;
