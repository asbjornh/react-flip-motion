/* eslint-disable react/no-multi-comp, react/prefer-stateless-function */
jest.disableAutomock().useRealTimers();

const React = require("react");
const FlipMotion = require("../src").default;
const FlipMotionHeight = require("../src").FlipMotionHeight;
const { Motion, TransitionMotion } = require("react-motion");
const TestUtils = require("react-dom/test-utils");

const { findRenderedChildren } = require("./utils");

class View extends React.Component {
  render() {
    return <div {...this.props} />;
  }
}

function testComponentHOC(FlipComponent) {
  return class TestComponent extends React.Component {
    state = {
      list: [{ id: "0", text: "foo" }, { id: "1", text: "bar" }]
    };
    render() {
      return (
        <FlipComponent>
          {this.state.list.map(item => (
            <View style={{ height: 10, fontSize: 10 }} key={item.id}>
              {item.text}
            </View>
          ))}
        </FlipComponent>
      );
    }
  };
}

const TestComponent = testComponentHOC(FlipMotion);
const TestComponentHeight = testComponentHOC(FlipMotionHeight);

describe("FlipMotion", () => {
  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
  });

  it("doesn't crash", () => {
    expect(() =>
      TestUtils.renderIntoDocument(
        <FlipMotion>
          <div key={1} />
          <div key={2} />
        </FlipMotion>
      )
    ).not.toThrow();
  });

  it("renders children", () => {
    const testComponent = TestUtils.renderIntoDocument(<TestComponent />);

    const elements = findRenderedChildren(
      [testComponent, FlipMotion, TransitionMotion],
      View
    );
    expect(elements.length).toBe(2);
    expect(elements[0].props.children).toBe("foo");
    expect(elements[1].props.children).toBe("bar");
  });

  it("transitions between states", () => {
    const testComponent = TestUtils.renderIntoDocument(<TestComponent />);

    return new Promise(done => {
      testComponent.setState(
        state => ({
          list: state.list.concat().reverse()
        }),
        () => {
          const elements = findRenderedChildren(
            [testComponent, FlipMotion, TransitionMotion],
            View
          );
          expect(elements[0].props.children).toBe("foo");
          expect(elements[1].props.children).toBe("bar");

          setTimeout(() => {
            const elements = findRenderedChildren(
              [testComponent, FlipMotion, TransitionMotion],
              View
            );
            expect(elements.length).toBe(2);
            expect(elements[0].props.children).toBe("bar");
            expect(elements[1].props.children).toBe("foo");

            done();
          }, 50);
        }
      );
    });
  });
});

describe("FlipMotionHeight", () => {
  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
  });

  it("doesn't crash", () => {
    expect(() =>
      TestUtils.renderIntoDocument(
        <FlipMotionHeight>
          <div key={1} />
          <div key={2} />
        </FlipMotionHeight>
      )
    ).not.toThrow();
  });

  it("renders children", () => {
    const testComponent = TestUtils.renderIntoDocument(<TestComponentHeight />);

    const elements = findRenderedChildren(
      [testComponent, FlipMotionHeight, Motion, TransitionMotion],
      View
    );
    expect(elements.length).toBe(2);
    expect(elements[0].props.children).toBe("foo");
    expect(elements[1].props.children).toBe("bar");
  });
});
