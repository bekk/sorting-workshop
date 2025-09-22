import {
  ArrayInitMethod,
  arrayInitMethodDescriptions,
  arrayInitMethods,
  isArrayInitMethod,
} from "../arrayInitialize";
import { html } from "../html";
import { PubSub } from "../sortingPubSub";

export function setupInitTypeRadioButtons(pubsub: PubSub) {
  const element = document.getElementById("initTypeRadio")!;
  element.innerHTML = html` <label>Genereringsmetode</label>
    <div
      class="btn-group"
      role="group"
      aria-label="Basic radio toggle button group"
    >
      ${arrayInitMethods.map((method) => radio(method)).join("")}
    </div>`;
  element.onclick = (event) => {
    const target = event.target as HTMLInputElement;
    if (target.type === "radio" && target.checked) {
      if (!isArrayInitMethod(target.id)) {
        throw new Error(`Invalid array init method: ${target.id}`);
      }
      pubsub.publish("setArrayInitMethod", { method: target.id });
    }
  };
}

function radio(method: ArrayInitMethod): string {
  return html`<input
      type="radio"
      class="btn-check"
      name="btnradio"
      id="${method}"
      ${method === "shuffled" ? "checked" : ""}
      autocomplete="off"
    />
    <label class="btn btn-outline-primary" for="${method}"
      >${arrayInitMethodDescriptions[method]}</label
    >`;
}
