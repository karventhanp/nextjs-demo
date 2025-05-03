import PocInfo from "@/components/users/PocInfo";
import { useState } from "react";
import TabSwitcher from "@/components/common/TabSwitcher";
import { TabSwitcherData } from "@/types/common";
import CompanyDetails from "./CompanyDetails";
import { CustomerProps } from "@/types/customer";

const CompanyInfo: React.FC<CustomerProps> = ({ callback = () => {}, canEdit }) => {
  const [tabs, setTabs] = useState<TabSwitcherData>({
    active: 1,
    tabs: [
      { id: 1, label: "Company", disabled: true },
      { id: 2, label: "POC", disabled: true },
    ],
  });

  const handleTabSwitch = (id: number) => {
    setTabs((prev) => ({ ...prev, active: id }));
  };

  const updatePage = (status: number, value: string) => {
    handleTabSwitch(parseFloat(value));
  };

  return (
    <div className="flex w-full h-full flex-col gap-4">
      <div className="w-full h-fit">
        <TabSwitcher
          data={tabs}
          switchTab={handleTabSwitch}
          withNormalButton={false}
        />
      </div>
      <div className="w-full h-full">
        {tabs.active === 1 && <CompanyDetails callback={updatePage} canEdit={canEdit} />}
        {tabs.active === 2 && <PocInfo callback={callback} canEdit={canEdit} />}
      </div>
    </div>
  );
};

export default CompanyInfo;
