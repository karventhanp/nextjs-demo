import TabSwitcher from "@/components/common/TabSwitcher";
import { TabSwitcherData } from "@/types/common";
import { useAppContext } from "@/context/AppContext";
import { useEffect, useState } from "react";
import Map from "@/components/common/Map";
import { assetService } from "@/services/assetService";
import FileUpload from "@/components/common/FileUpload";
import { FileUploadData } from "@/types/common";
import { FileCategoryData } from "@/types/response";
import Image from "next/image";
import { getValidUrl } from "@/helpers/helper";
import { useSession } from "next-auth/react";
import { ActionButton } from "@/components/common/Buttons";
import { ActionButtons } from "@/types/button";
import Skeleton from "@/components/common/Skeleton";
import { inspectionService } from "@/services/inspectionService";

const ViewMap = () => {
  const { inspectionId, allowedActions, userId } = useAppContext();
  const [tabs, setTabs] = useState<TabSwitcherData>({
    active: 1,
    tabs: [
      { id: 1, label: "Map View", disabled: false },
      { id: 2, label: "Map Coordinates", disabled: false },
    ],
  });
  const [actions, setActions] = useState<ActionButtons>({
    delete: {
      disabled: false,
      icon: "delete-icon.svg",
      label: "Delete",
      loading: false,
      name: "delete",
    },
  });
  const [fileType, setFileType] = useState<FileUploadData>({
    multiple: false,
    format: { label: "KML, KMZ", type: ".kml, .kmz" },
    label: "Upload KML/KMZ File",
  });
  const [file, setFile] = useState<File | null>(null);
  const [map, setMap] = useState<FileCategoryData[]>([]);
  const [mapUrl, setMapUrl] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [istoggle, setIsToggle] = useState<boolean>(false);

  const handleTabSwitch = (id: number) => {
    setTabs((prev) => ({ ...prev, active: id }));
  };

  const getMapData = async () => {
    setLoading(true);
    const response = await assetService.getFilesByCategory(inspectionId, "gis");
    if (response.status === 200) {
      setMap(response.data);
    }
    setLoading(false);
  };

  const fileUpload = async () => {
    if (file) {
      const response = await assetService.uploadFile(
        inspectionId,
        "gis",
        file,
        { title: "gis", description: "gis" },
        () => {}
      );
      if (response.status === 200) {
        getMapData();
        await inspectionService.createCentralizedGis();
      }
    }
  };

  const handleCentralize = async () => {
    const mapData =
      map.find((item) => item.gisType === "KMZ") ||
      map.find((item) => item.gisType === "KML");
    const gisId = mapData?.gisId;
    if (gisId) {
      await inspectionService.addToCentralizedGis(gisId, !istoggle);
    }
  };

  const findRespectiveData = () => {
    const mapData =
      map.find((item) => item.gisType === "KMZ") ||
      map.find((item) => item.gisType === "KML");
    if (mapData) {
      setMapUrl(mapData.fileUrl);
      setIsToggle(!!mapData.optForCentralized);
    }

    const imageData = map.find((item) => item.gisType === "GIS_IMAGE");
    if (imageData) {
      const imageUrl = getValidUrl(imageData.fileUrl, userId ?? "");
      setImage(imageUrl ?? "");
    }
  };

  const deleteGis = async () => {
    const response = await assetService.deleteFilesByCategory(
      inspectionId,
      "gis"
    );
    if (response.status === 202) {
      URL.revokeObjectURL(image);
      setImage("");
      setMapUrl("");
      setMap([]);
    }
  };

  useEffect(() => {
    findRespectiveData();
  }, [map]);

  useEffect(() => {
    if (tabs.active === 1)
      setFileType((prev) => ({
        ...prev,
        format: { type: ".kml, .kmz", label: "KML, KMZ" },
        label: "Upload KML/KMZ File",
      }));
    if (tabs.active === 2)
      setFileType((prev) => ({
        ...prev,
        format: { type: ".jpg, .jpeg, .png", label: "JPG, JPEG, PNG" },
        label: "Upload Image",
      }));
  }, [tabs]);

  useEffect(() => {
    fileUpload();
  }, [file]);

  useEffect(() => {
    getMapData();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 border border-platinum rounded-2xl">
      <div className="w-full flex justify-between gap-4 items-center flex-wrap">
        <div>
          <TabSwitcher
            data={tabs}
            withNormalButton={false}
            switchTab={(id) => handleTabSwitch(id)}
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          {map.length > 0 && tabs.active === 1 && (
            <div className="flex items-center gap-2">
              <h5 className="text-sm text-black whitespace-nowrap">
                Add to Centralized Map
              </h5>
              <div
                className={`w-11 h-6 flex items-center rounded-full p-2 cursor-pointer ${
                  istoggle ? "bg-primary" : "bg-dustyGray"
                }`}
                onClick={() => {
                  setIsToggle(!istoggle);
                  handleCentralize();
                }}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full transform transition-transform duration-300 ${
                    istoggle
                      ? "translate-x-4 bg-ghostWhite"
                      : "-translate-x-1 bg-ghostWhite"
                  }`}
                ></div>
              </div>
            </div>
          )}
          {allowedActions.create && (
            <div>
              <FileUpload
                onChange={(files) => setFile(files[0])}
                data={fileType}
                size="small"
              />
            </div>
          )}
          {map.length > 0 && allowedActions.delete && (
            <div>
              {actions.delete && (
                <ActionButton
                  data={actions.delete}
                  onClick={() => deleteGis()}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-[498px] rounded-lg flex justify-center items-center">
        {loading ? (
          <Skeleton type="box" />
        ) : map.length > 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            {tabs.active === 1 && (
              <>
                {mapUrl ? (
                  <Map url={mapUrl} userId={session?.sub ?? ""} />
                ) : (
                  <p className="text-sm text-liver text-center font-normal">
                    No map view available
                  </p>
                )}
              </>
            )}
            {tabs.active === 2 && (
              <>
                {image ? (
                  <Image
                    src={image}
                    width={500}
                    height={500}
                    className="object-contain rounded-lg w-full h-full"
                    alt="Coords Image"
                    unoptimized
                  />
                ) : (
                  <p className="text-sm text-liver text-center font-normal">
                    No coordinates available
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <p className="text-center text-sm font-normal text-liver">
            No data available
          </p>
        )}
      </div>
    </div>
  );
};

export default ViewMap;
