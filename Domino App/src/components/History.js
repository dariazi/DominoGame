import React from "react";

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: props.current
    };
  }
  render() {
    var StyleNext = {
      left: "70%"
    };
    var StylePrev = {
      left: "30%"
    };
    var StyleReset = {
      position: "absolute",
      top: "10%",
      left: "50%"
    };

    return (
      <div id="History">
        <button
          className="togglebutton"
          type="button"
          style={StyleNext}
          onClick={() => {
            this.setState(prevState => {
              return { current: prevState.current + 1 };
            });
            this.props.rewind(this.state.current + 1);
          }}
          disabled={this.state.current === this.props.moves - 1 ? true : false}
        >
          &gt;
        </button>
        <button
          className="togglebutton"
          type="button"
          style={StylePrev}
          onClick={() => {
            this.setState(prevState => {
              return { current: prevState.current - 1 };
            });
            this.props.rewind(this.state.current - 1);
          }}
          disabled={this.state.current === 0 ? true : false}
        >
          &lt;
        </button>

        <button
          className="resetbutton"
          style={StyleReset}
          onClick={() => {
            this.props.resetGame();
          }}
        >
          Restart
        </button>
      </div>
    );
  }
}
export default History;
