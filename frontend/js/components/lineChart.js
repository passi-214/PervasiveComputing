// TODO: Add time labels, value labels, responsive redraw, and empty-state styling for detail pages.

export function createLineChart({
  points = [],
  valueKey,
  unit = "",
  stroke = "#ff515d",
  min,
  max
}) {
  const canvas = document.createElement("canvas");
  canvas.className = "line-chart";
  canvas.width = 960;
  canvas.height = 320;

  requestAnimationFrame(() => {
    drawLineChart(canvas, { points, valueKey, unit, stroke, min, max });
  });

  return canvas;
}

export function drawLineChart(canvas, { points, valueKey, unit, stroke, min, max }) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = {
    top: 24,
    right: 24,
    bottom: 42,
    left: 84
  };
  const values = points
    .map((point) => Number(point[valueKey]))
    .filter((value) => !Number.isNaN(value));

  context.clearRect(0, 0, width, height);
  context.font = "13px sans-serif";
  context.textBaseline = "middle";
  context.strokeStyle = "rgba(174, 187, 224, 0.14)";
  context.fillStyle = "rgba(174, 187, 224, 0.86)";
  context.lineWidth = 1;

  for (let i = 0; i < 5; i += 1) {
    const y = padding.top + ((height - padding.top - padding.bottom) / 4) * i;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
  }

  if (values.length < 2) {
    return;
  }

  const chartMin = min ?? Math.min(...values);
  const chartMax = max ?? Math.max(...values);
  const range = chartMax - chartMin || 1;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const stepX = chartWidth / (values.length - 1);

  context.textAlign = "right";
  for (let i = 0; i < 5; i += 1) {
    const ratio = i / 4;
    const value = chartMax - range * ratio;
    const y = padding.top + chartHeight * ratio;
    context.fillText(`${value.toFixed(1)}${unit}`, padding.left - 12, y);
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  [firstPoint, lastPoint].forEach((point, index) => {
    if (!point?.ts) {
      return;
    }

    const date = new Date(point.ts);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const label = new Intl.DateTimeFormat("de-AT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);

    const x = index === 0 ? padding.left : width - padding.right;
    context.textAlign = index === 0 ? "left" : "right";
    context.fillText(label, x, height - 18);
  });

  context.beginPath();
  values.forEach((value, index) => {
    const x = padding.left + stepX * index;
    const y = height - padding.bottom - ((value - chartMin) / range) * chartHeight;

    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  context.strokeStyle = stroke;
  context.lineWidth = 3;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.stroke();
}
