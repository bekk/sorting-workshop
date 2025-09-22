import { run } from "./imageProgram.ts";
import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import P5 from "p5";

export type P5Closure = (p: P5) => void;

const root = document.getElementById("app")!;
new P5(run, root);
