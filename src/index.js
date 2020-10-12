import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  if (props.highlight) {
    return (
      <button className="square highlight" onClick={() => props.onClick()}>
        {props.value}
      </button>
    );
  } else {
    return (
      <button className="square" onClick={() => props.onClick()}>
        {props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i, isHighlighted) {
    return (
      <Square
        highlight={isHighlighted}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderBoard() {
    let board = [];
    const result = this.props.result;
    for (let i = 0; i < 3; i++) {
      let boardRow = [];
      for (let j = 0; j < 3; j++) {
        const iCell = i * 3 + j;
        if (
          result &&
          (result[1] === iCell || result[2] === iCell || result[3] === iCell)
        )
          boardRow.push(this.renderSquare(iCell, true));
        else boardRow.push(this.renderSquare(iCell, false));
      }
      board.push(<div className="board-row">{boardRow}</div>);
    }
    return board;
  }

  render() {
    return <div>{this.renderBoard()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
        },
      ],
      xIsNext: true,
      stepNumber: 0,
      orderedChecked: Array(0),
      isReversedMoves: false,
      copiedOrReversedOrderChecked: Array(0),
    };
    this.toggleMoves = this.toggleMoves.bind(this);
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const cloneSquares = current.squares.slice();
    const cloneOrderChecked = this.state.orderedChecked.concat(i);
    if (calculateWinner(cloneSquares) || cloneSquares[i]) {
      return;
    }
    cloneSquares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([{ squares: cloneSquares }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
      orderedChecked: cloneOrderChecked,
      copiedOrReversedOrderChecked: cloneOrderChecked,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  toggleMoves() {
    this.setState({
      isReversedMoves: !this.state.isReversedMoves,
      copiedOrReversedOrderChecked: this.state.copiedOrReversedOrderChecked
        .slice()
        .reverse(),
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    const result = calculateWinner(current.squares);
    const winner = result && result[0];
    let moves;
    moves = history.map((step, move) => {
      if (this.state.isReversedMoves === true) {
        move = history.length - 1 - move;
      }
      const iCell = this.state.copiedOrReversedOrderChecked[move - 1];
      const nRow = ~~(iCell / 3);
      const nCol = iCell % 3;
      const desc = move
        ? "Go to move #" + move + " (" + nRow + ", " + nCol + ")"
        : "Go to game start";
      if (move === this.state.stepNumber) {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>
              <b>{desc}</b>
            </button>
          </li>
        );
      } else {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
      }
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else if (this.state.history.length === 10) {
      status = "Draw match !";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            result={result}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ul>
            <li>
              <button onClick={this.toggleMoves}>Toggle moves</button>
            </li>
          </ul>
          {this.state.isReversedMoves === false && <ol>{moves}</ol>}
          {this.state.isReversedMoves === true && <ol reversed>{moves}</ol>}
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], a, b, c];
    }
  }
  return null;
}
