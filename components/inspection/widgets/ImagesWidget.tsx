import { IconBox } from "@/components/common/IconBox";
import { useAppContext } from "@/context/AppContext";
import { ImageDefectMeta } from "@/types/response";
import Image from "next/image";
import { useEffect } from "react";
import DefectImage from "../common/DefectImage";
import ImageGallery from "../common/ImageGallery";
import NewWindow from "@/components/common/NewWindow";

interface ImagesWidgetProps {
  images: ImageDefectMeta[];
  success?: () => void;
  onImageClick?: (image: ImageDefectMeta) => void;
}

const ImagesWidget: React.FC<ImagesWidgetProps> = ({
  images,
  success = () => {},
  onImageClick = () => {},
}) => {
  const {
    userId,
    setShowOptimizedPopup,
    setOptimizedPopupContent,
    handleSideBar,
    newWindow,
    handleNewWindow,
  } = useAppContext();

  const showGallery = (selectedImage?: ImageDefectMeta) => {
    setOptimizedPopupContent({
      title: "Gallery",
      content: <ImageGallery images={images} selectedImage={selectedImage} />,
    });
    setShowOptimizedPopup(true);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex justify-between bg-primary/30 h-12 rounded-t-lg items-center p-2">
        <div className="flex items-center gap-2">
          <h5 className="text-sm text-smokyBlack font-medium">Images</h5>
          <IconBox
            onClick={() => showGallery()}
            action="click"
            icon="image-gray.svg"
            className="!bg-snow h-8 flex justify-center items-center min-w-8"
          />
        </div>
        <div className="flex flex-grow cursor-grabbing drag-handle">
          <div className="invisible">Drag</div>
        </div>
        <div className="flex gap-2">
          <IconBox
            action="click"
            icon="window-maximize.svg"
            className="!bg-snow h-8 flex justify-center items-center min-w-8"
            onClick={() => handleNewWindow({type: 'open', id: 3})}
          />
          <IconBox
            action="close"
            icon="close-black.svg"
            className="!bg-snow h-8 flex justify-center items-center min-w-8"
            onClick={() => handleSideBar(3)}
          />
        </div>
      </div>
      {images.length > 0 ? (
        <div className="w-full flex flex-col gap-4 p-4 overflow-y-auto scrollbar-none flex-1">
          {images.map((image, index) => (
            <DefectImage
              key={index}
              image={image}
              userId={userId}
              success={success}
              showImage={showGallery}
              onClick={onImageClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-liver text-sm m-auto">No defects found</div>
      )}
      {newWindow.clicked &&
        newWindow.active.includes(3) &&
        <NewWindow id={3} title="Defect Images">
        {images.length > 0 ? (
            <div className="w-full flex flex-col gap-4 p-4 overflow-y-auto scrollbar-none flex-1">
              {images.map((image, index) => (
                <DefectImage
                  key={index}
                  image={image}
                  userId={userId}
                  success={success}
                  showImage={showGallery}
                />
              ))}
            </div>
        ) : (
            <div className="text-liver text-sm m-auto">No defects found</div>
        )}
        </NewWindow>
        }
    </div>
  );
};

export default ImagesWidget;
