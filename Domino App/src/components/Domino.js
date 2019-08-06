import React from "react";

class Domino extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      axis: props.axis,
      x: props.x,
      y: props.y,
      high: props.high,
      low: props.low,
      place: props.place
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.place !== this.state.place)
      this.setState({ place: nextProps.place });
    if (nextProps.x !== this.state.x) this.setState({ x: nextProps.x });
  }
  render() {
    var style;
    var selected = {
      left: this.state.x - 2 ,
      top: this.state.y -2,
      transform: `rotate(${this.state.axis}deg)`,
      outline: "none",
      boxShadow: "4px 4px 4px #2f3135" 
    };
    var regular = {
      left: this.state.x, 
      top: this.state.y,
      transform: `rotate(${this.state.axis}deg)`,
      outline: "none",
      opacity: 1
    }
    var pending  = {
      left: this.state.x, 
      top: this.state.y,
      transform: `rotate(${this.state.axis}deg)`,
      outline: "none",
      opacity: 0.8
    }
    style=this.props.selectedDomino ? (this.state.high===this.props.selectedDomino.high&&
      this.state.low===this.props.selectedDomino.low ? selected: (this.props.selectedDomino==="pending" ? pending:regular) ):regular
    return (
      <div
        className="Domino"
        style={style}
        onClick={()=>{
          if(this.state.y<10)
          {this.props.selectDomino(
              this.state.high,
              this.state.low
            )} } }>
        <img
          className="high"
          src={`./${this.state.high}.png`}
          alt={`${this.state.high}`}
        />
        <img
          className="low"
          src={`./${this.state.low}.png`}
          alt={`${this.state.low}`}
        />
      </div>
    );
  }
}

export default Domino;
