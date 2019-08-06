import React from "react";

class Allowed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      axis: props.axis,
      x: props.x,
      y: props.y
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.x !== this.state.x) this.setState({ x: nextProps.x });
    if (nextProps.y !== this.state.y) this.setState({ y: nextProps.y });
    if (nextProps.axis !== this.state.axis)
      this.setState({ axis: nextProps.axis });
  }
  render() {
    var style;
    style = {
      left: this.state.x,
      top: this.state.y,
      transform: `rotate(${this.state.axis}deg)`
    };
    return (
      <React.Fragment>
        <div
          className="Allowed"
          style={style}
          onClick={this.props.moveTileToBoard.bind(this, this.state)}
        />
      </React.Fragment>
    );
  }
}

export default Allowed;
