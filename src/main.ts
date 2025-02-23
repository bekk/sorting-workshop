import { run } from "./newProgram.ts";
import "./style.css";
import P5 from "p5";

export type P5Closure = (p: P5) => void;

const root = document.getElementById("app")!;
new P5(run, root);
