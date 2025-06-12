"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), {
  loading: () => <div className="flex items-center justify-center h-64">Loading chart...</div>
});

type ApexChartProps = {
  options: ApexOptions;
  series: any[];
  type: "area" | "donut" | "line" | "bar";
  height: number;
};

export function ApexChart({ options, series, type, height }: ApexChartProps) {
  return (
    <Chart
      options={options}
      series={series}
      type={type}
      height={height}
    />
  );
}