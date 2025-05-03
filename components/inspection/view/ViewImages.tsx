import TabSwitcher from "@/components/common/TabSwitcher";
import FileUpload from "@/components/common/FileUpload";
import { Actions, TabSwitcherData } from "@/types/common";
import { useEffect, useState } from "react";
import { FileUploadData } from "@/types/common";
import LegacyImageCard from "../common/LegacyImageCard";
import { assetService } from "@/services/assetService";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { AllImageData, ImageData } from "@/types/response";
import { getValidUrl } from "@/helpers/helper";
import { useSession } from "next-auth/react";
import Skeleton from "@/components/common/Skeleton";
import UploadImage from "../create/UploadImage";
import { IconBoxActions } from "@/types/inpection";
import { updateAction } from "@/helpers/helper";
import { downloadImage } from "@/utils/utils";

const ViewImages = () => {
  const [tabs, setTabs] = useState<TabSwitcherData>({
    active: 1,
    tabs: [
      { id: 1, label: "All", disabled: false },
      { id: 2, label: "Defects", disabled: false },
      { id: 3, label: "Observations", disabled: false },
    ],
  });
  const [fileType, setFileType] = useState<FileUploadData>({
    multiple: true,
    format: { label: "JPEG, JPG, PNG, WebP", type: ".jpeg, .jpg, .png, .webp" },
    label: "Upload Image",
  });
  const [files, setFiles] = useState<File[] | null>(null);
  const { inspectionId, allowedActions } = useAppContext();
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [allImages, setAllImages] = useState<AllImageData>({
    defectsImages: [],
    observationImages: [],
  });
  const [images, setImages] = useState<ImageData[]>([]);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [cardActions, setCardActions] = useState<IconBoxActions[]>([]);

  const handleTabSwitch = (id: number) => {
    let imgs: ImageData[] = [];
    if (id === 1) {
      imgs = allImages.defectsImages.concat(allImages.observationImages);
    } else if (id === 2) {
      imgs = allImages.defectsImages;
    } else if (id === 3) {
      imgs = allImages.observationImages;
    }
    setImages(imgs);
    setTabs((prev) => ({ ...prev, active: id }));
  };

  const getImages = async () => {
    setLoading(true);
    handleTabSwitch(1);
    const response = await assetService.getFilesByCategory(
      inspectionId,
      "image"
    );
    if (response.status === 200) {
      const data = response.data[0];
      let allImgs: AllImageData = {
        defectsImages: data.defectsImages,
        observationImages: data.observationImages,
      };
      if (allImgs.defectsImages.length > 0) {
        allImgs.defectsImages = allImgs.defectsImages.map((img: ImageData) => ({
          ...img,
          imageUrl: getValidUrl(img.imageUrl, session?.sub ?? ""),
        }));
      }
      if (allImgs.observationImages.length > 0) {
        allImgs.observationImages = allImgs.observationImages.map(
          (img: ImageData) => ({
            ...img,
            imageUrl: getValidUrl(img.imageUrl, session?.sub ?? ""),
          })
        );
      }
      setAllImages(allImgs);
      setImages(allImgs.defectsImages.concat(allImgs.observationImages));
    }
    setLoading(false);
  };

  const deleteImage = async (imgId: string) => {
    setCardActions((prev) => updateAction(prev, imgId, "delete", true));
    const response = await assetService.deleteFileById("image", imgId);
    if (response.status === 200) {
      getImages();
    }
    setCardActions((prev) => updateAction(prev, imgId, "delete", false));
  };

  const handleCardAction = async (action: Actions, imgId: string) => {
    if (action === "delete") {
      deleteImage(imgId);
    }
    if (action === "download") {
      setCardActions((prev) => updateAction(prev, imgId, "download", true));
      const imageToDownload = images.find((image) => image.imgId === imgId);
      if (imageToDownload) {
        await downloadImage(imageToDownload?.imageUrl, imageToDownload?.title);
      }
      setCardActions((prev) => updateAction(prev, imgId, "download", false));
    }
  };

  const handleCallback = (success: boolean) => {
    setFiles([]);
    getImages();
  };

  useEffect(() => {
    getImages();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 border border-platinum rounded-2xl">
      {allowedActions.create && files && files.length > 0 ? (
        <UploadImage
          viewFlow={true}
          viewData={files}
          success={handleCallback}
          cancel={() => setFiles([])}
        />
      ) : (
        <>
          <div className="w-full flex justify-between gap-4 items-center flex-wrap">
            <div>
              <TabSwitcher
                data={tabs}
                withNormalButton={false}
                switchTab={(id) => handleTabSwitch(id)}
              />
            </div>
            {allowedActions.create && (
              <div className="flex">
                <FileUpload
                  onChange={(files) => setFiles(files)}
                  data={fileType}
                  size="small"
                />
              </div>
            )}
          </div>
          {selectedImages.length > 0 && (
            <div className="flex gap-5 items-center bg-ghostWhite justify-between rounded-lg w-full p-4">
              <div>
                <h5 className="text-smokyBlack text-sm font-medium">
                  Selected ()
                </h5>
              </div>
              <div className="flex gap-5">
                {allowedActions.download && (
                  <Image
                    src="/images/download.svg"
                    className="w-5 xl:w-auto"
                    width={24}
                    height={24}
                    alt="Download Image"
                  />
                )}
                {allowedActions.delete && (
                  <Image
                    src="/images/delete-icon.svg"
                    className="w-5 xl:w-auto cursor-pointer"
                    width={24}
                    height={24}
                    alt="Delete Selection"
                  />
                )}
              </div>
            </div>
          )}
          {loading ? (
            <div className="h-80 w-full">
              <Skeleton type="box" />
            </div>
          ) : images.length > 0 ? (
            <div className="w-full h-full flex gap-x-3 gap-y-4 flex-wrap justify-evenly">
              {images.map((image, index) => (
                <div className="w-[300px]" key={index}>
                  <LegacyImageCard
                    data={image}
                    actions={cardActions}
                    onClick={handleCardAction}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center font-normal text-liver text-sm h-80 w-full flex justify-center items-center">
              No images available
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ViewImages;
