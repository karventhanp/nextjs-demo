import Skeleton from "@/components/common/Skeleton";
import { useAppContext } from "@/context/AppContext";
import { getValidUrl } from "@/helpers/helper";
import Image from "next/image";
import { useEffect, useState } from "react";

const ImagePopup = () => {
  const { imageUrl, userId } = useAppContext();
  const [validUrl, setValidUrl] = useState<string>("");

  useEffect(() => {
    setValidUrl(getValidUrl(imageUrl, userId));
  }, [imageUrl]);
  return (
    <div className="w-full h-full">
      {validUrl !== "" ? (
        <div className="w-full h-full">
          <h5 className="text-sm text-smokyBlack font-medium pt-2">
            Image Preview
          </h5>
          <div className="pt-6">
            <Image
              key={validUrl}
              src={validUrl}
              width={500}
              height={500}
              alt="Image Preview"
              className="rounded-lg"
              unoptimized
            />
          </div>
        </div>
      ) : (
        <div className="w-100 h-80 pt-14">
          <Skeleton type="box" />
        </div>
      )}
    </div>
  );
};

export default ImagePopup;
