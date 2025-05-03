import { ShowDataProps } from "@/types/common";

const ShowData:React.FC<ShowDataProps> = ({label, value}) => {
  return (
    <div className="w-fit flex flex-col gap-1">
      <label className="text-sm text-liver font-normal">{label}</label>
      <p className="text-smokyBlack text-sm font-medium">{value ? value : "NA"}</p>
    </div>
  );
};

export default ShowData;
