import DataCard from "@/components/common/DataCard";
import { QuestionariesData } from "@/types/inpection";
import { useEffect, useState } from "react";

interface ViewQuestionariesProps {
  data: QuestionariesData | undefined;
  loading?: boolean;
}

const ViewQuestionaries: React.FC<ViewQuestionariesProps> = ({ data, loading }) => {
  const [pipeInfo, setPipeInfo] = useState<any>();
  const [maintenanceInfo, setMaintenanceInfo] = useState<any>();
  useEffect(() => {
    if (
      data &&
      data.questionariesData &&
      data.questionariesData.pipelineInformation
    ) {
      const {
        maintenance,
        pipelineType,
        material,
        diameter,
        length,
        ...remaining
      } = data.questionariesData.pipelineInformation;
      const updatedPipeInfo = {
        pipelineType,
        material,
        diameter,
        length: `${length} m`,
        ...remaining,
      };
      setPipeInfo(updatedPipeInfo);
      setMaintenanceInfo(maintenance);
    }
  }, [data]);
  return (
    <div className="flex flex-col w-full gap-4">
      <DataCard
        title="Pipeline Information"
        data={pipeInfo}
        loading={loading}
      />
      <DataCard
        title="Pipe Maintenance"
        data={maintenanceInfo}
        loading={loading}
      />
    </div>
  );
};

export default ViewQuestionaries;
