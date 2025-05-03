import { ImageDefectMeta } from "@/types/response";
import DefectImage from "./DefectImage";

interface ImageCardProps {
  image: ImageDefectMeta;
  userId: string;
  hightLight?: boolean;
  onClick?: (image: ImageDefectMeta) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  userId,
  hightLight,
  onClick = () => {},
}) => {

  return (
    <div
      className={`w-full md:w-[260px] flex flex-col gap-2 border cursor-pointer p-1.5 border-platinum h-fit rounded-lg ${
        hightLight && "border-primary"
      } hover:border-primary`}
      onClick={() => onClick(image)}
    >
      <div>
        <DefectImage image={image} userId={userId} />
      </div>
      <div className="flex flex-col gap-4 w-full px-1">
        <div className="w-full flex gap-2 flex-col">
          <h5 className="text-base text-smokyBlack font-medium">
            {image.title ? image.title : "NA"}
          </h5>
          <p
            className="text-xs text-liver font-normal truncate"
            title=" In this direction the pipeline appears clean and clear"
          >
            {image.description ? image.description : "NA"}
          </p>
        </div>
        <div className="w-full flex gap-2 justify-between flex-col md:flex-row">
          <div className="flex gap-1 flex-col">
            <h5 className="text-sm text-liver font-normal">Distance</h5>
            <p className="text-sm text-smokyBlack font-medium">
              {image.distance}
            </p>
          </div>
          <div className="flex gap-1 flex-col">
            <h5 className="text-sm text-liver font-normal">Defect Code</h5>
            <p className="text-sm text-smokyBlack font-medium">
              {image.defect ? image.defect.code : "NA"}
            </p>
          </div>
          <div className="flex gap-1 flex-col">
            <h5 className="text-sm text-liver font-normal">Severity</h5>
            <p className="text-sm text-smokyBlack font-medium">
              {image.defect ? image.defect.severity : "NA"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
