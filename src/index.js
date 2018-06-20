import AnimatedWrapper from "./animated-wrapper";
import FlipMotionHOC from "./flip-motion";
import StaticWrapper from "./static-wrapper";

export const FlipMotionHeight = FlipMotionHOC(AnimatedWrapper);
export const FlipMotion = FlipMotionHOC(StaticWrapper);

export default FlipMotion;
