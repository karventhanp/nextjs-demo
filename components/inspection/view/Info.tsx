import DataCard from "@/components/common/DataCard";
import { InspectionDetailsData } from "@/types/inpection";
import { formatDate } from "@/utils/utils";
import { useEffect, useState } from "react";

interface InfoProps {
  data: InspectionDetailsData | undefined;
  loading?: boolean;
}

const Info: React.FC<InfoProps> = ({ data, loading }) => {
  const [siteInfo, setSiteInfo] = useState<any>();
  const [addressInfo, setAddressInfo] = useState<any>();
  useEffect(() => {
    if (data) {
      const { address, zone, inspectedDate, siteName, ...remaining } = data;
      const updatedAddress = { ...address, zone };
      const updatedSiteInfo = {
        siteName,
        inspectedDate: formatDate(inspectedDate ?? ""),
        ...remaining,
      };
      setSiteInfo(updatedSiteInfo);
      setAddressInfo(updatedAddress);
    }
  }, [data]);
  return (
    <div className="flex flex-col w-full gap-4">
      <DataCard
        title="Site Information"
        data={siteInfo}
        combineKeys={["gpsCoordinates"]}
        loading={loading}
      />
      <DataCard title="Address" loading={loading} data={addressInfo} />
    </div>
  );
};

export default Info;
