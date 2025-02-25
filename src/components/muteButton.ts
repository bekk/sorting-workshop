import { PubSub } from "../sortingPubSub";

export function setupMuteButton(pubsub: PubSub) {
  let muted = true;
  const container = document.getElementById("soundButton")!;
  const input = container.querySelector("input")!;
  const icon = container.querySelector("i")!;
  input.addEventListener("change", () => {
    muted = input.checked;
    icon.className = muted ? "bi bi-volume-mute" : "bi bi-volume-up";
    icon.classList.toggle("bi-volume-mute", !muted);
    icon.classList.toggle("bi-volume-up", muted);
    pubsub.publish(muted ? "mute" : "unmute");
  });
}
