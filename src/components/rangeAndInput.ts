import { html } from "../html";

interface RangeAndInputOptions {
  startingValue: number;
  min: number;
  max: number;
  step: number;
  onChange?: (value: number) => void;
}

export function rangeAndInput(
  target: HTMLElement,
  options: RangeAndInputOptions
) {
  const id = "customRange3";

  target.innerHTML = html` <div class="row">
    <label for="${id}" class="form-label">Antall elementer</label>
    <div class="col-2">
      <input
        class="form-control"
        type="text"
        aria-label="Amount (to the nearest dollar)"
      />
    </div>
    <div class="col-10">
      <input
        class="form-range"
        type="range"
        min="${options.min}"
        max="${options.max}"
        step="${options.step}"
        id="${id}"
      />
    </div>
  </div>`;

  const range = target.querySelector("input[type=range]") as HTMLInputElement;
  const input = target.querySelector("input[type=text]") as HTMLInputElement;
  range.value = options.startingValue.toString();
  input.value = options.startingValue.toFixed(0);

  range.oninput = () => {
    const parsedValue = parseValue(range.value);
    if (parsedValue === undefined) return;
    input.value = parsedValue.toFixed(0);
    options.onChange?.(parsedValue);
  };

  input.oninput = () => {
    const parsedValue = parseValue(input.value);
    if (parsedValue === undefined) return;
    range.value = parsedValue.toString();
    options.onChange?.(parsedValue);
  };

  input.onblur = () => {
    input.value = parseValue(input.value)?.toFixed(2) ?? "";
  };

  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      input.blur();
    }
  };

  function parseValue(rawValue: string): number | undefined {
    let value = parseFloat(rawValue);
    if (isNaN(value)) return;
    value = Math.min(Math.max(options.min, value), options.max);
    value = Math.round(value / options.step) * options.step;
    return value;
  }
}
