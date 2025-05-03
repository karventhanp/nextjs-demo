import { TabSwitcherProps } from "@/types/common";

const TabSwitcher: React.FC<TabSwitcherProps> = ({ data, switchTab, withNormalButton }) => {
  return (
    <div className={`${!withNormalButton && 'rounded-2xl p-2 bg-ghostWhite'} flex-wrap flex gap-4 w-fit`}>
      {data.tabs.map((tab, index) => (
        <button
          key={index}
          className={`px-2 py-2.5 rounded-lg text-sm border font-medium ${
            data.active === tab.id
              ? `${withNormalButton ? 'bg-primary text-snow border-primary' : 'text-smokyBlack bg-snow border-platinum'} `
              : `${withNormalButton ? '' : 'text-liver bg-transparent border-transparent'}`
          }`}
          disabled={tab.disabled}
          onClick={() => switchTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher;
