import { useEffect, useState } from "react";
import { TabSwitcherData } from "@/types/common";
import TabSwitcher from "@/components/common/TabSwitcher";
import { useAppContext } from "@/context/AppContext";
import { inspectionService } from "@/services/inspectionService";
import {
  InSightsData,
  InspectionDetailsData,
  QuestionariesData,
} from "@/types/inpection";
import Info from "./Info";
import Questionaries from "../create/Questionaries";
import Image from "next/image";
import { ActionButtons } from "@/types/button";
import { ActionButton } from "@/components/common/Buttons";
import { updateActionButton } from "@/helpers/helper";
import InspectionDetails from "../create/InspectionDetails";
import ViewQuestionaries from "./ViewQuestionaries";
import ViewInsights from "./ViewInsights";
import InSights from "../create/InSights";

interface ViewInspectionProps {
  // edit: boolean;
}

const ViewInspection: React.FC<ViewInspectionProps> = ({}) => {
  const {
    inspectionId,
    allowedActions,
    setOptimizedOffCanvasContent,
    setShowOptimizedOffCanvas,
  } = useAppContext();
  const [tabs, setTabs] = useState<TabSwitcherData>({
    active: 1,
    tabs: [
      { id: 1, label: "Site Info", disabled: false },
      { id: 2, label: "Questionaries", disabled: false },
      { id: 3, label: "InSights", disabled: false },
    ],
  });
  const [details, setDetails] = useState<InspectionDetailsData>();
  const [questionaries, setQuestionaries] = useState<QuestionariesData>();
  const [insights, setInsights] = useState<InSightsData>();
  const [edit, setEdit] = useState<boolean>(false);
  const [actions, setActions] = useState<ActionButtons>({
    edit: {
      disabled: false,
      icon: "edit.svg",
      label: "Edit",
      loading: false,
      name: "edit",
    },
  });
  const [loading, setLoading] = useState<boolean>(true);

  const handleTabSwitch = (id: number) => {
    setTabs((prev) => ({ ...prev, active: id }));
  };

  const getInspection = async () => {
    if (!inspectionId) return;
    setLoading(true);
    const response = await inspectionService.getInspectionById(inspectionId);
    if (response.status === 200) {
      const details: InspectionDetailsData = response.data;
      const questionaries: QuestionariesData = response.data;
      const insights: InSightsData = response.data;
      setDetails({
        siteName: details.siteName,
        gpsCoordinates: details.gpsCoordinates,
        inspectedDate: details.inspectedDate,
        address: details.address,
        zone: details.zone || "",
      });
      setQuestionaries(questionaries);
      setInsights(insights);
    }
    setLoading(false);
  };

  const handleCallback = () => {
    getInspection();
    setShowOptimizedOffCanvas(false);
  };

  const handleEdit = () => {
    const activeTab = tabs.active;
    let title = "Details";
    let content = (
      <InspectionDetails
        createFlow={false}
        data={details}
        success={handleCallback}
      />
    );
    if (activeTab === 2) {
      title = "Questionaries";
      content = (
        <Questionaries
          createFlow={false}
          data={questionaries}
          success={handleCallback}
        />
      );
    }

    if (activeTab === 3) {
      title = "InSights";
      content = (
        <InSights createFlow={false} data={insights} success={handleCallback} />
      );
    }

    setOptimizedOffCanvasContent({
      title,
      content,
    });
    setShowOptimizedOffCanvas(true);
  };

  useEffect(() => {
    getInspection();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="w-full flex gap-4 justify-between items-center">
        <TabSwitcher
          data={tabs}
          withNormalButton={false}
          switchTab={(id) => handleTabSwitch(id)}
        />
        {allowedActions.edit && actions.edit && (
          <ActionButton data={actions.edit} onClick={handleEdit} />
        )}
      </div>
      <div className="w-full h-full">
        {tabs.active === 1 && <Info data={details} loading={loading} />}
        {tabs.active === 2 && (
          <ViewQuestionaries data={questionaries} loading={loading} />
        )}
        {tabs.active === 3 && (
          <ViewInsights data={insights} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default ViewInspection;
