import PropTypes from "prop-types";

const StaticWrapper = ({ children }) => children({ height: null });

StaticWrapper.propTypes = {
  children: PropTypes.func
};

export default StaticWrapper;
