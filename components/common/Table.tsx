import { PaginationData, TableProps, TableRow } from "@/types/common";
import Skeleton from "./Skeleton";
import Image from "next/image";
import Pagination from "./Pagination";
import { useEffect, useState } from "react";

const Table: React.FC<TableProps> = ({
  headers,
  contents,
  loading,
  removePagination,
  onClick = () => {},
}) => {
  const pageSize = 10;
  const [pagination, setPagination] = useState<PaginationData>();
  const [pageNumber, setPageNumber] = useState(1);
  const [tableContent, setTableContent] = useState<TableRow[]>([]);

  const handlePagination = (page: number) => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = contents.slice(startIndex, endIndex);
    setTableContent(pageData);
    setPageNumber(page);
  };

  useEffect(() => {
    setPagination((prev) => ({
      currentPage: pageNumber,
      pageSize: prev?.pageSize,
      totalPages: prev?.totalPages,
      totalRecords: prev?.totalRecords,
    }));
  }, [pageNumber]);

  useEffect(() => {
    const initialPage = 1;
    setPageNumber(initialPage);
    setPagination({
      currentPage: initialPage,
      pageSize,
      totalPages: Math.ceil(contents.length / pageSize),
      totalRecords: contents.length,
    });
    setTableContent(removePagination ? contents : contents.slice(0, pageSize));
  }, [contents]);
  return (
    <div className="w-full h-full">
      {loading ? (
        <div className="h-full w-full">
          <Skeleton type="table" />
        </div>
      ) : (
        <>
          {contents.length > 0 ? (
            <div className="w-full min-w-max md:min-w-full h-full rounded-lg flex flex-col justify-between relative">
              <div className="flex flex-col w-full gap-2">
                <div className="grid grid-cols-12 gap-2 bg-ghostWhite border border-platinum p-2 font-medium text-liver text-sm rounded-lg sticky top-0 z-10">
                  {headers.map((header, index) => (
                    <div key={index} className={`p-2 ${header.className}`}>
                      <span className={`${header.tag && "p-1"}`}>
                        {header.name}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto scrollbar-none">
                  {tableContent.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="grid grid-cols-12 gap-2 w-full p-2 cursor-pointer hover:bg-ghostWhite font-medium text-smokyBlack text-sm rounded-lg"
                      onClick={() => onClick(row.id)}
                    >
                      {row.contents.map((content, colIndex) => (
                        <div
                          key={colIndex}
                          className={`p-1.5 ${content.className} flex items-center max-w-72 md:max-w-fit`}
                        >
                          <div
                            className={`${
                              Array.isArray(content.name)
                                ? "overflow-x-auto scrollbar-none"
                                : `
                              ${content.tagClassName} truncate`
                            }`}
                            title={
                              content.name ? content.name.toString() : "NA"
                            }
                          >
                            {Array.isArray(content.name)
                              ? content.name.map(
                                  (name, index) =>
                                    name !== "" && (
                                      <span
                                        key={index}
                                        className={`${content.tagClassName} ml-2 first:ml-0`}
                                      >
                                        {name}
                                      </span>
                                    )
                                )
                              : content.name}
                          </div>
                          {content.icon && content.icon !== "" && (
                            <Image
                              src={`/images/${content.icon}`}
                              className="-rotate-90 m-auto"
                              width={18}
                              height={18}
                              alt="Icon"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              {!removePagination && (
                <div className="flex justify-end items-end sticky bottom-0 w-full bg-snow">
                  <div className="w-full flex justify-end">
                    <Pagination
                      data={pagination}
                      searchByPage={handlePagination}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center w-full h-full rounded-2xl">
              <h5 className="text-liver text-center font-normal text-sm">
                No results found
              </h5>
              <Image
                src="/images/empty-data.svg"
                height={240}
                width={240}
                alt="Empty"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Table;
