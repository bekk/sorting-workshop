import { html } from "../html";
import {
  ImageSortType,
  imageSortTypeDescriptions,
  imageSortTypes,
  isImageSortType,
} from "../imageType";
import { PubSub } from "../sortingPubSub";

export function setupImageTypeRadioButtons(pubsub: PubSub) {
  const element = document.getElementById("imageTypeRadio")!;
  element.innerHTML = html` <label>Sorteringstype</label>
    <div
      class="btn-group"
      role="group"
      aria-label="Basic radio toggle button group"
    >
      ${imageSortTypes.map((method) => radio(method)).join("")}
    </div>`;
  element.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    if (target.type === "radio" && target.checked) {
      if (!isImageSortType(target.id)) {
        throw new Error(`Invalid image sort type: ${target.id}`);
      }
      pubsub.publish("setImageSortType", { method: target.id });
    }
  };
}

function radio(method: ImageSortType): string {
  return html`<input
      type="radio"
      class="btn-check"
      name="image-sort"
      id="${method}"
      ${method === "rows" ? "checked" : ""}
      autocomplete="off"
    />
    <label class="btn btn-outline-primary" for="${method}"
      >${imageSortTypeDescriptions[method]}</label
    >`;
}
