import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, DrawSVGPlugin);
    if (process.env.NODE_ENV !== "production") {
        // debugging aid: inspect triggers from the console
        (window as unknown as { gsap?: typeof gsap; ScrollTrigger?: typeof ScrollTrigger }).gsap = gsap;
        (window as unknown as { gsap?: typeof gsap; ScrollTrigger?: typeof ScrollTrigger }).ScrollTrigger = ScrollTrigger;
    }
}

export { ScrollTrigger, SplitText };
export default gsap;
