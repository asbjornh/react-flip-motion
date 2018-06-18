# react-flip-motion

[![npm version](https://img.shields.io/npm/v/react-flip-motion.svg?style=flat)](https://www.npmjs.com/package/react-flip-motion)

> A simple component to naively perform transitions between children changes

> This is a fork of
> [react-motion-flip](https://github.com/bloodyowl/react-motion-flip), which
> appears to be abandoned

![flipmotion-loop](https://user-images.githubusercontent.com/13281350/33279420-c25b0856-d39e-11e7-9406-0930aa204655.gif)

## Install

```console
npm install --save react-flip-motion
```

or

```console
yarn add react-flip-motion
```

## Import

```javascript
// in ES5/commonJS
var FlipMotion = require("react-flip-motion").default;
// in ES6
import FlipMotion from "react-flip-motion";
```

## API

### FlipMotion

A component that performs transitions between children states.

The only thing you need to do is to pass children. These children **must** have
a `key` prop.

### Props

**childClassName** : String
<br/>Classname for the element wrapping each child

---

**childComponent** : String / ReactClass = `div`
<br/>The element or component wrapping each child

---

**childStyle** : Object
<br/>Style of the element wrapping each child

---

**className** : String
<br/>Classname applied to container element

---

**component** : String / ReactClass = `div`
<br/>The container element or component

---

**scaleX** : Number = `0.6`
<br/>X-scale of children at the start of mounting animation and the end of unmounting animation

---

**scaleY** : Number = `0.6`
<br/>Y-scale of children at the start of mounting animation and the end of unmounting animation

---

**springConfig** : Object
<br/>Spring configuration for react-motion ([docs](https://github.com/chenglou/react-motion#--spring-val-number-config-springhelperconfig--opaqueconfig))

---

**style** : Object
<br/>Style of the container element

---

#### Example

Simple usage:

```jsx
<FlipMotion>
  {list.map((item) =>
    <div key={item.id}>
      {item.text}
    </div>
  })}
</FlipMotion>
```

With custom styles on wrappers:

```jsx
<FlipMotion style={{ display: "flex" }} childStyle={{ flexBasis: 400 }}>
  {children}
</FlipMotion>
```

Elements and classes specified:

```jsx
<FlipMotion
  component="ul"
  className="container"
  childComponent="li"
  childClassName="element"
>
  {children}
</FlipMotion>
```

# Changelog

## 1.2.1

- Fixed unmounting animations not showing if container has a background color

## 1.2.0

- Compatibility with **React 16.4**
- Hopefully fixed unmounting animations for good this time
- Added support for customizing transition scaling with `scaleX` and `scaleY` props

## 1.1.8

- Fixed unmount animations being cancelled when FlipMotion received new props many times in a row in a short span of time.
- [Issue #7](https://github.com/asbjornh/react-flip-motion/issues/7): Fixed unmounting elements not being animated when `nextProps.children` had more elements than `prevProps.children`.
- [Issue #5](https://github.com/asbjornh/react-flip-motion/issues/5): Hopefully fixed issues with buggy transforms caused by positioned parent elements.

# What is FLIP?

**FLIP** is an animation technique from
[Paul Lewis](https://twitter.com/aerotwist). It stands for **First**, **Last**,
**Invert**, **Play**.

- **First**: Before the animation, measure the position of all elements
- **Last**: Let elements render in their new positions and measure
- **Invert**: Use CSS transforms to move the elements to their initial positions
- **Play**: Play the animation (animate the transform to 0)

This technique presents the advantage to remove the need for complex
calculations to guess where the element you animate is going to end up. You just
measure a diff.

> You should read the great article explaining the technique on
> [aerotwist](https://aerotwist.com/blog/flip-your-animations/)

## Why react-motion?

react-motion provides a great way to configure animations: not with time, but
with _physics_. This makes animations really smooth and natural.

> Have a look at
> [react-motion](https://github.com/chenglou/react-motion/#what-does-this-library-try-to-solve)
