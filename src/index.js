import React, { Component, Children } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import raf from "raf";
import { TransitionMotion, spring } from "react-motion";

class FlipMotion extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node)
    ]),
    childClassName: PropTypes.string,
    childComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    childStyle: PropTypes.object,
    className: PropTypes.string,
    component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    springConfig: PropTypes.shape({
      stiffness: PropTypes.number,
      damping: PropTypes.number,
      precision: PropTypes.number
    }),
    style: PropTypes.object
  };

  static defaultProps = {
    childStyle: {},
    component: "div",
    childComponent: "div"
  };

  constructor(props) {
    super(props);
    this.state = {
      shouldMeasure: false,
      previousPosition: null,
      transform: null
    };
    this.children = {};
  }

  getStyles() {
    const { elementsThatWillUnmount, unmountingElements } = this.state;

    // If some elements are unmounting, use previousChildren to be able to add out transition to leaving elements
    const children =
      (unmountingElements && Object.keys(unmountingElements).length) ||
      (elementsThatWillUnmount && Object.keys(elementsThatWillUnmount).length)
        ? this.state.previousChildren
        : this.props.children;

    return Children.map(children, child => {
      return {
        data: child,
        style:
          unmountingElements && unmountingElements[child.key]
            ? {
                x: spring(0, this.props.springConfig),
                y: spring(0, this.props.springConfig),
                opacity: spring(0, this.props.springConfig),
                scale: spring(0.6, this.props.springConfig)
              }
            : {
                x: spring(0, this.props.springConfig),
                y: spring(0, this.props.springConfig),
                ...(this.state.transform && this.state.transform[child.key]
                  ? this.state.transform[child.key]
                  : null),
                opacity: spring(1, this.props.springConfig),
                scale: spring(1, this.props.springConfig)
              },
        key: child.key
      };
    });
  }

  pruneUnmountingElements() {
    // Remove elements that have completed their out transition
    const prunedUnmountingElements = {};

    Object.keys(this.state.unmountingElements || {}).forEach(key => {
      const childEl = this.children[key];
      if (childEl && parseFloat(childEl.style.opacity) !== 0) {
        prunedUnmountingElements[key] = this.state.unmountingElements[key];
      }
    });

    if (!Object.keys(prunedUnmountingElements).length) {
      clearInterval(this.pruneLoop);
    }

    this.setState({ unmountingElements: prunedUnmountingElements });
  }

  componentWillReceiveProps(nextProps) {
    const prevChildren = Children.toArray(this.props.children);
    const nextChildren = Children.toArray(nextProps.children);
    if (
      nextChildren.some(
        (item, index) =>
          !prevChildren[index] || item.key !== prevChildren[index].key
      ) ||
      prevChildren.length !== nextChildren.length
    ) {
      const elementsThatWillUnmount = {};
      const nextKeys = Children.map(nextProps.children, child => child.key);
      const parentRect = findDOMNode(this).getBoundingClientRect();

      Children.forEach(this.props.children, (prevChild, index) => {
        // If key is missing in nextKeys element is about to unmount. Store dimensions to be able to position absolutely
        if (nextKeys.indexOf(prevChild.key) === -1) {
          const child = this.children[prevChild.key];
          const rect = child.getBoundingClientRect();

          elementsThatWillUnmount[prevChild.key] = {
            index,
            styles: {
              height: rect.height,
              width: rect.width,
              left: rect.left - parentRect.left,
              top: rect.top + -parentRect.top,
              position: "absolute",
              zIndex: -1
            }
          };
        }
      });

      // Insert unmounting elements into nextProps.children to keep them mounted so they can be animated out
      const previousChildren = Object.assign([], nextProps.children);
      Object.keys(elementsThatWillUnmount).forEach(key => {
        const index = elementsThatWillUnmount[key].index;
        previousChildren.push(this.props.children[index]);
      });

      // As TransitionMotion does not provide a callback for motion end, we need to manually remove the elements that have completed their out transition and are ready to be unmounted
      clearInterval(this.pruneLoop);
      this.pruneLoop = setInterval(
        this.pruneUnmountingElements.bind(this),
        100
      );

      this.setState({
        elementsThatWillUnmount,
        unmountingElements: {},
        shouldMeasure: true,
        previousChildren,
        previousPosition: Object.keys(this.children).reduce((acc, key) => {
          if (this.children[key]) {
            acc[key] = this.children[key].getBoundingClientRect();
          }
          return acc;
        }, {}),
        transform: null
      });
    }
  }

  componentDidUpdate() {
    if (this.state.shouldMeasure) {
      raf(() => {
        this.setState(
          state => {
            return {
              elementsThatWillUnmount: null,
              unmountingElements: state.elementsThatWillUnmount,
              shouldMeasure: false,
              transform: Object.keys(this.children).reduce((acc, key) => {
                if (!this.children[key]) {
                  acc[key] = {
                    x: 0,
                    y: 0
                  };
                  return acc;
                }
                const nextRect = this.children[key].getBoundingClientRect();
                if (state.previousPosition && state.previousPosition[key]) {
                  acc[key] = {
                    x: state.previousPosition[key].left - nextRect.left,
                    y: state.previousPosition[key].top - nextRect.top
                  };
                }
                return acc;
              }, {}),
              previousPosition: null
            };
          },
          () => {
            if (this.state.transform) {
              this.setState(state => ({
                transform: Object.keys(state.transform).reduce((acc, key) => {
                  acc[key] = {
                    x: spring(0, this.props.springConfig),
                    y: spring(0, this.props.springConfig)
                  };
                  return acc;
                }, {})
              }));
              this.children = {};
            }
          }
        );
      });
    }
  }

  willEnter() {
    return {
      x: 0,
      y: 0,
      scale: 0.8,
      opacity: 0
    };
  }

  render() {
    const style = this.props.style;
    const childStyle = this.props.childStyle;
    const Component = this.props.component;
    const ChildComponent = this.props.childComponent;
    const elementsThatWillUnmount = this.state.elementsThatWillUnmount || {};
    const unmountingElements = this.state.unmountingElements || {};

    return (
      <TransitionMotion styles={this.getStyles()} willEnter={this.willEnter}>
        {styles => (
          <Component
            style={{ ...style, position: "relative" }}
            className={this.props.className}
          >
            {styles.map(item => {
              const willUnmount =
                this.state.shouldMeasure &&
                (elementsThatWillUnmount[item.key] ||
                  unmountingElements[item.key]);
              const isUnMounting = unmountingElements[item.key];
              const unMountingStyles =
                isUnMounting && unmountingElements[item.key].styles;

              return (
                <ChildComponent
                  className={this.props.childClassName}
                  key={item.key}
                  style={
                    item.style && {
                      ...childStyle,
                      ...unMountingStyles,
                      display: willUnmount ? "none" : childStyle.display,
                      opacity: item.style.opacity,
                      transform: `translate(${item.style.x}px, ${
                        item.style.y
                      }px) scale(${item.style.scale})`,
                      WebkitTransform: `translate(${item.style.x}px, ${
                        item.style.y
                      }px) scale(${item.style.scale})`
                    }
                  }
                  ref={c => (this.children[item.key] = c)}
                >
                  {item.data}
                </ChildComponent>
              );
            })}
          </Component>
        )}
      </TransitionMotion>
    );
  }
}

export default FlipMotion;
