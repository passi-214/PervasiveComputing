const DEFAULT_RANGES = [
  { label: "30m", value: "30m" },
  { label: "1h", value: "1h" },
  { label: "6h", value: "6h" },
  { label: "24h", value: "24h" }
];

// TODO: Connect selected time range to history filtering and chart redraw in detail pages.

export function createTimeRangeSelector({
  ranges = DEFAULT_RANGES,
  selectedValue = "1h",
  onChange
} = {}) {
  const group = document.createElement("div");
  group.className = "time-range-selector";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", "Select chart time range");

  ranges.forEach((range) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "time-range-selector__button";
    button.textContent = range.label;
    button.dataset.value = range.value;

    if (range.value === selectedValue) {
      button.classList.add("time-range-selector__button--active");
    }

    button.addEventListener("click", () => {
      group.querySelectorAll(".time-range-selector__button").forEach((item) => {
        item.classList.toggle("time-range-selector__button--active", item === button);
      });

      if (onChange) {
        onChange(range.value);
      }
    });

    group.append(button);
  });

  return group;
}
