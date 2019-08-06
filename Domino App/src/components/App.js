import React from "react";
import Game from "./Game";
import ReactDOM from "react-dom";
import "../style.css";

class App extends React.Component {
  resetGame() {
    ReactDOM.unmountComponentAtNode(document.getElementById("root"));
    ReactDOM.render(
      <Game resetGame={this.resetGame} />,
      document.getElementById("root")
    );
  }
  render() {
    return <Game resetGame={this.resetGame} />;
  }
}

export default App;
