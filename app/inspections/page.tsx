"use client";

import { Button } from "@/components/common/Buttons";
import Image from "next/image";
import { ActionDropDown, InspectionData } from "@/types/inpection";
import React, { useEffect, useState } from "react";
import { inspectionService } from "@/services/inspectionService";
import { formatDate, removeLocalStorage } from "@/utils/utils";
import Skeleton from "@/components/common/Skeleton";
import { Loading, PaginationData, Sort } from "@/types/common";
import Pagination from "@/components/common/Pagination";
import { useAppContext } from "@/context/AppContext";
import { useRef } from "react";
import useClickOutside from "@/hooks/useClickOutside";
import { useRouter } from "next/navigation";
import DropDown from "@/components/common/DropDown";
import { InspectionReport } from "@/components/common/InspectionReport";
import { downloadPdfFile } from "@/utils/utils";
import { IconBox } from "@/components/common/IconBox";
import { FilterInput } from "@/components/common/Inputs";
import { FilterInputForm, Option } from "@/types/input";
import OptimizedDropDown from "@/components/common/OptimizedDropDown";
import { debounceFunction } from "@/helpers/helper";

const Inspections = () => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const {
    setShowPopup,
    setPopupType,
    setInspectionData,
    setInspectionId,
    allowedActions,
    customerId,
    zone,
    userId,
  } = useAppContext();
  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showZone, setShowZone] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string | undefined>();
  const [zoneKeyword, setZoneKeyword] = useState<string | undefined>();
  const [filterItem, setFilterItem] = useState<string | undefined>("both");
  const [sortBy, setSortBy] = useState<Sort>({ column: "date", order: "DESC" });
  const [pagination, setPagination] = useState<PaginationData>();
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [showStatus, setShowStatus] = useState<boolean>(false);
  const [selectedStaus, setSelectedStatus] = useState<string | undefined>();
  const search: FilterInputForm = {
    value: "Search",
    calendar: true,
    dropDown: true,
    searchIcon: true,
    placeholder: 'Search',
    isZoneFilter: false,
    isAutoComplete: true,
  };
  const zoneSelector: FilterInputForm = {
    value: "Zone",
    calendar: false,
    dropDown: false,
    searchIcon: false,
    placeholder: 'Select Zone',
    isZoneFilter: true,
    flex: 'flex-2',
    isAutoComplete: false,
  };
  const statusOptions: Option[] = [{ label: 'Open', value: 'open', name: 'open', className: 'bg-mistyRose text-intenseRed border border-platinum grid place-content-center w-full rounded-lg' }, { label: 'Closed', value: 'closed', name: 'closed', className: 'text-cadmium bg-ivory border border-platinum rounded-lg w-full grid place-content-center' }, { label: 'All', value: 'all', name: 'all', className: 'bg-white text-black border border-platinum grid place-content-center w-full rounded-lg' },];
  const [date, setDate] = useState<{
    from: Date | null;
    to: Date | null;
  }>();
  const [loading, setLoading] = useState<Loading>({
    name: "getInspection",
    state: false,
  });
  const [selectedInspections, setSelectedInspections] = useState<
    InspectionData[]
  >([]);
  const [showActions, setShowActions] = useState<{
    show: boolean;
    id: string | null;
  }>({ id: null, show: false });
  const [actionDropDown, setActionDropDown] = useState<ActionDropDown[]>([]);
  const rootPath = "inspections";
  const router = useRouter();

  const getInspections = async (page?: number) => {
    showCalendar && setShowCalendar(false);
    setLoading((prev) => ({ ...prev, state: true }));

    let params = `sortBy=${sortBy.column}&sortOrder=${sortBy.order}`;
    if (keyword) {
      params = `&keyword=${keyword}`;
    }

    if (zoneKeyword) {
      params = params + "&zone=" + zoneKeyword;
    }

    if (selectedStaus === 'open' || selectedStaus === 'closed') {
      const status = selectedStaus === 'open' ? true : false;
      params = params + "&status=" + status;
    }

    if (filterItem) {
      params = params + "&searchBy=" + filterItem;
    }

    if (date && date.from && date.to) {
      params =
        params +
        "&startDate=" +
        date.from.toLocaleDateString("en-GB") +
        "&endDate=" +
        date.to.toLocaleDateString("en-GB");
    }

    if (page) {
      params = params + "&startPage=" + page;
    }

    const { data } = await inspectionService.getInspection(params);

    setPagination({
      currentPage: data.currentPage,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      totalRecords: data.totalRecords,
    });
    setLoading((prev) => ({ ...prev, state: false }));
    setInspections(data.records);
  };

  const createInspection = () => {
    removeLocalStorage("COMPIID");
    removeLocalStorage("IID");
    router.push(rootPath + "/create");
  };

  const isSelected = (inspection: InspectionData) => {
    return selectedInspections.some((item) => item.id === inspection.id);
  };

  const isAllSelected = (inspections: InspectionData[]) => {
    const selectedIds = selectedInspections.map((item) => item.id);
    return inspections.every((item) => selectedIds.includes(item.id));
  };

  const selectAllInspections = (all: boolean) => {
    setSelectAll(all);
    if (!all) {
      setSelectedInspections([]);
    }
  };

  const selectForExport = (inspection: InspectionData) => {
    setSelectedInspections((prev) => {
      const prevInspections = prev ?? [];
      return prevInspections.some((item) => item.id === inspection.id)
        ? prevInspections.filter((item) => item.id !== inspection.id)
        : [...prevInspections, inspection];
    });
  };

  const selectAllForExport = (inspections: InspectionData[], all: boolean) => {
    setSelectedInspections((prev) => {
      const prevIds = new Set(prev.map((item) => item.id));
      if (all) {
        const newSelections = inspections.filter(
          (item) => !prevIds.has(item.id)
        );
        return [...prev, ...newSelections];
      } else {
        return prev.filter(
          (item) => !inspections.some((ins) => ins.id === item.id)
        );
      }
    });
  };

  const toggleSortOrder = (column: Sort["column"]) => {
    setSortBy((prev) =>
      prev.column === column
        ? { ...prev, order: prev.order === "ASC" ? "DESC" : "ASC" }
        : { column, order: "ASC" }
    );
  };

  const navigateToInspection = (id: string) => {
    setInspectionId(id);
    router.push(rootPath + "/" + id);
  };
  
  const handleDownloadClick = (date: any) => {
  if (date?.from && date?.to) {
     const startDate = date.from.toLocaleDateString("en-GB");
     const endDate = date.to.toLocaleDateString("en-GB");
     handleDateRangeDownload(startDate, endDate);
    }
  };

  const handleDateRangeDownload = async (
    startDate: string,
    endDate: string
  ) => {
    setLoading((prev) => ({ ...prev, state: true }));

    const response = await inspectionService.downloadReport({
      startDate,
      endDate,
    });
    if (response.status === 200 && response.data) {
      await downloadPdfFile({
        component: <InspectionReport data={response.data} userId={userId} />,
        fileName: `${response.data.data.reportMeta.preparedFor}${startDate}${endDate}`,
      });
    }
    setLoading((prev) => ({ ...prev, state: false }));
  };

  const proceedAction = async (name: string, id: string) => {
    if (name === "delete") {
      const response = await inspectionService.deleteInspection(id);
      if (response.status === 202) {
        getInspections(pageNumber);
      }
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setShowStatus(false);
  }

  useEffect(() => {
    if (allowedActions) {
      const deleteAction: ActionDropDown[] = allowedActions.delete
        ? [
          {
            action: "delete",
            image: "delete-icon.svg",
            label: "Delete Inspection",
          },
        ]
        : [];
      const downloadAction: ActionDropDown[] = allowedActions.download
        ? [
          {
            action: "download",
            image: "download.svg",
            label: "Download Report",
          },
        ]
        : [];
      setActionDropDown(deleteAction.concat(downloadAction));
    }
  }, [allowedActions]);

  useEffect(() => {
    if (date?.from && date?.to) {
      getInspections();
    } else if (date && !date.from && !date.to) {
      getInspections();
    }
  }, [date]);

  useEffect(() => {
    getInspections();
  }, [zoneKeyword, selectedStaus, sortBy, customerId]);

  useEffect(() => {
    if (keyword !== undefined) {
      const debouncedFunction = debounceFunction(getInspections);
      return () => {
        clearTimeout(debouncedFunction);
      }
    }
  }, [keyword]);

  useClickOutside([calendarRef], () => {
    setShowCalendar(false);
  });

  return (
    <div className="w-full h-screen sm:h-full px-4 pt-4 pb-2 bg-snow rounded-2xl flex flex-col gap-4 overflow-x-auto">
      <div className="flex gap-x-6 gap-y-4 items-center w-full justify-between flex-wrap">
        <div className="w-full sm:w-auto">
          <IconBox
            action="back"
            icon="left-arrow.svg"
            className="!bg-ghostWhite !rounded-2xl p-2.5 border-platinum border"
          />
        </div>
        <div className="w-full sm:w-[86%] md:w-[90%] lg:flex-1">
          <FilterInput
            props={search}
            onChange={setKeyword}
            onDateChange={setDate}
            onFilterItemChange={setFilterItem}
          />
        </div>
        <div className="w-full sm:w-[65%] md:w-[65%] lg:w-auto">
          <FilterInput
            props={zoneSelector}
            onChange={setZoneKeyword}
            option={zone}
          />
        </div>
        {allowedActions.create && (
          <div className="w-full sm:w-[30%] lg:w-fit create-inspection-btn">
            <Button
              onClick={createInspection}
              name="Create Inspection"
              loading={false}
              disabled={false}
            />
          </div>
        )}
      </div>
      {selectedInspections && selectedInspections.length > 0 && (
        <div className="rounded-lg p-3 bg-ghostWhite flex justify-between w-full">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <label className="text-smokyBlack text-sm font-medium">
                Selected (
                {selectAll
                  ? pagination?.totalRecords
                  : selectedInspections?.length}
                )
              </label>
              {!selectAll && (
                <Image
                  src="/images/popup.svg"
                  className="w-5 cursor-pointer"
                  width={24}
                  height={24}
                  alt="Show selected inspections"
                  onClick={() => {
                    {
                      setPopupType("selected-inspections");
                      setInspectionData(selectedInspections);
                      setShowPopup(true);
                    }
                  }}
                />
              )}
            </div>
          </div>
          <div className="flex gap-5 items-center">
            {selectAll ||
              selectedInspections.length === pagination?.totalRecords ? (
              <h5
                className="text-azure font-medium text-xs p-2 cursor-pointer hover:bg-azure/10 rounded-lg"
                onClick={() => selectAllInspections(false)}
              >
                Clear all {pagination?.totalRecords} inspections
              </h5>
            ) : (
              <h5
                className="text-azure font-medium text-xs p-2 cursor-pointer hover:bg-azure/10 rounded-lg"
                onClick={() => selectAllInspections(true)}
              >
                Select all {pagination?.totalRecords} inspections
              </h5>
            )}
            {allowedActions.download && (
              <Image
               onClick={() => handleDownloadClick(date)}
                src="/images/download.svg"
                className="w-5 xl:w-auto"
                width={24}
                height={24}
                alt="Download Report"
              />
            )}
            {allowedActions.delete && (
              <Image
                onClick={() => setSelectedInspections([])}
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
      <div
        className={`w-full h-full overflow-x-auto scrollbar-none relative ${selectAll && "opacity-15 pointer-events-none"
          }`}
      >
        {loading.state ? (
          <div className="min-w-max sm:min-w-full">
            <Skeleton type="table" />
          </div>
        ) : inspections &&
          (selectedStaus !== "both" || inspections.length > 0) ? (
          <div className="min-w-max sm:min-w-full relative">
            <div className="grid grid-cols-12 gap-x-2 bg-ghostWhite border border-platinum rounded-lg text-sm font-medium">
              <div className="col-span-3 flex gap-4 items-center p-2">
                <div
                  className={`min-w-10 h-10 justify-center items-center rounded-full hover:bg-platinum cursor-pointer ${isAllSelected(inspections) ? "hidden" : "flex"
                    }`}
                  onClick={() => selectAllForExport(inspections, true)}
                >
                  <Image
                    src="/images/checkbox.svg"
                    className={`w-5 xl:w-auto`}
                    width={24}
                    height={24}
                    alt="Select All Inspections"
                  />
                </div>
                <div
                  className={`min-w-10 h-10 justify-center items-center rounded-full cursor-pointer hover:bg-platinum ${isAllSelected(inspections) ? "flex" : "hidden"
                    }`}
                  onClick={() => selectAllForExport(inspections, false)}
                >
                  <Image
                    src="/images/checkbox-active.svg"
                    className={`w-5 xl:w-auto`}
                    width={24}
                    height={24}
                    alt="Select All Inspections"
                  />
                </div>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleSortOrder("name")}
                >
                  <label
                    className={`cursor-pointer ${sortBy.column === "name" ? "text-primary" : "text-liver"
                      }`}
                  >
                    Site name
                  </label>
                  <Image
                    src={`/images/${sortBy.column === "name" ? "down-green" : "down"
                      }.svg`}
                    className={`w-5 xl:w-auto ${sortBy.column === "name" && sortBy.order === "ASC"
                        ? "rotate-180"
                        : ""
                      }`}
                    width={24}
                    height={24}
                    alt="Switch to DESC | ASC"
                  />
                </div>
              </div>
              <div className="col-span-4 flex gap-4 items-center p-2">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleSortOrder("address")}
                >
                  <label
                    className={`cursor-pointer ${sortBy.column === "address"
                        ? "text-primary"
                        : "text-liver"
                      }`}
                  >
                    Site address
                  </label>
                  <Image
                    src={`/images/${sortBy.column === "address" ? "down-green" : "down"
                      }.svg`}
                    className={`w-5 xl:w-auto ${sortBy.column === "address" && sortBy.order === "ASC"
                        ? "rotate-180"
                        : ""
                      }`}
                    width={24}
                    height={24}
                    alt="Switch to DESC | ASC"
                  />
                </div>
              </div>
              <div className="col-span-2 flex gap-4 items-center justify-center p-2">
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleSortOrder("date")}
                >
                  <label
                    className={`cursor-pointer ${sortBy.column === "date" ? "text-primary" : "text-liver"
                      }`}
                  >
                    Date
                  </label>
                  <Image
                    src={`/images/${sortBy.column === "date" ? "down-green" : "down"
                      }.svg`}
                    className={`w-5 xl:w-auto ${sortBy.column === "date" && sortBy.order === "ASC"
                        ? "rotate-180"
                        : ""
                      }`}
                    width={24}
                    height={24}
                    alt="Switch to DESC | ASC"
                  />
                </div>
              </div>
              <div
                className="col-span-1 flex items-center justify-center p-2 relative cursor-pointer"
                onClick={() => setShowStatus(!showStatus)}
              >
                <label
                  className={`min-w-24 text-liver ${showStatus && "bg-lightGray"
                    } flex items-center p-2 gap-2 text-sm rounded-lg relative cursor-pointer`}
                >
                  Status
                  <Image
                    src="/images/selector.svg"
                    className="w-5 cursor-pointer"
                    width={24}
                    height={24}
                    onClick={() => setShowZone(!showZone)}
                    alt="Selector"
                  />
                </label>
                <OptimizedDropDown
                  options={statusOptions}
                  setShow={setShowStatus}
                  show={showStatus}
                  onChange={(_, status) => handleStatusChange(status)}
                />
              </div>
              <div className="col-span-2 flex items-center justify-center p-2">
                View
              </div>
            </div>
            {inspections.length > 0 ? (
              <div
                className={`w-full ${!selectedInspections || selectedInspections.length <= 0
                    ? "sm:h-[calc(100vh-16.8rem)] xl:h-[calc(100vh-17.3rem)]"
                    : "sm:h-[calc(100vh-21rem)] xl:h-[calc(100vh-21.8rem)]"
                  }  flex flex-col gap-2 overflow-auto scrollbar-none pt-2`}
              >
                {inspections?.map((inspection, index) => (
                  <div
                    onClick={() => navigateToInspection(inspection.id)}
                    className={`grid grid-cols-12 items-center gap-x-2 rounded-lg text-sm font-medium hover:bg-ghostWhite cursor-pointer ${isSelected(inspection) &&
                      "bg-primary/5 hover:bg-primary/10"
                      }`}
                    key={index}
                  >
                    <div className="col-span-3 flex gap-4 items-center p-2">
                      <div
                        className={`min-w-10 h-10 rounded-full items-center ${isSelected(inspection) ? "hidden" : "flex"
                          } justify-center hover:bg-platinum`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectForExport(inspection);
                        }}
                      >
                        <Image
                          src="/images/checkbox.svg"
                          className={`w-5 xl:w-auto`}
                          width={24}
                          height={24}
                          alt="Select All Inspections"
                        />
                      </div>
                      <div
                        className={`min-w-10 h-10 justify-center cursor-pointer ${isSelected(inspection) ? "flex" : "hidden"
                          } items-center rounded-full hover:bg-platinum`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectForExport(inspection);
                        }}
                      >
                        <Image
                          src="/images/checkbox-active.svg"
                          className={`w-5 xl:w-auto`}
                          width={24}
                          height={24}
                          alt="Select All Inspections"
                        />
                      </div>
                      <h5>{inspection.siteName}</h5>
                    </div>
                    <div className="col-span-4 p-2">
                      {inspection.siteAddress}
                    </div>
                    <div className="col-span-2 flex items-center justify-center p-2">
                      {formatDate(inspection.inspectedDate)}
                    </div>
                    <div className="col-span-1 flex items-center justify-center p-2">
                      <label
                        className={`${inspection.status === true
                            ? "text-intenseRed bg-mistyRose"
                            : "text-cadmium bg-ivory"
                          } border border-platinum text-xs grid place-content-center p-2 rounded-lg min-w-16 h-6`}
                      >
                        {inspection.status ? "Open" : "Closed"}
                      </label>
                    </div>
                    <div className="col-span-2 flex justify-center p-2">
                      <div
                        className="min-w-10 h-10 flex justify-center items-center rounded-full hover:bg-platinum"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPopupType("single-inspection");
                          setShowPopup(true);
                          setInspectionId(inspection.id);
                        }}
                      >
                        <Image
                          src="/images/tabler-eye-icon.svg"
                          width={24}
                          height={24}
                          alt="View Inspection"
                        />
                      </div>
                      {(allowedActions.delete || allowedActions.download) && (
                        <>
                          <div
                            className="min-w-10 h-10 flex justify-center items-center rounded-full hover:bg-platinum relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowActions((prev) =>
                                prev.id === inspection.id && prev.show
                                  ? { id: null, show: false }
                                  : { id: inspection.id, show: true }
                              );
                            }}
                          >
                            <Image
                              src="/images/action-menu-icon.svg"
                              className="w-5"
                              width={24}
                              height={24}
                              alt="View Actions"
                            />
                            <DropDown
                              show={
                                showActions.id === inspection.id &&
                                showActions.show
                              }
                              onChange={(value) => {
                                proceedAction(value, inspection.id);
                              }}
                              setShow={() => { }}
                              labelWithImage={true}
                              images={actionDropDown.map((item) => item.image)}
                              options={actionDropDown.map((item) => item.label)}
                              actions={actionDropDown.map(
                                (item) => item.action
                              )}
                              right={0}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-center items-center pt-10">
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
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center">
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
        {inspections && inspections?.length > 0 && (
          <div className="flex justify-end items-center w-full sm:absolute sm:bottom-0 sm:right-0 bg-snow">
            <div className="w-full flex justify-end">
              <Pagination
                data={pagination}
                searchByPage={(page) => {
                  setPageNumber(page);
                  getInspections(page);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inspections;
