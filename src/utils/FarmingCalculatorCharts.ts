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
          label: "Farming Reward",
          data: [1, 1, 1, 1],
          backgroundColor: "rgb(255, 99, 132)",
        },
        {
          label: "Farming Reward With Extra Resources",
          data: [2, 2, 2, 2],
          backgroundColor: "rgb(54, 162, 235)",
        },
        {
          label: "Farming Reward In 5 Years",
          data: [3, 3, 3, 3],
          backgroundColor: "rgb(255, 205, 86)",
        },
        {
          label: "Farming Reward In 5 Years With Extra Resources",
          data: [4, 4, 4, 18],
          backgroundColor: "rgb(63, 81, 181)",
        },
      ],
    },
    options: {
      scales: {
        x: {
          beginAtZero: true,
        },
      },
    },
  });
}
