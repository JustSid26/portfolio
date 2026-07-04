import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);
}

export { ScrollTrigger, SplitText };
export default gsap;
