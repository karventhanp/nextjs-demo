import { PaginationProps } from "@/types/common";
import { useEffect, useState } from "react";

const Pagination: React.FC<PaginationProps> = ({ data, searchByPage }) => {
  const [paginationItems, setPaginationItems] = useState([
    1,
    2,
    3,
    4,
    5,
    "...",
    data?.totalPages,
  ]);

  useEffect(() => {
    const totalPages = data?.totalPages ?? 1;
    const currentPage = data?.currentPage ?? 1;

    let paginationItems = [];

    if (totalPages <= 6) {
      paginationItems = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      paginationItems.push(1);
      let start, end;
      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      } else {
        start = currentPage - 1;
        end = currentPage + 1;
      }

      if (start > 2) paginationItems.push("...");
      paginationItems.push(
        ...Array.from({ length: end - start + 1 }, (_, i) => start + i)
      );
      if (end < totalPages - 1) paginationItems.push("...");
      paginationItems.push(totalPages);
    }
    setPaginationItems(paginationItems);
  }, [data]);

  return (
    <>
      {data && (
        <div className="flex gap-4 bg-snow w-fit items-center flex-wrap justify-center h-full">
          <div className="flex min-w-fit">
            <button
              className={`text-smokyBlack py-1 px-3 rounded font-medium text-sm ${(data.currentPage ?? 1) === 1 ? 'hidden': 'block'} disabled:cursor-not-allowed`}
              onClick={() => searchByPage((data.currentPage ?? 1) - 1)}
              disabled={(data.currentPage ?? 1) === 1}
            >
              Back
            </button>
            <div className="flex gap-2 items-center">
              {paginationItems.map((page, index) => (
                <button
                  key={index + 1}
                  onClick={() => typeof page === "number" && searchByPage(page)}
                  className={`rounded font-medium text-sm w-7 h-7 flex items-center justify-center  ${
                    page === data.currentPage
                      ? "bg-primary text-snow"
                      : "text-smokyBlack"
                  }`}
                  disabled={page === "..."}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              className={`text-smokyBlack py-1 px-3 rounded font-medium text-sm disabled:cursor-not-allowed ${(data.currentPage ?? 1) === (data.totalPages ?? 1) ? 'hidden' : 'block'}`}
              onClick={() => searchByPage((data.currentPage ?? 1) + 1)}
              disabled={(data.currentPage ?? 1) === (data.totalPages ?? 1)}
            >
              Next
            </button>
          </div>
          <div className="flex items-center min-w-fit">
            <h5 className="font-medium text-smokyBlack text-sm">
              Results:{" "}
              {(data.currentPage ?? 1) * (data.pageSize ?? 1) -
                (data.pageSize ?? 1) +
                1}{" "}
              -{" "}
              {(data.currentPage ?? 1) * (data.pageSize ?? 1) >
              (data.totalRecords ?? 1)
                ? data.totalRecords
                : (data.currentPage ?? 1) * (data.pageSize ?? 1)}{" "}
              of {data?.totalRecords}
            </h5>
          </div>
        </div>
      )}
    </>
  );
};

export default Pagination;
