"use client";

import { useParams } from "next/navigation";
import { IconBox } from "@/components/common/IconBox";
import { ActionButton } from "@/components/common/Buttons";
import { useEffect, useState } from "react";
import { ActionButtons } from "@/types/button";
import QuickView from "@/components/inspection/common/QuickView";
import { useAppContext } from "@/context/AppContext";
import TabSwitcher from "@/components/common/TabSwitcher";
import { TabSwitcherData } from "@/types/common";
import ViewInspection from "@/components/inspection/view/ViewInspection";
import ViewMap from "@/components/inspection/view/ViewMap";
import ViewComments from "@/components/inspection/view/ViewComments";
import Image from "next/image";
import { inspectionService } from "@/services/inspectionService";
import { useRouter, usePathname } from "next/navigation";
import { updateActionButton, validInspectionPath } from "@/helpers/helper";
import { downloadPdfFile } from "@/utils/utils";
import { InspectionReport } from "@/components/common/InspectionReport";
import { ToggleSwitcher } from "@/components/common/Inputs";
import { ToggleSwitcherForm } from "@/types/input";
import { InspectionDetailsData } from "@/types/inpection";
import ViewMedia from "@/components/inspection/view/ViewMedia";

const Inspection = () => {
  const params = useParams();
  const { setInspectionId, allowedActions, userId, inspectionId, sideBar, handleSideBar, showSideBar, isViewCommentsClicked } = useAppContext();
  const router = useRouter();

  const [actions, setActions] = useState<ActionButtons>();
  const [inspectionStatus, setInspectionStatus] = useState<boolean>();
  const [tabs, setTabs] = useState<TabSwitcherData>({
    active: 1,
    tabs: [
      { id: 1, label: "Details", disabled: false },
      { id: 2, label: "Media", disabled: false },
      { id: 3, label: "Map", disabled: false },
      { id: 4, label: "Comment", disabled: false },
    ],
  });
  const [enabled, setEnabled] = useState<ToggleSwitcherForm>({
    name: "status",
    activeLabel: "Open",
    inActiveLabel: "Closed",
    required: false,
    active: inspectionStatus ?? false,
  });
  const path = usePathname();

  const handleActions = async (name: string) => {
    if (name === "delete") {
      deleteInspection();
    }
    if (name === "download") {
      setActions((prev) =>
        updateActionButton(prev || {}, [
          { key: "download", values: { disabled: true, loading: true } },
        ])
      );
      const response = await inspectionService.downloadReport({ inspectionId });
      if (response.status === 200 && response.data) {
        await downloadPdfFile({
          component: <InspectionReport data={response.data} userId={userId} />,
          fileName: `${response.data.data.reportMeta.preparedFor}${response.data.data.reportMeta.inspectionDate}`,
        });
      }
    }
    setActions((prev) =>
      updateActionButton(prev || {}, [
        { key: "download", values: { disabled: false, loading: false } },
      ])
    );
  };

  const handleTabSwitch = (id: number) => {
    setTabs((prev) => ({ ...prev, active: id }));
  };

  const handleToggle = async (key: string, value: boolean) => {
    setEnabled((prev) => ({ ...prev, active: value }));
    await inspectionService.updateInspection(inspectionId, { status: value });
  };

  const deleteInspection = async () => {
    if (allowedActions.delete) {
      setActions((prev) =>
        updateActionButton(prev || {}, [
          { key: "delete", values: { disabled: true, loading: true } },
        ])
      );
      const response = await inspectionService.deleteInspection(inspectionId);
      if (response.status === 202) {
        router.push("/inspections");
      }
      setActions((prev) =>
        updateActionButton(prev || {}, [
          { key: "delete", values: { disabled: false, loading: false } },
        ])
      );
    }
  };

  useEffect(() => {
    if (allowedActions) {
      if (allowedActions.delete)
        setActions((prev) => ({
          ...prev,
          delete: {
            disabled: false,
            icon: "delete-icon.svg",
            label: "Delete Inspection",
            loading: false,
            name: "delete",
          },
        }));
      if (allowedActions.download)
        setActions((prev) => ({
          ...prev,
          download: {
            disabled: false,
            icon: "download.svg",
            label: "Download Report",
            loading: false,
            name: "download",
          },
        }));
    }
  }, [allowedActions]);

  useEffect(() => {
    if (params.id) {
      const inspectionId = Array.isArray(params.id) ? params.id[0] : params.id;
      setInspectionId(inspectionId);
      const getInspection = async () => {
        const response = await inspectionService.getInspectionById(
          inspectionId
        );
        if (response.status === 200) {
          const details: InspectionDetailsData = response.data;
          setInspectionStatus(details.status);
          setEnabled((prev) => ({ ...prev, active: details.status ?? false }));
        }
      };
      getInspection();
    }
  }, [params]);

  useEffect(() => {
    const commentTab = tabs.tabs.find(tab => tab.label === "Comment");
    if (commentTab) {
      setTabs((prev) => ({
        ...prev,
        active: commentTab.id
      }));
    }
  }, [isViewCommentsClicked])

  useEffect(() => {
    return () => {
      handleSideBar([1, 2, 3, 4]);
    }
  }, [])

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {validInspectionPath(path) ? (
        <div className="w-full flex gap-4 h-full">
          <div className="w-full h-full flex flex-col gap-4 bg-snow p-4 rounded-2xl">
            <div className="flex w-full justify-between flex-wrap gap-4 items-center">
              <div className="flex gap-4 items-center">
                <IconBox
                  action="back"
                  icon="left-arrow.svg"
                  className="!bg-ghostWhite !rounded-2xl p-2.5 border-platinum border"
                />
                <h5 className="font-medium text-smokyBlack text-[15px]">
                  Inspection Details
                </h5>
              </div>
              <div className="flex gap-4 flex-wrap">
                {actions && actions.download && (
                  <ActionButton
                    data={actions.download}
                    onClick={(name) => handleActions(name)}
                  />
                )}
                {actions && actions.delete && (
                  <ActionButton
                    data={actions.delete}
                    onClick={(name) => handleActions(name)}
                  />
                )}
              </div>
            </div>
            <div className="overflow-y-auto h-full gap-4 flex flex-col scrollbar-none">
            {sideBar.active.includes(1) && <div className="w-full border border-platinum rounded-lg p-4 overflow-visible">
                 <QuickView inPopup={false} />
              </div> 
            }
              <div className="w-full flex gap-4 flex-wrap justify-between">
                <TabSwitcher
                  data={tabs}
                  withNormalButton={true}
                  switchTab={(id) => handleTabSwitch(id)}
                />
                <div className="flex gap-4 items-center">
                  <ToggleSwitcher props={enabled} onChange={handleToggle} reverseStyle={true} />
                </div>
              </div>
              <div className="w-full h-full">
                {tabs.active === 1 && <ViewInspection />}
                {tabs.active === 2 && <ViewMedia />}
                {tabs.active === 3 && <ViewMap />}
                {tabs.active === 4 && <ViewComments />}
              </div>
            </div>
          </div>
          {showSideBar && tabs.active === 2 && (
            <div className="w-fit bg-snow h-full rounded-2xl p-2 flex flex-col gap-4">
              {sideBar.tabs.map((tab, index) => (
                <div
                  className={`rounded-lg p-2 cursor-pointer ${
                    sideBar.active.includes(index + 1)
                      ? "bg-primary"
                      : "border border-platinum"
                  }`}
                  key={index}
                  onClick={() => handleSideBar(index + 1)}
                >
                  {sideBar.active.includes(index + 1) ? (
                    <Image
                      src={`/images/${tab.activeIcon}`}
                      width={24}
                      height={24}
                      alt="action"
                    />
                  ) : (
                    <Image
                      src={`/images/${tab.icon}`}
                      width={24}
                      height={24}
                      alt="action"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <h5 className="text-liver font-medium text-center text-sm">
          Invalid Inspection Id
        </h5>
      )}
    </div>
  );
};

export default Inspection;
