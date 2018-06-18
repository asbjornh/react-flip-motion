import React from "react";
import PropTypes from "prop-types";
import { Motion } from "react-motion";

const AnimatedWrapper = ({ animateWrapper, children, height, onRest }) =>
  animateWrapper ? (
    <Motion defaultStyle={{ height: 0 }} style={{ height }} onRest={onRest}>
      {children}
    </Motion>
  ) : (
    children({ height: "auto" })
  );

AnimatedWrapper.propTypes = {
  children: PropTypes.func,
  animateWrapper: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  onRest: PropTypes.func
};

export default AnimatedWrapper;
