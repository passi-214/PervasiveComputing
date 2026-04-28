// TODO: Add time labels, value labels, responsive redraw, and empty-state styling for detail pages.

export function createLineChart({
  points = [],
  valueKey,
  stroke = "#ff515d",
  min,
  max
}) {
  const canvas = document.createElement("canvas");
  canvas.className = "line-chart";
  canvas.width = 960;
  canvas.height = 320;

  requestAnimationFrame(() => {
    drawLineChart(canvas, { points, valueKey, stroke, min, max });
  });

  return canvas;
}

export function drawLineChart(canvas, { points, valueKey, stroke, min, max }) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = 32;
  const values = points
    .map((point) => Number(point[valueKey]))
    .filter((value) => !Number.isNaN(value));

  context.clearRect(0, 0, width, height);
  context.strokeStyle = "rgba(174, 187, 224, 0.14)";
  context.lineWidth = 1;

  for (let i = 0; i < 5; i += 1) {
    const y = padding + ((height - padding * 2) / 4) * i;
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width - padding, y);
    context.stroke();
  }

  if (values.length < 2) {
    return;
  }

  const chartMin = min ?? Math.min(...values);
  const chartMax = max ?? Math.max(...values);
  const range = chartMax - chartMin || 1;
  const stepX = (width - padding * 2) / (values.length - 1);

  context.beginPath();
  values.forEach((value, index) => {
    const x = padding + stepX * index;
    const y = height - padding - ((value - chartMin) / range) * (height - padding * 2);

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
