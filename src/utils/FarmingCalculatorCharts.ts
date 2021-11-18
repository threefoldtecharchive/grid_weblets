import { Chart } from "chart.js";
import type FarmingProfile from "../types/FarmingProfile";

export function buildPieChart(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");

  return new Chart(ctx, {
    type: "doughnut",
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Reward for CU, SU & NU",
        },
      },
    },
    data: {
      labels: ["CU", "SU", "NU"],
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  });
}

export function buildLineChart(canvas: HTMLCanvasElement, fp: FarmingProfile) {
  const ctx = canvas.getContext("2d");

  const X = (20 - 0.15) / 19;
  const xs = [...Array.from({ length: 20 }).map((_, i) => 0.15 + X * i)];

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: xs.map((i) => i.toFixed(2)),
      datasets: [
        {
          label: "Margin",
          data: xs.map((x) => fp.getTotalReward(x)),
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgba(255, 99, 132, 0.5)",
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Return (USD) / TFT price (USD)",
        },
      },
    },
  });
}
