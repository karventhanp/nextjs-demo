import { useAppContext } from "@/context/AppContext";
import { formatDate } from "@/utils/utils";

const SelectedInspectionsPopup = () => {
  const { inspectionData } = useAppContext();

  return (
    <div className="w-full flex flex-col gap-10">
      <h5 className="text-sm xl:text-base font-medium pt-2">
        Selected Inspections
      </h5>
      <div className="flex flex-col w-full">
        <div className="grid grid-cols-12 text-sm xl:text-base text-liver gap-2 px-3 py-4 border border-platinum rounded-xl font-medium bg-ghostWhite">
          <div className="col-span-4">Site name</div>
          <div className="col-span-6">Site address</div>
          <div className="col-span-2">Date</div>
        </div>
        <div className="pt-2 h-[50vh] overflow-scroll scrollbar-none">
          {inspectionData.map((inspection, index) => (
            <div
              className="grid grid-cols-12 gap-2 text-sm xl:text-base px-3 py-4 hover:bg-ghostWhite rounded-xl font-medium"
              key={index}
            >
              <div className="col-span-4">{inspection.siteName}</div>
              <div className="col-span-6 truncate">
                {inspection.siteAddress}
              </div>
              <div className="col-span-2">
                {formatDate(inspection.inspectedDate)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectedInspectionsPopup;
