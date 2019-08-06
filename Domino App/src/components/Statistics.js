import React from "react";

class Statistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timesPlaceOnBoard: this.props.timesPlaceOnBoard,
      timesDrawFromStack: this.props.timesDrawFromStack,
    };

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.timesPlaceOnBoard !== this.state.timesPlaceOnBoard)
      this.setState({ timesPlaceOnBoard: nextProps.timesPlaceOnBoard });
    if (nextProps.timesDrawFromStack !== this.state.timesDrawFromStack)
      this.setState({ timesDrawFromStack: nextProps.timesDrawFromStack });
  }

  calcScore() {
    var score = 0;
    if (this.props.playerDominos)
      this.props.playerDominos.forEach(item => {
        score += item.high + item.low;
      });
    return score;
  }
  render() {
    return (
      <React.Fragment>
        <div id="statistics">
          <div>
            <h2>stats</h2>
            moves:{" "}
            {this.state.timesPlaceOnBoard + this.state.timesDrawFromStack}
            <br />
            score: {this.calcScore()}
            <div id="timer">
              time:{this.props.minutes}:{this.props.seconds}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }



}

export default Statistics;
