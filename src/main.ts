import "./style.css";
import P5 from "p5";
import { program } from "./program.ts";

export type P5Closure = (p: P5) => void;

const root = document.getElementById("app")!;
new P5(program, root);
