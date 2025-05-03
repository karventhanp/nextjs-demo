import { useEffect, useState } from "react";
import { Actions, FileUploadData } from "@/types/common";
import FileUpload from "@/components/common/FileUpload";
import { assetService } from "@/services/assetService";
import { useAppContext } from "@/context/AppContext";
import { VideoData } from "@/types/response";
import VideoPlayer from "@/components/common/VideoPlayer";
import { useSession } from "next-auth/react";
import Skeleton from "@/components/common/Skeleton";
import DefectFields from "../common/DefectFields";
import { ImageFormMetaData } from "@/types/inpection";
import { IconBox } from "@/components/common/IconBox";
import LegacyUploadVideo from "../create/LegacyUploadVideo";
import { IconBoxActions } from "@/types/inpection";
import { updateAction } from "@/helpers/helper";

const ViewVideos = () => {
  const [fileType, setFileType] = useState<FileUploadData>({
    multiple: false,
    format: { label: "MP4, AVI, WEBM", type: ".mp4, , .avi, .webm" },
    label: "Upload Video",
  });
  const [file, setFile] = useState<File | null>(null);
  const { inspectionId } = useAppContext();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData>();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [defects, setDefects] = useState<string[]>([]);
  const [directions, setDirections] = useState<string[]>([]);
  const metaDatStruture = {
    distance: {
      error: null,
      label: "Distance",
      name: "distance",
      required: false,
      value: "",
    },
    timestamp: {
      error: null,
      label: "Time",
      name: "timestamp",
      required: false,
      value: "",
    },
    direction: {
      error: null,
      label: "Direction",
      name: "direction",
      required: false,
      value: "",
    },
    defectTypeId: {
      error: null,
      label: "Defect",
      name: "defectTypeId",
      required: false,
      value: "",
    },
    severity: {
      error: null,
      label: "Severity",
      name: "severity",
      required: false,
      value: "",
    },
  };
  const [form, setForm] = useState<ImageFormMetaData[]>([]);
  const [seek, setSeek] = useState<string>("");
  const [videActions, setVideoActions] = useState<IconBoxActions[]>([]);
  const { allowedActions } = useAppContext();

  const handleActions = async (name: string, fileId: string) => {
    if (name === "delete") {
      setVideoActions((prev) => updateAction(prev, fileId, "delete", true));
      const response = await assetService.deleteFileById("video", fileId);
      if (response.status === 200) {
        getVideos();
      }
      setVideoActions((prev) => updateAction(prev, fileId, "delete", false));
    }
  };

  const isLoading = (imgId: string, action: Actions): boolean => {
    return videActions.some(
      (item) => item.id === imgId && item.action === action && item.loading
    );
  };

  const getVideos = async () => {
    setLoading(true);
    const response = await assetService.getFilesByCategory(
      inspectionId,
      "video"
    );
    if (response.status === 200) {
      setVideos(response.data);
    }
    setLoading(false);
  };

  const createFormEntry = () => metaDatStruture;

  useEffect(() => {
    if (!selectedVideo?.imagesTimestampFields) return;

    const data: ImageFormMetaData[] = selectedVideo.imagesTimestampFields.map(
      (field) => {
        const formEntry = createFormEntry();

        return {
          ...formEntry,
          distance: { ...formEntry.distance, value: field.distance },
          timestamp: { ...formEntry.timestamp, value: field.timestamp },
          direction: { ...formEntry.direction, value: field.direction },
          defectTypeId: {
            ...formEntry.defectTypeId,
            value: field.defect ? field.defect.name : "",
          },
          severity: {
            ...formEntry.severity,
            value: field.defect ? field.defect.severity : "",
          },
        };
      }
    );
    setForm(data);
  }, [selectedVideo]);

  useEffect(() => {
    if (videos.length > 0) {
      setSelectedVideo(videos[0]);
    }
  }, [videos]);

  useEffect(() => {
    getVideos();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {allowedActions.create && file ? (
        <LegacyUploadVideo
          viewFlow={true}
          sharedVideo={file}
          cancel={() => {
            setFile(null);
            getVideos();
          }}
        />
      ) : (
        <>
          <div className="w-full flex flex-col gap-4 border border-platinum p-4 rounded-2xl">
            <div className="w-full gap-4 flex justify-between flex-wrap md:flex-nowrap">
              <div className="flex flex-col gap-1 flex-wrap w-[80%]">
                <h5 className="text-sm text-smokyBlack font-medium">
                  {selectedVideo && selectedVideo.title}
                </h5>
                <span className="text-xs text-liver font-normal">
                  {selectedVideo && selectedVideo.description}
                </span>
              </div>
              {allowedActions.create && (
                <div className="flex h-fit w-fit min-w-fit">
                  <FileUpload
                    onChange={(files) => setFile(files[0])}
                    data={fileType}
                    size="small"
                  />
                </div>
              )}
            </div>
            <div className="w-full h-full md:h-[60vh] flex gap-4 flex-col md:flex-row">
              {loading ? (
                <div className="w-full h-full rounded-lg">
                  <Skeleton type="box" />
                </div>
              ) : (
                <>
                  {videos.length > 0 ? (
                    <>
                      <div className="w-full md:w-[75%] h-full">
                        {selectedVideo && (
                          <VideoPlayer
                            userId={session?.sub ?? ""}
                            url={selectedVideo?.videoUrl}
                            control={true}
                            className="rounded-lg"
                            autoPlay={true}
                            privateUrl={true}
                            canDownload={false}
                            seek={seek}
                          />
                        )}
                      </div>
                      <div className="w-full md:w-[25%] flex h-full flex-col gap-4">
                        <div className="flex flex-col gap-4 w-full h-full">
                          <h5 className="text-sm text-smokyBlack font-medium">
                            More videos
                          </h5>
                          <div className="flex flex-col h-full gap-4 border p-2 border-platinum rounded-lg w-full overflow-y-auto custom-scrollbar">
                            {videos.map((video, index) => (
                              <div
                                key={index}
                                className={`border ${
                                  selectedVideo?.videoId === video.videoId
                                    ? "border-primary"
                                    : "border-platinum"
                                } rounded-lg w-full flex flex-col group`}
                              >
                                <div
                                  className="cursor-pointer relative"
                                  onClick={() => setSelectedVideo(video)}
                                >
                                  <VideoPlayer
                                    userId={session?.sub ?? ""}
                                    url={video?.videoUrl}
                                    privateUrl={true}
                                    control={false}
                                    canDownload={false}
                                    className="rounded-t-lg"
                                  />
                                  {allowedActions.delete && (
                                    <div className="absolute top-2 right-2 hidden group-hover:block">
                                      <IconBox
                                        action="delete"
                                        icon="delete-icon.svg"
                                        onClick={(name) =>
                                          handleActions(name, video.videoId)
                                        }
                                        loading={isLoading(
                                          video.videoId,
                                          "delete"
                                        )}
                                      />
                                    </div>
                                  )}
                                  {allowedActions.edit && (
                                    <div className="absolute top-2 left-2 hidden group-hover:block">
                                      <IconBox
                                        action="edit"
                                        icon="edit.svg"
                                        onClick={(name) =>
                                          handleActions(name, video.videoId)
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 w-full p-2 bg-snow rounded-lg group-hover:bg-ghostWhite">
                                  <h5 className="text-sm text-smokyBlack font-medium">
                                    {video.title}
                                  </h5>
                                  <span className="text-xs text-liver font-normal">
                                    {video.description}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="font-normal text-liver text-sm items-center justify-center w-full flex">
                      No videos available
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          {selectedVideo &&
            selectedVideo?.imagesTimestampFields?.length > 0 &&
            form.length === selectedVideo.imagesTimestampFields.length && (
              <div className="border border-platinum p-4 rounded-2xl flex flex-col gap-4">
                {selectedVideo.imagesTimestampFields.map((field, index) => (
                  <div key={index}>
                    <DefectFields
                      handleInput={() => {}}
                      handleUnitChange={() => {}}
                      units={["M", "Km"]}
                      index={index}
                      form={form[index]}
                      defects={defects}
                      directions={directions}
                      image={field.imageUrl}
                      canEdit={false}
                      onClick={(time) => setSeek(time)}
                      hideLabel={window.innerWidth < 768 ? false : index !== 0}
                    />
                  </div>
                ))}
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default ViewVideos;
