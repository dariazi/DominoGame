import React from "react";
import Domino from "./Domino";
import Statistics from "./Statistics";
class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerDominos: this.props.playerDominos,
      stackDominos: this.props.stackDominos
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.playerDominos !== this.state.playerDominos)
      this.setState({ playerDominos: nextProps.playerDominos });
    if (nextProps.stackDominos !== this.state.stackDomios)
      this.setState({ stackDominos: nextProps.stackDominos });
  }

  drawPlayerStack() {
    var i = 0;
    var dominos = [];
    if (this.state.playerDominos) {
      this.state.playerDominos.forEach(item => {
        dominos[i] = (
          <Domino
            key={`${item.high},${item.low}`}
            high={item.high}
            low={item.low}
            place={item.place}
            x={60 * (i + 1)}
            y={item.y}
            axis={item.axis}
            selectDomino={this.props.selectDomino}
            selectedDomino={this.props.myTurn ? this.props.selectedDomino:"pending"}
          />
        );
        i++;
      });
    }

    return dominos;
  }

  drawFromStack() {
    this.setState(prevState => {
      return { timesDrawFromStack: prevState.timesDrawFromStack + 1 };
    });
  }

  render() {
    var stackStyle={
    opacity: 1};
    var allowDraw=false;
    if(this.props.myTurn){
   (!this.props.checkAvailableMoves() ? allowDraw=true: allowDraw=false)
   stackStyle={
    opacity: (allowDraw? 1:0.6)}
  }
    else{ 
        stackStyle={
        opacity: 0.6}
    }
    
    if (this.state.stackDominos) {
      var num = this.state.stackDominos.length;
      var stackPic = num === 0 ? "emptystack" : "stack";
    }
    return (
      <div id="player">
        <div id="stack" style={stackStyle}>
          <img
            src={`./${stackPic}.png`} 
            alt="stack"
            onClick={allowDraw ? this.props.drawCard.bind(this) : null}
          />
          <div>{num}</div>
        </div>
        <div id="cards">{this.drawPlayerStack()}</div>

        <Statistics
          timesPlaceOnBoard={this.props.timesPlaceOnBoard}
          timesDrawFromStack={this.props.timesDrawFromStack}
          playerDominos={this.state.playerDominos}
          seconds={this.props.seconds}
          minutes={this.props.minutes}
        />
      </div>
    );
  }
}

export default Player;
