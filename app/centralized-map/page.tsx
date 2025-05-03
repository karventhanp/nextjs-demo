"use client";

import { useAppContext } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { inspectionService } from "@/services/inspectionService";
import Map from "@/components/common/Map";
import Image from "next/image";
import Skeleton from "@/components/common/Skeleton";
import { LoadingData } from "@/types/service";
import Loader from "@/components/common/Loader";

const CentralizedMap = () => {
  const { userId } = useAppContext();
  const [kmzUrl, setKmzUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingData>({
    gis: true,
    inspection: false,
    kpi: false,
  });

  const fetchCentralizedData = async () => {
    setLoading((prev) => ({ ...prev, gis: true }));
    const response = await inspectionService.getCentralizedGis();
    if (response.status == 200) {
      setKmzUrl(response.data.kmz);
    }
    setLoading((prev) => ({ ...prev, gis: false }));
  };

  useEffect(() => {
    fetchCentralizedData();
  }, []);
  return (
    <div className="h-full w-full border border-platinum bg-snow rounded-2xl">
      {loading.gis ? (
        <div className="h-full bg-snow rounded-2xl border flex items-center justify-center border-snow">
          <Loader />
        </div>
      ) : kmzUrl ? (
        <Map url={kmzUrl} userId={userId} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <Image
            src="/images/empty-data.svg"
            width={200}
            height={200}
            alt="No data"
          />
        </div>
      )}
    </div>
  );
};

export default CentralizedMap;
