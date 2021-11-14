import { Chart } from "chart.js";

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
          label: "My First Dataset",
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
