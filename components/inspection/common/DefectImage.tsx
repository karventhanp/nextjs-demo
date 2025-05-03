import { IconBox } from "@/components/common/IconBox";
import { useAppContext } from "@/context/AppContext";
import { getSeverityColor, getValidUrl } from "@/helpers/helper";
import { ImageDefectMeta } from "@/types/response";
import EditDefect from "../create/EditDefect";

interface DefectImageProps {
  image: ImageDefectMeta;
  userId: string;
  success?: () => void;
  showImage?: (image: ImageDefectMeta) => void;
  onClick?: (image: ImageDefectMeta) => void;
}
const DefectImage: React.FC<DefectImageProps> = ({
  image,
  userId,
  success = () => {},
  showImage = () => {},
  onClick = () => {},
}) => {
  const {
    activeTimeStamp,
    setShowOptimizedOffCanvas,
    setOptimizedOffCanvasContent,
  } = useAppContext();

  const editImage = (img: ImageDefectMeta) => {
    setOptimizedOffCanvasContent({
      title: image.defect ? "Defect" : "Observation",
      content: <EditDefect image={img} success={success} />,
    });
    setShowOptimizedOffCanvas(true);
  };

  return (
    <div
      className={`w-full flex flex-col justify-center relative rounded-lg border-2 border-platinum cursor-pointer ${
        activeTimeStamp === image.timestamp && "border-primary"
      } hover:border-primary`}
      onClick={() => onClick(image)}
      onDoubleClick={() => showImage(image)}
    >
      <img
        src={getValidUrl(image.imageUrl, userId)}
        className="w-full h-full rounded-t-lg object-contain"
      />
      <IconBox
        icon="edit.svg"
        action="edit"
        className="absolute top-2 right-2"
        onClick={() => editImage(image)}
      />
      <div
        className={`w-full h-2 ${
          image.defect
            ? `bg-${getSeverityColor(image.defect.severity)}`
            : "bg-snow"
        } rounded-b-lg`}
      ></div>
    </div>
  );
};

export default DefectImage;
