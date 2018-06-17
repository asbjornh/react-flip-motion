import React, { Component } from "react";
import ReactDOM from "react-dom";

import FlipMotion from "../src";

require("./style.css");

function getColor(index) {
  const colors = ["#ff5e47", "#ffcf47", "#0088ff", "#11c764"];
  return typeof index !== "undefined"
    ? colors[index]
    : colors[Math.floor(Math.random() * colors.length)];
}

function getLetter() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[Math.floor(Math.random() * letters.length)];
}

function getItem() {
  return {
    id: String(Math.random()),
    content: getLetter(),
    color: getColor()
  };
}

class App extends Component {
  state = {
    list: [
      { id: "0", content: "A", color: getColor(0) },
      { id: "1", content: "B", color: getColor(1) },
      { id: "2", content: "C", color: getColor(2) }
    ]
  };

  shuffle = () => {
    this.setState(({ list }) => ({
      list: list.concat().sort(() => (Math.random() > 0.5 ? -1 : 1))
    }));
  };

  addAndRemove = () => {
    this.setState(({ list }) => ({
      list: list
        .concat()
        .filter(() => Math.random() > 0.5)
        .concat([...Array(5)].map(() => getItem()))
    }));
  };

  addItemRandomly = () => {
    this.setState(({ list }) => {
      const index = Math.floor(Math.random() * list.length);
      return {
        list: [...list.slice(0, index), getItem(), ...list.slice(index)]
      };
    });
  };

  replaceItemRandomly = () => {
    this.setState(({ list }) => {
      const index = Math.floor(Math.random() * list.length);
      return {
        list: [...list.slice(0, index), getItem(), ...list.slice(index + 1)]
      };
    });
  };

  deleteItemRandomly = () => {
    this.setState(({ list }) => {
      const index = Math.floor(Math.random() * list.length);
      return list.length === 1
        ? { list: [] }
        : {
            list: [...list.slice(0, index), ...list.slice(index + 1)]
          };
    });
  };

  deleteMultipleItemsRandomly = () => {
    this.setState(({ list }) => {
      return {
        list: list.concat().filter(() => Math.random() > 0.5)
      };
    });
  };

  render() {
    return (
      <div>
        <h1>FlipMotion</h1>
        <button onClick={this.shuffle}>Shuffle the list</button>
        <button onClick={this.addItemRandomly}>Add an item</button>
        <button onClick={this.deleteItemRandomly}>Delete an item</button>
        <button onClick={this.deleteMultipleItemsRandomly}>
          Delete multiple items
        </button>
        <button onClick={this.addAndRemove}>Delete and add</button>
        <button onClick={this.replaceItemRandomly}>Replace an item</button>
        <FlipMotion className="wrapper" childClassName="card">
          {this.state.list.map(item => (
            <div
              className="card-content"
              key={item.id}
              style={{ backgroundColor: item.color }}
            >
              {item.content}
            </div>
          ))}
        </FlipMotion>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("App"));
