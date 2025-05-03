import Image from "next/image";
import QuickView from "../../inspection/common/QuickView";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

const SingleInspectionPopup = () => {
  const { inspectionId, setShowPopup, allowedActions } = useAppContext();
  const router = useRouter();

  return (
    <div className="flex flex-col w-full h-full gap-8">
      <div className="flex w-full gap-4 pt-2">
        <h5 className="text-sm xl:text-base font-medium">
          Inspection Quick View
        </h5>
        {allowedActions.download && (
          <div className="cursor-pointer">
            <Image
              src="/images/download.svg"
              className="w-5 xl:w-auto"
              width={24}
              height={24}
              alt="Download"
            />
          </div>
        )}
      </div>
      <div className="w-full">
        <QuickView inPopup={true} />
      </div>
      <div className="w-full flex justify-end pb-4 pr-4">
        <button
          className="flex justify-center items-center border border-platinum rounded-2xl gap-2.5 px-4 py-2.5"
          onClick={() => {
            router.push(`/inspections/${inspectionId}`);
            setShowPopup(false);
          }}
        >
          <h5 className="text-azure text-sm xl:text-sm font-medium">
            View more
          </h5>
          <Image
            src="/images/external-link.svg"
            className="w-5 xl:w-auto cursor-pointer"
            height={24}
            width={24}
            alt="View more"
          />
        </button>
      </div>
    </div>
  );
};

export default SingleInspectionPopup;
