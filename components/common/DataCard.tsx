import { parseToShowDataProps } from "@/helpers/helper";
import { DataCardProps, ShowDataProps } from "@/types/common";
import { useEffect, useState } from "react";
import Skeleton from "./Skeleton";
import Image from "next/image";
import ShowData from "./ShowData";

const DataCard: React.FC<DataCardProps> = ({
  title,
  data,
  combineKeys = [],
  loading,
}) => {
  const [cardData, setCardData] = useState<ShowDataProps[]>([]);
  const [array, setArray] = useState<any[]>([]);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    if (data) {
      if (Array.isArray(data)) {
        setArray(data);
      } else if (typeof data === "object") {
        const parsed = parseToShowDataProps(data, combineKeys);
        setCardData(parsed);
      }
      setReady(true);
    } else {
      setReady(true);
    }
  }, [data, title]);
  return (
    <div className="w-full h-full border border-platinum rounded-lg p-4">
      {loading || !ready ? (
        <div className="w-full h-40">
          <Skeleton type="box" />
        </div>
      ) : (
        <div className="w-full">
          {cardData.length > 0 ? (
            <div className="flex w-full flex-col gap-4">
              <h5 className="text-md text-smokyBlack font-medium">{title}</h5>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {cardData.map((card, index) => (
                  <div key={index}>
                    <ShowData label={card.label} value={card.value} />
                  </div>
                ))}
              </div>
            </div>
          ) : array.length > 0 ? (
            <div className="flex flex-col gap-4">
              <h5 className="text-md text-smokyBlack font-medium">{title}</h5>
              <div className="flex flex-col gap-4 w-full">
                {array.map((data, index) => (
                  <div className="flex w-full gap-4" key={index}>
                    <div className="text-liver text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="text-smokyBlack text-sm font-medium">
                      {data.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full h-40 flex justify-center items-center flex-col">
              <label className="text-xs text-liver">No data available</label>
              <Image
                src="/images/empty-data.svg"
                width={100}
                height={100}
                alt="Empty Data"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataCard;
