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

export function buildStackedBarChart(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["CU", "SU", "NU", "Total"],
      datasets: [
        {
          label: "Farming Reward Data",
          data: [5, 7, 12, 5 + 7 + 12],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
        },
        {
          label: "Farming Reward Data in addition to 1000 Resource",
          data: [5, 7, 12, 5 + 7 + 12],
          backgroundColor: "rgb(255, 205, 86)",
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
