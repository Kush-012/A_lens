// components/charts/FinancialCharts.jsx
// Light theme charts — using Chart.js with light grid lines and indigo/red colours.

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import Chart from "chart.js/auto";

function buildChartConfig(type, data, labels, title) {
  const isBar = type === "bar";
  const primaryColor = "#EF4444"; // Red 500
  const accentColor  = "#DC2626"; // Red 600
  const gridColor    = "#F3F4F6"; // Gray 100
  const textColor    = "#6B7280"; // Gray 500

  return {
    type: isBar ? "bar" : "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: data,
          backgroundColor: isBar ? primaryColor : "rgba(239, 68, 68, 0.1)",
          borderColor: primaryColor,
          borderWidth: 2,
          borderRadius: isBar ? 4 : 0,
          fill: !isBar,
          tension: 0.4,
          pointBackgroundColor: "#fff",
          pointBorderColor: primaryColor,
          pointRadius: isBar ? 0 : 3,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#111827",
          titleColor: "#F9FAFB",
          bodyColor: "#F9FAFB",
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { color: textColor, font: { size: 10, family: "Inter" } },
        },
        y: {
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: textColor, font: { size: 10, family: "Inter" }, maxTicksLimit: 6 },
        },
      },
      interaction: { intersect: false, mode: "index" },
    },
  };
}

export default function FinancialCharts({ chartData }) {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, buildChartConfig(
      chartData.type || "bar",
      chartData.data,
      chartData.labels,
      chartData.title || "Data"
    ));

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [chartData]);

  if (!chartData) return null;

  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 mb-3 ml-1 flex items-center gap-1.5">
        <BarChart3 size={13} />
        {chartData.title || "Chart"}
      </p>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card p-4"
      >
        <div className="relative h-[240px] w-full">
          <canvas ref={canvasRef} />
        </div>
      </motion.div>
    </div>
  );
}
