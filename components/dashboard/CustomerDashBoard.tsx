"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Map from "../common/Map";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import { inspectionService } from "@/services/inspectionService";
import { InspectionData } from "@/types/inpection";
import { formatDate } from "@/utils/utils";
import { useAppContext } from "@/context/AppContext";
import { useSession } from "next-auth/react";
import Skeleton from "@/components/common/Skeleton";
import { useRouter } from "next/navigation";
import { getCustomerId, groupDataByTimePeriod } from "@/helpers/helper";
import DropDown from "@/components/common/DropDown";
import { kpiService } from "@/services/kpiService";
import { LoadingData } from "@/types/service";
import { convertToKm } from "@/utils/utils";

const CustomerDashBoard = () => {
  const [inspections, setInspections] = useState<InspectionData[] | []>([]);
  const [barChartData, setBarChartData] = useState<Record<string, number>>({});
  const [totalDistance, setTotalDistance] = useState(0);
  const [siteCount, setSiteCount] = useState(0);
  const [pieChart, setPieChart] = useState<number[]>([]);
  const [timePeriod, setTimePeriod] = useState("10days");
  const [isOpen, setIsOpen] = useState(false);
  const { setShowPopup, setPopupType, setInspectionId, userId, customerId } =
    useAppContext();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<LoadingData>({
    inspection: true,
    kpi: true,
    gis: true,
  });
  const router = useRouter();
  const [kmzUrl, setKmzUrl] = useState<string | null>(null);

  const fetchRecentMapData = async () => {
    setLoading((prev) => ({ ...prev, gis: true }));
    const response = await inspectionService.getCentralizedGis({
      last10DaysOnly: true,
    });
    if (response.data) {
      setKmzUrl(response.data.kmz);
    }
    setLoading((prev) => ({ ...prev, gis: false }));
  };

  const timePeriodOptions = [
    { key: "10days", value: "Last 10 days" },
    { key: "1months", value: "Last 1 month" },
    { key: "3months", value: "Last 3 months" },
    { key: "6months", value: "Last 6 months" },
    { key: "1years", value: "Last 1 year" },
  ];

  const selectedValue =
    timePeriodOptions.find((opt) => opt.key === timePeriod)?.value ||
    timePeriod;

  const getInspection = async () => {
    setLoading((prev) => ({ ...prev, inspection: true }));
    const response = await inspectionService.getInspection();
    const records = response.data.records;
    if (records.length > 0) {
      setInspections(records);
    }
    setLoading((prev) => ({ ...prev, inspection: false }));
  };
  const getBarChartData = async (timePeriodKey: string) => {
    setLoading((prev) => ({ ...prev, kpi: true }));
    const response = await kpiService.getKPI(timePeriodKey, customerId);
    const { data } = response;
    const total = data.totalDistance || 0;
    setTotalDistance(total);
    const site = data.siteInspectedCount || 0;
    setSiteCount(site);
    const filterData = {
      structuralDefectCount: data.structuralDefectCount || 0,
      deformedCount: data.deformedCount || 0,
      depositCount: data.depositCount || 0,
      blockageCount: data.blockageCount || 0,
    };
    const pieChartData = Object.values(filterData);
    setPieChart(pieChartData);
    const barChart = data.barChart;

    if (Object.keys(barChart).length === 0) {
      return;
    }
    const groupedBarChart = groupDataByTimePeriod(barChart, timePeriodKey);
    setBarChartData(groupedBarChart);
    setLoading((prev) => ({ ...prev, kpi: false }));
  };

  const handleChangeTimePeriod = (key: string) => {
    setTimePeriod(key);
    getBarChartData(key);
  };

  useEffect(() => {
    getBarChartData(timePeriod);
  }, [timePeriod, customerId]);

  useEffect(() => {
    if (getCustomerId()) {
      fetchRecentMapData();
    }
  }, [customerId]);

  useEffect(() => {
    if (getCustomerId()) {
      getInspection();
    }
  }, [customerId]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="rounded-3xl bg-snow p-4 flex flex-col gap-4 lg:h-100 lg:max-h-100 2xl:min-h-125">
        <div className="flex justify-between items-center w-full">
          <h5 className="font-medium text-base text-smokyBlack">Overview</h5>
          <div className="relative">
            <div
              className="flex px-4 py-3 gap-2 border border-platinum rounded-2xl bg-ghostWhite cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="text-liver text-sm">{selectedValue}</span>
              <Image
                src="/images/chevron-down-icon.svg"
                width={16}
                height={16}
                alt="Down Arrow Icon"
              />
            </div>
            {isOpen && (
              <DropDown
                show={isOpen}
                setShow={setIsOpen}
                options={timePeriodOptions.map((opt) => opt.value)}
                onChange={(value) => {
                  const selectedKey = timePeriodOptions.find(
                    (opt) => opt.value === value
                  )?.key;
                  if (selectedKey) {
                    handleChangeTimePeriod(selectedKey);
                    setIsOpen(false);
                  }
                }}
              />
            )}
          </div>
        </div>
        <div className="w-full flex-wrap lg:flex-nowrap flex gap-4 h-full justify-between scrollbar-none overflow-x-scroll">
          <div className="rounded-2xl h-75 sm:h-76.5 w-full bg-ghostWhite lg:h-full md:w-[41.5%] md:max-w-1/2 xl:w-1/2 xl:min-w-1/2 border border-platinum p-4">
            {loading.kpi ? (
              <Skeleton type="box" />
            ) : (
              <BarChart data={barChartData} />
            )}
          </div>
          <div className="flex flex-wrap sm:flex-nowrap sm:h-75 lg:h-full w-full gap-4 md:w-1/2 flex-grow">
            <div className="flex flex-col w-full justify-between gap-4 sm:min-w-12/25 md:w-64 md:min-w-64 2xl:w-1/2">
              {loading.kpi ? (
                <Skeleton type="box" />
              ) : (
                <div className="2xl:h-1/2 w-full rounded-2xl bg-ghostWhite border border-platinum p-4 flex justify-between items-center">
                  <div className="flex flex-col py-3 gap-2">
                    <span className="font-medium text-3.5xl text-smokyBlack">
                      {convertToKm(totalDistance.toString())}
                    </span>
                    <span className="text-liver text-base font-normal">
                      Total Distance
                    </span>
                  </div>
                  <Image
                    src="/images/pipe-construction-icon.svg"
                    width={60}
                    height={60}
                    alt="Pipe Construction Icon"
                  />
                </div>
              )}
              {loading.kpi ? (
                <Skeleton type="box" />
              ) : (
                <div className="2xl:h-1/2 rounded-2xl bg-ghostWhite border border-platinum p-4 flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <span className="text-smokyBlack font-medium text-3.5xl">
                      {siteCount || 0}
                    </span>
                    <span className="text-liver text-base font-normal">
                      Site Inspected
                    </span>
                  </div>
                  <Image
                    src="/images/list-icon.svg"
                    width={60}
                    height={60}
                    alt="List Icon"
                  />
                </div>
              )}
            </div>
            <div className="flex w-full md:w-1/2 h-75 sm:h-full rounded-2xl bg-ghostWhite border border-platinum p-4">
              {loading.kpi ? (
                <Skeleton type="box" />
              ) : (
                <PieChart data={pieChart} />
              )}
            </div>
          </div>
        </div>
      </div>
      {getCustomerId() && (
        <div className="flex flex-col lg:flex lg:flex-row gap-5 lg:h-100 xl:h-128.5">
          <div className="sm:w-full p-4 lg:w-1/2 h-full bg-snow rounded-3xl gap-4 flex flex-col flex-grow">
            {loading.inspection ? (
              <Skeleton type="box" />
            ) : inspections.length > 0 ? (
              <>
                <div className="flex justify-between">
                  <h5 className="text-base text-liver font-medium">
                    Recent Inspection Data
                  </h5>
                  <h5
                    className="text-sm text-liver font-medium cursor-pointer"
                    onClick={() => router.push("/inspections")}
                  >
                    View All
                  </h5>
                </div>
                <div className="flex flex-col h-full overflow-y-hidden">
                  <div className="grid grid-cols-12 font-normal border border-platinum bg-ghostWhite text-sm text-liver rounded-2xl">
                    <h5 className="col-span-3 xl:col-span-4 px-2.5 py-3.75 truncate">
                      Site name
                    </h5>
                    <h5 className="col-span-4 xl:col-span-5 px-2.5 py-3.75 truncate">
                      Address
                    </h5>
                    <h5 className="col-span-3 xl:col-span-2 px-2.5 py-3.75 truncate">
                      Date
                    </h5>
                    <h5 className="col-span-2 xl:col-span-1 px-2.5 py-3.75 text-center truncate">
                      View
                    </h5>
                  </div>
                  <div className="overflow-y-scroll scrollbar-none h-full pt-2">
                    {inspections.map((inspection, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 text-sm font-normal cursor-pointer text-smokyBlack hover:bg-ghostWhite rounded-2xl"
                        onClick={() => {
                          setInspectionId(inspection.id);
                          router.push(`/inspections/${inspection.id}`);
                        }}
                      >
                        <h5 className="col-span-3 xl:col-span-4 px-2.5 py-3.75 truncate">
                          {inspection.siteName}
                        </h5>
                        <h5 className="col-span-4 xl:col-span-5 px-2.5 py-3.75 text-liver truncate">
                          {inspection.siteAddress}
                        </h5>
                        <h5 className="col-span-3 xl:col-span-2 px-2.5 py-3.75 text-liver truncate">
                          {formatDate(inspection.inspectedDate)}
                        </h5>
                        <h5
                          className="col-span-2 xl:col-span-1 px-2.5 py-3.75"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectionId(inspection.id);
                            setPopupType("single-inspection");
                            setShowPopup(true);
                          }}
                        >
                          <Image
                            src="/images/tabler-eye-icon.svg"
                            width={24}
                            height={24}
                            alt="Tabler Eye Icon"
                            className="m-auto w-5 xl:w-auto"
                          />
                        </h5>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 items-center justify-center h-full">
                <h5 className="text-sm font-normal text-liver">
                  No inspections were found.
                </h5>
                <Image
                  src="/images/empty-data.svg"
                  width={240}
                  height={240}
                  alt="Empty Data"
                />
              </div>
            )}
          </div>
          <div className="w-full h-75 sm:h-125 p-4 lg:w-1/2 lg:h-full flex gap-2 flex-col bg-snow rounded-3xl flex-grow">
            {loading.gis ? (
              <Skeleton type="box" />
            ) : kmzUrl ? (
              <>
                <h5 className="font-medium text-base text-liver pb-2">
                  Recent Centralized Map view
                </h5>
                <Map url={kmzUrl} userId={userId} />
              </>
            ) : (
              <div className="w-full h-full flex justify-center items-center flex-col">
                <h5 className="text-sm font-normal text-liver">
                  No centralized map were found.
                </h5>
                <Image
                  src="/images/empty-data.svg"
                  width={240}
                  height={240}
                  alt="No data"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashBoard;
