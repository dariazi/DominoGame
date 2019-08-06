import React from "react";
import Domino from "./Domino";
import Allowed from "./Allowed";

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      boardDominos: this.props.dominos,
      selectedDomino: this.props.selectedDomino,
      allowedPlaces: null
    };
  }
  componentDidMount() {
    var game = document.getElementById("game");
    game.scrollTop = 1450;
    game.scrollLeft = 3000;
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.dominos === this.state.boardDominos) return false;
    else return true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dominos !== this.state.boardDominos)
      this.setState({ boardDominos: nextProps.dominos });
    if (nextProps.allowedPlaces !== this.state.allowedPlaces)
      this.setState({ allowedPlaces: nextProps.allowedPlaces });
  }

  drawAllowedPlaces() {
    var i = 0;
    var allowed = [];
    if (this.state.allowedPlaces) {
      this.state.allowedPlaces.map(item => {
        allowed[i] = (
          <Allowed
            key={`${item.x},${item.y}`}
            x={item.x}
            y={item.y}
            axis={item.axis}
            moveTileToBoard={this.props.moveTileToBoard}
          />
        );
        i++;
      });
    }
    return allowed;
  }

  drawBoardDominos() {
    var i = 0;
    var dominos = [];
    if (this.state.boardDominos) {
      this.state.boardDominos.map(item => {
        dominos[i] = (
          <Domino
            key={`${item.high}${item.low}`}
            high={item.high}
            low={item.low}
            place={item.place}
            x={item.x}
            y={item.y}
            axis={item.axis}
          />
        );
        i++;
      });
    }

    return dominos;
  }

  render() {
    return (
      <div id="board">
        {this.drawBoardDominos()}
        {this.drawAllowedPlaces()}
      </div>
    );
  }
}

export default Board;
