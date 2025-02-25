import { html } from "../html";

interface RangeAndInputOptions {
  startingValue: number;
  min: number;
  max: number;
  step: number;
  roundingDigits?: number;
  onChange?: (value: number) => void;
}

export function rangeAndInput(
  target: HTMLElement,
  options: RangeAndInputOptions
) {
  const id = "customRange3";

  target.innerHTML = html` <div class="row g-0">
    <label for="${id}" class="form-label mb-0">Antall elementer</label>
    <div class="col-2">
      <input
        id="${id}"
        class="form-control"
        type="number"
        aria-label="Amount (to the nearest dollar)"
        style="border-top-right-radius: 0; border-bottom-right-radius: 0;"
        value="${options.startingValue}"
      />
    </div>
    <div
      class="col d-flex align-items-center border border-start-0 rounded-2 px-2"
      style="border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important;"
    >
      <input
        class="form-range vertical-align-middle"
        type="range"
        min="${options.min}"
        max="${options.max}"
        step="${options.step}"
        value="${options.startingValue}"
      />
    </div>
  </div>`;

  const range = target.querySelector("input[type=range]") as HTMLInputElement;
  const input = target.querySelector("input[type=number]") as HTMLInputElement;

  range.oninput = () => {
    const parsedValue = parseValue(range.value);
    if (parsedValue === undefined) return;
    input.value = parsedValue.toFixed(options.roundingDigits ?? 0);
    options.onChange?.(parsedValue);
  };

  input.oninput = () => {
    const parsedValue = parseValue(input.value);
    if (parsedValue === undefined) return;
    range.value = parsedValue.toString();
    options.onChange?.(parsedValue);
  };

  input.onblur = () => {
    input.value =
      parseValue(input.value)?.toFixed(options.roundingDigits ?? 0) ?? "";
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
