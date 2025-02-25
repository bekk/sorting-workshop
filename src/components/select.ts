import { html } from "../html";

export interface Option {
  value: string;
  text: string;
}

interface SelectOptions {
  options: Option[];
  onChange?: (value: string) => void;
}

export function select(target: HTMLElement, options: SelectOptions) {
  target.innerHTML = html`<select
    class="form-select"
    aria-label="Default select example"
  >
    ${options.options.map(option)}
  </select>`;
  const select = target.querySelector("select") as HTMLSelectElement;
  select.onchange = () => {
    options.onChange?.(select.value);
  };
}

function option(option: Option): string {
  return html`<option value="${option.value}">${option.text}</option>`;
}
