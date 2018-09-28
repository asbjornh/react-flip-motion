import React, { Component, Children } from "react";
import { findDOMNode } from "react-dom";
import PropTypes from "prop-types";
import raf from "raf";
import { TransitionMotion, spring } from "react-motion";

export default function(Wrapper) {
  return class FlipMotion extends Component {
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
      scaleX: PropTypes.number,
      scaleY: PropTypes.number,
      springConfig: PropTypes.shape({
        stiffness: PropTypes.number,
        damping: PropTypes.number,
        precision: PropTypes.number
      }),
      style: PropTypes.object
    };

    static defaultProps = {
      animateWrapper: true,
      childStyle: {},
      component: "div",
      childComponent: "div",
      scaleX: 0.6,
      scaleY: 0.6
    };

    state = {
      height: 0,
      isAnimatingHeight: false,
      shouldMeasure: false,
      previousChildren: null,
      previousPosition: null,
      transform: null,
      unmountingElements: null
    };

    children = {};
    newHeight = 0;

    getTransform = ({ scaleX, scaleY, x, y }) => {
      if (x === 0 && y === 0 && scaleX === 1 && scaleY === 1) return {};
      const transformString = `translate(${x}px, ${y}px) scaleX(${scaleX}) scaleY(${scaleY})`;
      return {
        transform: transformString,
        WebkitTransform: transformString
      };
    };

    getStyles() {
      const { shouldMeasure, unmountingElements } = this.state;
      const { scaleX, scaleY, springConfig } = this.props;

      // If some elements are unmounting, use previousChildren to be able to add out transition to leaving elements
      const children =
        unmountingElements && Object.keys(unmountingElements).length
          ? this.state.previousChildren
          : this.props.children;

      return Children.map(children, child => {
        return {
          data: child,
          style:
            unmountingElements && unmountingElements[child.key]
              ? {
                  x: 0,
                  y: 0,
                  opacity: shouldMeasure ? 1 : spring(0, springConfig),
                  scaleX: shouldMeasure ? 1 : spring(scaleX, springConfig),
                  scaleY: shouldMeasure ? 1 : spring(scaleY, springConfig)
                }
              : {
                  x: spring(0, springConfig),
                  y: spring(0, springConfig),
                  ...(this.state.transform && this.state.transform[child.key]
                    ? this.state.transform[child.key]
                    : null),
                  opacity: spring(1, springConfig),
                  scaleX: spring(1, springConfig),
                  scaleY: spring(1, springConfig)
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

    componentDidUpdate(prevProps) {
      const prevChildren = Children.toArray(prevProps.children);
      const nextChildren = Children.toArray(this.props.children);
      const hasSameChildren =
        prevChildren.length === nextChildren.length &&
        nextChildren.every(
          (item, index) => item.key === prevChildren[index].key
        );

      if (hasSameChildren) {
        return;
      }

      const containerHeight = findDOMNode(this).offsetHeight;
      const unmountingElements = {};
      const nextKeys = Children.map(this.props.children, child => child.key);
      const parentRect = findDOMNode(this).getBoundingClientRect();

      Children.forEach(prevProps.children, (prevChild, index) => {
        // If key is missing in nextKeys element is about to unmount. Store dimensions to be able to position absolutely
        if (nextKeys.indexOf(prevChild.key) === -1) {
          const child = this.children[prevChild.key];
          const rect = child
            ? child.getBoundingClientRect()
            : { top: parentRect.top, left: parentRect.left };

          unmountingElements[prevChild.key] = {
            index,
            styles: {
              height: rect.height,
              width: rect.width,
              left: rect.left - parentRect.left,
              top: rect.top - parentRect.top,
              position: "absolute",
              zIndex: 0
            }
          };
        }
      });

      // Combine nextProps.children with unmounting elements to keep them mounted so they can be animated out
      const previousChildren = [].concat(
        this.props.children,
        Object.values(unmountingElements).map(
          element => prevProps.children[element.index]
        )
      );

      // As TransitionMotion does not provide a callback for motion end, we need to manually remove the elements that have completed their out transition and are ready to be unmounted
      clearInterval(this.pruneLoop);
      this.pruneLoop = setInterval(
        this.pruneUnmountingElements.bind(this),
        100
      );

      this.setState(
        {
          unmountingElements,
          shouldMeasure: true,
          previousChildren,
          previousPosition: Object.entries(this.children).reduce(
            (acc, [key, child]) =>
              Object.assign(
                acc,
                child ? { [key]: child.getBoundingClientRect() } : {}
              ),
            {}
          ),
          transform: null
        },
        () => {
          raf.cancel(this.raf);
          this.raf = raf(() => {
            this.setState(
              state => {
                this.newHeight = findDOMNode(this).offsetHeight;
                return {
                  height: containerHeight,
                  shouldMeasure: false,
                  transform: Object.entries(this.children).reduce(
                    (acc, [key, child]) => {
                      const previousRect = state.previousPosition[key];
                      const childRect = child && child.getBoundingClientRect();
                      return Object.assign({}, acc, {
                        [key]:
                          childRect && previousRect
                            ? {
                                x: previousRect.left - childRect.left,
                                y: previousRect.top - childRect.top
                              }
                            : { x: 0, y: 0 }
                      });
                    },
                    {}
                  ),
                  previousPosition: null
                };
              },
              () => {
                if (this.state.transform) {
                  this.setState(state => ({
                    height: spring(this.newHeight, this.props.springConfig),
                    isAnimatingHeight: true,
                    transform: Object.keys(state.transform).reduce(
                      (acc, key) =>
                        Object.assign({}, acc, {
                          [key]: {
                            x: spring(0, this.props.springConfig),
                            y: spring(0, this.props.springConfig)
                          }
                        }),
                      {}
                    )
                  }));
                  this.children = {};
                }
              }
            );
          });
        }
      );
    }

    componentWillUnmount() {
      raf.cancel(this.raf);
      clearInterval(this.pruneLoop);
    }

    willEnter = () => {
      return {
        x: 0,
        y: 0,
        scaleX: this.props.scaleX,
        scaleY: this.props.scaleY,
        opacity: 0
      };
    };

    onHeightAnimationRest = () => {
      this.setState({ isAnimatingHeight: false });
    };

    render() {
      const { style, childStyle } = this.props;
      const { isAnimatingHeight, shouldMeasure } = this.state;
      const Component = this.props.component;
      const ChildComponent = this.props.childComponent;
      const unmountingElements = this.state.unmountingElements || {};
      const hasUnmountingElements = Object.keys(unmountingElements).length;

      return (
        <Wrapper height={this.state.height} onRest={this.onHeightAnimationRest}>
          {({ height }) => (
            <TransitionMotion
              styles={this.getStyles()}
              willEnter={this.willEnter}
            >
              {styles => (
                <Component
                  style={{
                    ...style,
                    height:
                      shouldMeasure || !isAnimatingHeight ? "auto" : height,
                    position: "relative"
                  }}
                  className={this.props.className}
                >
                  {styles.map(item => {
                    const willUnmount =
                      shouldMeasure && unmountingElements[item.key];
                    const unMountingStyles =
                      unmountingElements[item.key] &&
                      unmountingElements[item.key].styles;

                    return (
                      <ChildComponent
                        className={this.props.childClassName}
                        key={item.key}
                        style={
                          item.style && {
                            ...childStyle,
                            ...(hasUnmountingElements
                              ? {
                                  position: "relative",
                                  zIndex: 1
                                }
                              : {}),
                            ...unMountingStyles,
                            ...this.getTransform(item.style),
                            display: willUnmount ? "none" : childStyle.display,
                            opacity: item.style.opacity
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
          )}
        </Wrapper>
      );
    }
  };
}
