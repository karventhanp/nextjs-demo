import DataCard from "@/components/common/DataCard";
import { InSightsData } from "@/types/inpection";
import { useEffect, useState } from "react";

interface ViewInSightsProps {
  data: InSightsData | undefined;
  loading?: boolean;
}

const ViewInsights: React.FC<ViewInSightsProps> = ({ data, loading }) => {
  const [riskInfo, setRiskInfo] = useState<any>();
  const [recommendations, setRecommendations] = useState<any>();

  useEffect(() => {
    if (data && data.insightsData) {
      const { riskAssessment, recommendations } = data.insightsData;
      setRiskInfo(riskAssessment);
      setRecommendations(recommendations);
    }
  }, [data]);
  return (
    <div className="flex flex-col w-full gap-4">
      <DataCard
        title="Risk"
        data={riskInfo}
        loading={loading}
      />
      <DataCard
        title="Recommendations"
        data={recommendations}
        loading={loading}
      />
    </div>
  );
};

export default ViewInsights;
