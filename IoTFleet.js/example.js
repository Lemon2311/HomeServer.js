import { output, input } from "./script.js";

const { d13, a25 } = output("192.168.1.138", "d13", "a25");

d13.set("high");
a25.set(2);

const { d3, a34 } = input("192.168.1.138", "d3", "a34");

d3.get();
a34.get();
