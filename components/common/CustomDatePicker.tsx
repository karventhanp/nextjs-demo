"use client";

import { Datepicker } from "flowbite-react";
import { useEffect, useState } from "react";

interface CustomDatePickerProps {
  updateDate: (date: Date | null) => void;
  value?: string;
  maxDate?: Date;
  error?: string | null | undefined;
  readOnly?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  updateDate,
  value,
  maxDate,
  error,
  readOnly,
}) => {
  return (
    <div className="w-fit h-full z-50">
      <Datepicker
        showTodayButton={false}
        language="en"
        onChange={updateDate}
        value={value ? new Date(value) : new Date()}
        maxDate={maxDate}
        className={`${readOnly && "pointer-events-none"}`}
        theme={{
          root: {
            base: "relative",
            input: {
              field: {
                input: {
                  base: error
                    ? "focus:ring-0 w-48 !border-carminePink !focus:border-carminePink"
                    : "focus:ring-0 w-48 focus:!border-primary",
                },
              },
            },
          },
          popup: {
            root: {
              base: "absolute top-12 z-50 block rounded-2xl font-poppins shadow-medium",
              inline: "relative top-0 z-auto",
              inner:
                "inline-block rounded-lg bg-white p-4 shadow-lg dark:bg-gray-700",
            },
            header: {
              base: "",
              title:
                "px-2 py-3 text-center font-semibold text-gray-900 dark:text-white",
              selectors: {
                base: "mb-2 flex justify-between",
                button: {
                  base: "rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
                  prev: "",
                  next: "",
                  view: "",
                },
              },
            },
            view: {
              base: "p-1",
            },
          },
          views: {
            days: {
              header: {
                base: "mb-1 grid grid-cols-7",
                title:
                  "h-6 text-center text-sm font-medium leading-6 text-gray-500",
              },
              items: {
                base: "grid w-64 grid-cols-7",
                item: {
                  base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
                  selected: "bg-primary text-white hover:bg-primary",
                  disabled: "text-gray-500",
                },
              },
            },
            years: {
              items: {
                base: "grid w-64 grid-cols-4",
                item: {
                  base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
                  selected: "bg-primary text-white hover:bg-primary",
                },
              },
            },
            decades: {
              items: {
                base: "grid w-64 grid-cols-4",
                item: {
                  base: "block flex-1 cursor-pointer rounded-lg border-0 text-center text-sm font-semibold leading-9 text-gray-900 hover:bg-gray-100",
                  selected: "bg-primary text-white hover:bg-primary",
                },
              },
            },
          },
        }}
      />
    </div>
  );
};

export default CustomDatePicker;
