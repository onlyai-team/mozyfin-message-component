import * as echarts from "echarts";
import { Download } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { Button } from "./ui/button";

const COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

function formatAxisTick(value: unknown): string {
  const num = Number(value);
  if (!isFinite(num)) return String(value);
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`;
  return String(num);
}

function parseAttrArray(value: string): unknown[] {
  try {
    return JSON.parse(value.replace(/'/g, '"'));
  } catch {
    return [];
  }
}

export interface IChatInlineChartProps {
  type: "bar" | "line" | "doughnut" | "area";
  x: string;
  y: string;
  labels: string;
  title?: string;
}

const tooltipBox = (label: string, rows: string) =>
  `<div style="background:var(--background);border-radius:8px;border:1px solid var(--border);padding:8px 12px;font-size:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);">
    <p style="color:var(--foreground);font-weight:500;margin:0 0 6px 0;">${label}</p>
    ${rows}
  </div>`;

const tooltipRow = (color: string, name: string, value: unknown) =>
  `<div style="display:flex;align-items:center;gap:8px;">
    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
    <span style="color:var(--muted-foreground);">${name}:</span>
    <span style="color:var(--foreground);font-weight:500;">${formatAxisTick(value)}</span>
  </div>`;

const axisLabelStyle = { color: "#9f9fa9", fontSize: 11 };
const splitLineStyle = { lineStyle: { color: "#71717b20" } };

const commonAxis = {
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: axisLabelStyle,
  splitLine: splitLineStyle,
};

const ChatInlineChart = ({
  type,
  x,
  y,
  labels,
  title,
}: IChatInlineChartProps) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  const { data, seriesKeys, xValues, legendItems, yMin, yMax } = useMemo(() => {
    const xVals = parseAttrArray(x) as string[];
    const yDatasets = parseAttrArray(y) as number[][];
    const labelValues = parseAttrArray(labels) as string[];

    const normalizedDatasets: number[][] = Array.isArray(yDatasets[0])
      ? (yDatasets as unknown as number[][])
      : [yDatasets as unknown as number[]];

    const keys = normalizedDatasets.map(
      (_, i) => labelValues[i] ?? `series${i + 1}`,
    );

    const chartData = xVals.map((xVal, i) => {
      const entry: Record<string, string | number> = { name: String(xVal) };
      normalizedDatasets.forEach((dataset, di) => {
        entry[keys[di]] = dataset[i] ?? 0;
      });
      return entry;
    });

    const allValues = normalizedDatasets.flat().filter((v) => isFinite(v));
    const rawMin = allValues.length ? Math.min(...allValues) : 0;
    const rawMax = allValues.length ? Math.max(...allValues) : 0;
    const yMin = rawMin >= 0 ? rawMin / 1.1 : rawMin * 1.1;
    const yMax = rawMax >= 0 ? rawMax * 1.1 : rawMax / 1.1;

    const isDoughnut = type === "doughnut";
    const items = isDoughnut
      ? xVals.map((xVal, i) => ({
          name: String(xVal),
          color: COLORS[i % COLORS.length],
        }))
      : keys.length > 1
        ? keys.map((key, i) => ({
            name: key,
            color: COLORS[i % COLORS.length],
          }))
        : [];

    return {
      data: chartData,
      seriesKeys: keys,
      xValues: xVals.map(String),
      legendItems: items,
      yMin,
      yMax,
    };
  }, [x, y, labels, type]);

  useEffect(() => {
    if (!chartRef.current || chartInstance.current) return;
    chartInstance.current = echarts.init(chartRef.current);
  }, []);

  useEffect(() => {
    if (!chartInstance.current) return;

    let option: echarts.EChartsOption = {};

    if (type === "doughnut") {
      const pieData = data.map((d, i) => ({
        name: String(d.name),
        value: (d[seriesKeys[0]] as number) ?? 0,
        itemStyle: { color: COLORS[i % COLORS.length] },
      }));

      option = {
        tooltip: {
          trigger: "item",
          backgroundColor: "transparent",
          borderColor: "transparent",
          padding: 0,
          formatter: (params: unknown) => {
            const p = params as { color: string; name: string; value: unknown };
            return tooltipBox(
              "",
              `<div style="display:flex;align-items:center;gap:8px;">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};flex-shrink:0;"></span>
                <span style="color:var(--foreground);font-weight:500;">${p.name}</span>
                <span style="color:var(--muted-foreground);">${formatAxisTick(p.value)}</span>
              </div>`,
            );
          },
        },
        legend: { show: false },
        series: [
          {
            type: "pie",
            radius: ["52%", "78%"],
            center: ["50%", "50%"],
            padAngle: 2,
            itemStyle: { borderWidth: 0 },
            label: { show: false },
            emphasis: { label: { show: false } },
            data: pieData,
          },
        ],
      };
    } else if (type === "bar") {
      option = {
        tooltip: {
          trigger: "axis",
          backgroundColor: "transparent",
          borderColor: "transparent",
          padding: 0,
          axisPointer: {
            type: "shadow",
            shadowStyle: { color: "rgba(120,120,120,0.08)" },
          },
          formatter: (params: unknown) => {
            const arr = Array.isArray(params) ? params : [params];
            return tooltipBox(
              (arr[0] as { axisValueLabel?: string })?.axisValueLabel ?? "",
              arr
                .map((p: unknown) => {
                  const tp = p as { color: string; seriesName: string; value: unknown };
                  return tooltipRow(tp.color, tp.seriesName, tp.value);
                })
                .join(""),
            );
          },
        },
        legend: { show: false },
        grid: { top: 8, right: 8, left: 0, bottom: 0, containLabel: true },
        xAxis: {
          type: "category",
          data: xValues,
          ...commonAxis,
          splitLine: { show: false },
        },
        yAxis: {
          type: "value",
          ...commonAxis,
          axisLabel: {
            ...axisLabelStyle,
            formatter: formatAxisTick,
            width: 48,
          },
        },
        series: seriesKeys.map((key, i) => ({
          name: key,
          type: "bar",
          data: data.map((d) => d[key]),
          itemStyle: {
            color: COLORS[i % COLORS.length],
            borderRadius: [4, 4, 0, 0],
          },
          barMaxWidth: 48,
        })),
      };
    } else if (type === "area") {
      option = {
        tooltip: {
          trigger: "axis",
          backgroundColor: "transparent",
          borderColor: "transparent",
          padding: 0,
          axisPointer: { type: "line", lineStyle: { color: "#71717b40" } },
          formatter: (params: unknown) => {
            const arr = Array.isArray(params) ? params : [params];
            return tooltipBox(
              (arr[0] as { axisValueLabel?: string })?.axisValueLabel ?? "",
              arr
                .map((p: unknown) => {
                  const tp = p as { color: string; seriesName: string; value: unknown };
                  return tooltipRow(tp.color, tp.seriesName, tp.value);
                })
                .join(""),
            );
          },
        },
        legend: { show: false },
        grid: { top: 8, right: 8, left: 0, bottom: 0, containLabel: true },
        xAxis: {
          type: "category",
          data: xValues,
          ...commonAxis,
          splitLine: { show: false },
        },
        yAxis: {
          type: "value",
          ...commonAxis,
          axisLabel: { ...axisLabelStyle, formatter: formatAxisTick },
        },
        series: seriesKeys.map((key, i) => ({
          name: key,
          type: "line",
          data: data.map((d) => d[key]),
          symbol: "none",
          lineStyle: { color: COLORS[i % COLORS.length], width: 2 },
          itemStyle: { color: COLORS[i % COLORS.length] },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: COLORS[i % COLORS.length] + "40" },
              { offset: 1, color: COLORS[i % COLORS.length] + "00" },
            ]),
          },
        })),
      };
    } else {
      option = {
        tooltip: {
          trigger: "axis",
          backgroundColor: "transparent",
          borderColor: "transparent",
          padding: 0,
          axisPointer: { type: "line", lineStyle: { color: "#71717b40" } },
          formatter: (params: unknown) => {
            const arr = Array.isArray(params) ? params : [params];
            return tooltipBox(
              (arr[0] as { axisValueLabel?: string })?.axisValueLabel ?? "",
              arr
                .map((p: unknown) => {
                  const tp = p as { color: string; seriesName: string; value: unknown };
                  return tooltipRow(tp.color, tp.seriesName, tp.value);
                })
                .join(""),
            );
          },
        },
        legend: { show: false },
        grid: { top: 8, right: 8, left: 0, bottom: 0, containLabel: true },
        xAxis: {
          type: "category",
          data: xValues,
          ...commonAxis,
          splitLine: { show: false },
        },
        yAxis: {
          type: "value",
          min: yMin,
          max: yMax,
          ...commonAxis,
          axisLabel: { ...axisLabelStyle, formatter: formatAxisTick },
        },
        series: seriesKeys.map((key, i) => ({
          name: key,
          type: "line",
          data: data.map((d) => d[key]),
          symbol: "none",
          lineStyle: { color: COLORS[i % COLORS.length], width: 2.5 },
          itemStyle: { color: COLORS[i % COLORS.length] },
          emphasis: { focus: "series" },
        })),
      };
    }

    chartInstance.current.setOption(option, true);
  }, [type, data, seriesKeys, xValues, yMin, yMax]);

  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  const handleDownloadPng = () => {
    if (!chartInstance.current) return;
    const url = chartInstance.current.getDataURL({
      type: "png",
      pixelRatio: 2,
      backgroundColor: "#fff",
    });
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title ?? "chart"}.png`;
    link.click();
  };

  return (
    <div className="group my-8 w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        {title ? (
          <p className="text-foreground text-sm font-semibold">{title}</p>
        ) : (
          <span />
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleDownloadPng}
        >
          <Download className="size-3.5" />
          <span className="text-xs">Download</span>
        </Button>
      </div>
      <div ref={chartRef} className="h-64 w-full" />
      {legendItems.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {legendItems.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="inline-block size-2 flex-shrink-0 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground text-xs">{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatInlineChart;
