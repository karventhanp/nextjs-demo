import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { ChartProps } from "@/types/charts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart: React.FC<ChartProps> = ({ data }) => {
  const [hasData, setHasData] = useState<boolean>(false);
  const chartData = {
    labels: Object.keys(data).sort(
      (a, b) => Number(a.split(" ")[1]) - Number(b.split(" ")[1])
    ),
    datasets: [
      {
        label: "Total Length",
        data: Object.values(data).map((value) => parseFloat(value as string)),
        backgroundColor: "#5CD6BD",
        borderWidth: 0,
        borderRadius: 50,
        borderSkipped: false,
        barPercentage: 0.7,
        categoryPercentage: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as "end",
        display: false,
        labels: {
          font: {
            family: "Poppins, sans-serif",
          },
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10,
          padding: 3,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#0A0A0A",
          font: {
            family: "Poppins, sans-serif",
            size: 14,
          },
        },
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
      y: {
        type: "linear" as const,
        min: 1,
        ticks: {
          color: "#0A0A0A",
          font: {
            family: "Poppins, sans-serif",
            size: 14,
          },
        },
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  useEffect(() => {
    setHasData(chartData.datasets[0].data.some((value) => value !== 0));
  }, [data]);

  return (
    <div className="flex flex-col h-full w-full gap-4 justify-between">
      {hasData && (
        <div className="flex justify-between">
          <h5 className="font-normal text-sm text-davyGray xl:text-base">
            Distance Inspected
          </h5>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-aqua"></div>
            <label className="text-liver font-normal text-xs xl:text-sm">
              Total Length
            </label>
          </div>
        </div>
      )}

      <div className="w-full h-full flex items-center justify-center">
        {hasData ? (
          <Bar data={chartData} options={options} />
        ) : (
          <Image
            src="/images/no-data.svg"
            width={60}
            height={60}
            alt="No data"
          />
        )}
      </div>
    </div>
  );
};

export default BarChart;
