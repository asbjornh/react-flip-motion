import React from "react";
import PropTypes from "prop-types";
import { Motion } from "react-motion";

const AnimatedWrapper = ({ children, height, onRest }) => (
  <Motion defaultStyle={{ height: 0 }} style={{ height }} onRest={onRest}>
    {children}
  </Motion>
);

AnimatedWrapper.propTypes = {
  children: PropTypes.func,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  onRest: PropTypes.func
};

export default AnimatedWrapper;
