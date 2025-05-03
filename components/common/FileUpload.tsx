import Image from "next/image";
import { FileUploadProps } from "@/types/common";
import { capitalizeFirstLetter } from "@/utils/utils";
import { useEffect, useRef, useState } from "react";

const FileUpload: React.FC<FileUploadProps> = ({
  data,
  onChange,
  size,
  logo,
}) => {
  const [files, setFiles] = useState<File[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    data.multiple
      ? setFiles(Array.from(selectedFiles))
      : setFiles([selectedFiles[0]]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const droppedFiles = event.dataTransfer.files;
    if (!droppedFiles) return;

    data.multiple
      ? setFiles(Array.from(droppedFiles))
      : setFiles([droppedFiles[0]]);
  };

  useEffect(() => {
    if (files) onChange(files);
  }, [files]);

  return (
    <>
      {size === "logo" ? (
        <div className="w-full h-full flex gap-4">
          <div
            className="border cursor-pointer border-primary w-1/2 border-dashed flex flex-col gap-3 justify-center items-center rounded-lg p-2"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {logo ? (
              <Image src={logo} width={100} height={80} alt="Logo Preview" className="rounded-md w-25 h-20 max-h-20" />
            ) : (
              <>
                <Image
                  src="/images/plus-black.svg"
                  width={24}
                  height={24}
                  alt="Plus"
                />
                <span className="text-sm text-liver font-medium">Upload</span>
              </>
            )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            multiple={data.multiple}
            accept={data.format.type}
          />
        </div>
        <div className="w-1/2 text-liver font-normal text-xs flex items-center justify-center">
            {data.label}
          </div>
        </div>
      ) : (
        <div
          className={`w-full h-full border ${
            size === "small"
              ? "border-platinum"
              : "border-primary border-dashed"
          } rounded-lg flex flex-col ${
            size === "large" ? "gap-4 p-4" : "gap-2 p-2"
          } justify-between items-center cursor-pointer`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            multiple={data.multiple}
            accept={data.format.type}
          />
          {size === "small" ? (
            <div className="flex gap-2 cursor-pointer items-center">
              <Image
                src="/images/upload.svg"
                height={24}
                width={24}
                alt="Upload File"
              />
              <label className="font-medium text-sm text-liver cursor-pointer">
                {data.label}
              </label>
            </div>
          ) : (
            <>
              {size === "large" && (
                <Image
                  src={`/images/${data.imgUrl}`}
                  alt="Upload"
                  width={60}
                  height={53.79}
                />
              )}
              <h5 className="text-sm text-smokyBlack font-normal text-center">
                Drag & drop to upload
              </h5>
              <span className="text-xs text-smokyBlack font-normal text-center">
                or
              </span>
              <label className="text-xs text-royalBlue font-normal cursor-pointer text-center">
                Select {capitalizeFirstLetter(data.type ?? "")}
              </label>
              <label className="text-xs text-liver font-normal cursor-pointer text-center">
                {capitalizeFirstLetter(data.type ?? "")} format:{" "}
                {data.format.label}
              </label>
              {files && files.length > 0 && data.type === "large" && (
                <div className="flex gap-2 w-full flex-wrap items-center">
                  {files.map((file, index) => (
                    <span
                      className="text-xs w-full text-smokyBlack flex text-center font-normal justify-center items-center"
                      key={index}
                    >
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FileUpload;
