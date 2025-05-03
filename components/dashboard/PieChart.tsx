import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { ChartProps } from "@/types/charts";
import Image from "next/image";
Chart.register(ArcElement, Tooltip, Legend);

const PieChart: React.FC<ChartProps> = ({ data }) => {
  const critical = "#145245";
  const major = "#29A38A";
  const minor = "#5CD6BD";
  const cosmetic = "#AEEADE";
  const [hasData, setHasData] = useState<boolean>(false);
  const [pieChart, setPieChart] = useState({
    data: {
      labels: ["Structural Defects", "Deformed", "Deposit", "Blockage"],
      datasets: [
        {
          label: "Issue Distribution",
          data: data,
          backgroundColor: [critical, major, minor, cosmetic],
          borderWidth: 0,
          spacing: 6,
          borderRadius: 4,
          cutout: "80%",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: false,
          position: "top" as const,
          labels: {
            usePointStyle: true,
            font: {
              family: "Poppins, sans-serif",
              size: 14,
            },
          },
        },
      },
    },
  });

  useEffect(() => {
    setPieChart((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        datasets: [
          {
            ...prevState.data.datasets[0],
            data: data,
          },
        ],
      },
    }));
  }, [data]);

  useEffect(() => {
    Chart.register({
      id: "centerText",
      beforeDraw: (chart) => {
        if (chart && (chart.config as any).type !== "doughnut") return;
        const { width, height, ctx } = chart;
        ctx.save();

        const total = chart.data.datasets[0].data.reduce(
          (acc: number, val) => acc + (typeof val === "number" ? val : 0),
          0
        );
        const centerX = width / 2;
        const centerY = height / 2;

        const totalFontSize = Math.min(width, height) / 6;
        ctx.font = `500 ${totalFontSize}px Poppins, sans-serif`;
        ctx.fillStyle = "#141415";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(total.toString(), centerX, centerY - totalFontSize / 6);

        const labelFontSize = totalFontSize / 2.5;
        ctx.font = `400 ${labelFontSize}px Poppins, sans-serif`;
        ctx.fillStyle = "#525252";
        ctx.fillText("Major Defects", centerX, centerY + totalFontSize / 1.5);

        ctx.restore();
      },
    });
  }, []);

  useEffect(() => {
    setHasData(
      pieChart.data.datasets[0].data.some((value: number) => value !== 0)
    );
  }, [pieChart]);

  return (
    <div className="flex flex-col gap-4 justify-between h-full w-full">
      {hasData ? (
        <>
          <h5 className="font-medium text-sm text-liver text-left xl:text-base">
            Defect Chart
          </h5>
          <div className="h-full w-full xl:w-4/5 m-auto">
            <Doughnut data={pieChart.data} options={pieChart.options} />
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <div className="flex gap-2 flex-wrap justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-stateGreen"></div>
                <label className="text-liver font-normal text-xs xl:text-sm">
                  Structural Defects
                </label>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-jungleGreen"></div>
                <label className="text-liver font-normal text-xs xl:text-sm">
                  Deformed
                </label>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-aqua"></div>
                <label className="text-liver font-normal text-xs xl:text-sm">
                  Deposit
                </label>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-aqua"></div>
                <label className="text-liver font-normal text-xs xl:text-sm">
                  Blockage
                </label>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-full">
          <Image
            src="/images/no-data.svg"
            width={60}
            height={60}
            alt="No data"
          />
        </div>
      )}
    </div>
  );
};

export default PieChart;
