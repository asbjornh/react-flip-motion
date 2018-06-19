const TestUtils = require("react-dom/test-utils");

// Recursively find rendered components
function findRenderedComponent(componentTypes) {
  const component = TestUtils.findRenderedComponentWithType(
    componentTypes[0],
    componentTypes[1]
  );

  return componentTypes.length === 2
    ? component
    : findRenderedComponent([].concat(component, componentTypes.slice(2)));
}

// Find children of type childType within component tree
function findRenderedChildren(componentTypes, childType) {
  const parent = findRenderedComponent(componentTypes);

  return TestUtils.scryRenderedComponentsWithType(parent, childType);
}

module.exports = {
  findRenderedComponent,
  findRenderedChildren
};
