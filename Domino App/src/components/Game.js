import React from "react";
import Board from "./Board";
import Player from "./Player";
import ChatContainer from "./chatContainer.jsx";
import OnlineUsers from './OnlineUsers.jsx';
// import Statistics from "./Statistics";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      //from server
      gameName:this.props.gameName,
      gameState: "waiting", //playing, over, viewing
      reqPlayers:0,
      numPlayers:0,
      players:null,
      stackDominos:[],
      playerDominos:[],
      boardDominos:[],
      myTurn:false,
      turn:null,
      userState:"user",// "player", "viewer", "won"
      usersStats:[],
      winner:"",
      loser:"",

      //game
      allowedPlaces: null, //places where a domino can be placed
      selectedDomino: null, //domino that was clicked
      timesPlaceOnBoard: 0, //count the times the player put a tile on the board
      timesDrawFromStack: 0, //count the times the player draw a tile from stack
      seconds: 0, //timer
      minutes: 0,
      secForTurn:0,
  
    };

    this.getGameInfo = this.getGameInfo.bind(this);
    this.selectDomino = this.selectDomino.bind(this);
    this.allowedPlaces = this.allowedPlaces.bind(this);
    this.moveTileToBoard = this.moveTileToBoard.bind(this);
    this.drawCard = this.drawCard.bind(this);
    this.refreshGame = this.refreshGame.bind(this);
    this.checkAvailableMoves = this.checkAvailableMoves.bind(this);
    this.skipTurn= this.skipTurn.bind(this)
    this.exitGame= this.exitGame.bind(this)
    this.joinAsViewer= this.joinAsViewer.bind(this)
    this.getStats= this.getStats.bind(this)
    
  }

  componentDidMount() {
    this.getGameInfo();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  getGameInfo(){
    return fetch(`/games/${this.state.gameName}`, {method:'GET', credentials: 'include'})
    .then((response)=> {
        if(!response.ok){
            throw response
        }
        return response.json();
    })
    .then(content=>{
      if(this.state.gameState==="waiting"&&content.gameState==="playing")
        this.interval = setInterval(() => this.tick(), 1000);
      const players=[];
      for (var user in content.onlineUsers) {
        players.push(content.onlineUsers[user])
        }
      this.setState(()=>{
        return{
          gameState: content.gameState,
          reqPlayers:content.reqPlayers,
          numPlayers:content.numPlayers,
          players:players,
          stackDominos:content.stackDominos,
          myTurn:content.myTurn,
          turn:content.turn
        }
      })
      return content
    })
    .then(()=>{
      this.allowedPlaces();
      this.refreshGame();
    })
  }

  refreshGame(){
    
    return fetch(`/games/${this.state.gameName}`, {method:'GET', credentials: 'include'})
    .then((response)=> {
        if(!response.ok){
            throw response
        }
        this.timeoutId= setTimeout(this.refreshGame, 200)
        return response.json();
    })
    .then(content=>{
      if(this.state.gameState==="waiting"&&content.gameState==="playing")
        this.interval = setInterval(() => this.tick(), 1000);
      const players=[];
      for (var user in content.onlineUsers) {
        players.push(content.onlineUsers[user])
        }
      this.setState(()=>{
          
        return{
          players:players,
          gameState: content.gameState,
          numPlayers:content.numPlayers,
          playerDominos: content.playerDominos,
          boardDominos: content.boardDominos,
          stackDominos: content.stackDominos,
          myTurn:content.myTurn,
          turn:content.turn,
          userState:content.userState,
          winner:content.winner,
          loser:content.loser,
        }
      })
      if(this.state.loser!==""){
          clearInterval(this.interval);
          clearTimeout(this.timeoutId);
          this.getStats();
      }
    })
  }

  exitGame() {
    fetch(`/games/pass/${this.state.gameName}`, {method: 'DELETE', credentials: 'include'})
    .then(response => {
        if (!response.ok) {
            console.log(`failed to logout user `, response);                
        }
        this.props.backToGameRooms();
    })
  }


  joinAsViewer(){
    fetch(`/games/${this.state.gameName}/users`, {method:'PUT', credentials: 'include'})
    .then(response => {            
      if (!response.ok) {                
        throw response;
    }        
    });
  }


  checkAvailableMoves(){
      var options = this.state.playerDominos.filter(
        item => this.mapAllowedPlaces(item).length !== 0
      );
      if (options.length === 0){ 
        if(this.state.stackDominos.length===0){
          this.skipTurn()
      }return false;      
    }else return true;// there are avalible moves  
  }

  skipTurn(){
    fetch(`/games/${this.state.gameName}`, {method:'PUT', credentials: 'include'})
    .then(response => {            
      if (!response.ok)              
        throw response;      
    });
  }


  tick() {
    var secForTurn=0;
    this.setState(prevState => {
      var sec = prevState.seconds;
      var min = prevState.minutes;
      sec === 59 ? ((sec = 0), (min = min + 1)) : (sec = sec + 1);
      if(this.state.myTurn)
         secForTurn=prevState.secForTurn +1;
      return {
        seconds: sec,
        minutes: min,
        secForTurn: secForTurn
      };
    });
  }

  selectDomino(high, low) {
    if(this.state.myTurn){
    this.setState(() => {
      return{
        selectedDomino:{
          high:high,
          low:low
        }
      };
    });

    this.allowedPlaces();
  }
  else console.log("not my turn")
  }
  

  allowedPlaces() {
    this.setState(prevState => {
      return {
        allowedPlaces: this.mapAllowedPlaces(prevState.selectedDomino)
      };
    });
  
  }

  mapAllowedPlaces(currentDomino) {
    var temp = [];
    var xoffset, yoffset, daxis;
    var res = null,
      i = 0;
    if (this.state.boardDominos.length === 0) {
      temp[0] = {
        x: 3900,
        y: 1700,
        axis: 0
      };
    } else {
      this.state.boardDominos.forEach(item => {
        //if the selected domino is double
        if (currentDomino.high === currentDomino.low) {
          if (item.high === currentDomino.low) {
            if (item.axis === 0) {
              res = this.setAllowedPlace(item, 0, -75, 90);
              if (res) temp[i++] = res;
            } else if (item.axis === 90) {
              res = this.setAllowedPlace(item, 75, 0, 0);
              if (res) temp[i++] = res;
            } else if (item.axis === 180) {
              res = this.setAllowedPlace(item, 0, 75, 90);
              if (res) temp[i++] = res;
            } else if (item.axis === 270) {
              res = this.setAllowedPlace(item, -75, 0, 0);
              if (res) temp[i++] = res;
            }
          } else if (item.low === currentDomino.low) {
            if (item.axis === 0) {
              res = this.setAllowedPlace(item, 0, 75, 90);
              if (res) temp[i++] = res;
            } else if (item.axis === 90) {
              res = this.setAllowedPlace(item, -75, 0, 0);
              if (res) temp[i++] = res;
            } else if (item.axis === 180) {
              res = this.setAllowedPlace(item, 0, -75, 90);
              if (res) temp[i++] = res;
            } else if (item.axis === 270) {
              res = this.setAllowedPlace(item, 75, 0, 0);
              if (res) temp[i++] = res;
            }
          }
          res = null;
        } //if the domino on the board is double
        else if (item.high === item.low) {
          if (item.high === currentDomino.low) {
            if (item.axis === 0 || item.axis === 180) {
              res = this.setAllowedPlace(item, 0, -100, 0);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, 75, 0, 90);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, 0, +100, 180);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, -75, 0, 270);
              if (res) temp[i++] = res;
            } else {
              res = this.setAllowedPlace(item, 0, -75, 0);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, 100, 0, 90);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, 0, +75, 180);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, -100, 0, 270);
              if (res) temp[i++] = res;
            }
          } else if (item.high === currentDomino.high) {
            if (item.axis === 0 || item.axis === 180) {
              res = this.setAllowedPlace(item, 0, -100, 180);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, 75, 0, 270);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, 0, 100, 0);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, -75, 0, 90);
              if (res) temp[i++] = res;
            } else {
              res = this.setAllowedPlace(item, 0, -75, 180);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, 100, 0, 270);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, 0, 75, 0);
              if (res) temp[i++] = res;
              res = this.setAllowedPlace(item, -100, 0, 90);
              if (res) temp[i++] = res;
            }
          }
          res = null;
        } else {
          if (
            item.high === currentDomino.high ||
            item.high === currentDomino.low
          ) {
            daxis =
              item.high === currentDomino.high
                ? this.flip(item.axis)
                : item.axis;
            xoffset =
              item.axis === 0 || item.axis === 180
                ? 0
                : item.axis === 90
                ? 100
                : -100;
            if (!xoffset) yoffset = item.axis === 0 ? -100 : 100;
            else yoffset = 0;
            res = this.setAllowedPlace(item, xoffset, yoffset, daxis);
            if (res) temp[i++] = res;
          }
          if (
            item.low === currentDomino.high ||
            item.low === currentDomino.low
          ) {
            daxis =
              item.low === currentDomino.low ? this.flip(item.axis) : item.axis;
            xoffset =
              item.axis === 0 || item.axis === 180
                ? 0
                : item.axis === 90
                ? -100
                : 100;
            if (!xoffset) yoffset = item.axis === 0 ? 100 : -100;
            else yoffset = 0;
            res = this.setAllowedPlace(item, xoffset, yoffset, daxis);
            if (res) temp[i++] = res;
          }
        }
        res = null;
      });
    }
    return temp;
  }

  setAllowedPlace(item, x, y, axis) {
    if (this.checkOccupied(item, x, y) === false)
      return {
        x: item.x + x,
        y: item.y + y,
        axis: axis
      };
    else return null;
  }

  flip(axis) {
    if (axis === 180) return 0;
    else if (axis === 0) return 180;
    else return axis === 270 ? 90 : 270;
  }

  checkOccupied(place, x, y) {
    var newX = place.x + x;
    var newY = place.y + y;
    var occupied = false;

    this.state.boardDominos.forEach(item => {
      if (
        newX - 75 < item.x &&
        item.x < newX + 75 &&
        (newY - 75 < item.y && item.y < newY + 75)
      )
        occupied = true;
    });
    return occupied;
  }

  moveTileToBoard(place) {
    if(this.state.selectedDomino){
      this.setState( prevState => {
        prevState.playerDominos.map(item => {
          if (item.high === this.state.selectedDomino.high&&item.low === this.state.selectedDomino.low) {
            item.x = place.x;
            item.y = place.y;
            item.axis = place.axis;
            item.secForTurn=this.state.secForTurn;
            fetch(`/games/${this.state.gameName}/board`, {method:'PUT' , body: JSON.stringify(item), credentials: 'include' ,headers: {"Content-Type": "application/json"}})
            .then(response => {            
              if (!response.ok)               
                throw response;    
            });
          }

        });
        return {
          selectedDomino: null,
          timesPlaceOnBoard: prevState.timesPlaceOnBoard + 1,
          allowedPlaces: null,
          secForTurn:0,
        }
      });
    }
  }

  drawCard() {
    fetch(`/games/${this.state.gameName}`, {method:'PUT', body: this.state.secForTurn, credentials: 'include'})
    .then(response => {            
      if (!response.ok)               
        throw response;       
    });
    this.setState(prevState=>{
      return {
        timesDrawFromStack:prevState.timesDrawFromStack +1,
        secForTurn:0
      }
    })
  }
 
  getStats(){
    const usersStats=[];
    fetch(`/games/${this.state.gameName}`, {method:'GET', credentials: 'include'})
    .then((response)=> {
      if(!response.ok){
          throw response
      }
      return response.json();
  })
  .then(content=>{
    var users=content.onlineUsers;
    var winner;
    for (var id in users) {
      users[id].stats.name=users[id].name;
      usersStats.push(users[id].stats)
    }
    for(var i=0;i<usersStats.length;i++)
    usersStats[i]=(
      <div key={usersStats[i].name} ><h2>{usersStats[i].name}:</h2>
      <h3>score: </h3>{usersStats[i].score}
      <h3>moves: </h3>{usersStats[i].timesDrawFromStack+usersStats[i].timesPlaceOnBoard}
      <h3>average time for a move: </h3>{usersStats[i].seconds/(usersStats[i].timesDrawFromStack+usersStats[i].timesPlaceOnBoard)}
      </div>)
      usersStats[`winner`]=(<h1>The winner is: {this.state.winner.name}!</h1>)
      usersStats[`loser`]=(<h1>{this.state.loser.name} lost</h1>)
      usersStats[`time`]=(<h2>Total time: {this.state.minutes}:{this.state.seconds}</h2>)
    this.setState(()=>{
      return{
        usersStats:usersStats
      }
    })
  })


  }

 
  render() {

    var stopGame = (
        <div id="stopgame">
          <h1>Waiting for {this.state.reqPlayers-this.state.numPlayers} more players</h1>
          <button className="recButton fixed" onClick={()=>this.exitGame()} >return to lobby </button> 
        </div>)

    var gameOver=(
      <div>
      <div id="stats" style={this.state.gameState ==="over"?{display:"block"}:{display:"none"}}>
        {this.state.usersStats[`winner`]?this.state.usersStats[`winner`]  :null}
        {this.state.usersStats[`loser`]?this.state.usersStats[`loser`]  :null}
        {this.state.usersStats[`time`]?this.state.usersStats[`time`]:null}
        <div className="stats-wrapper">
        {this.state.usersStats}
        </div>
        </div>
       <button className="recButton fixed" style={{left:"40%"}} onClick={()=>this.exitGame()} >return to lobby </button> 
       {this.state.userState==="won"&&this.state.gameState==="playing" ? (
       <button className="recButton fixed" style={{left:"50%"}} onClick={()=>this.joinAsViewer()}>stay as viewer </button>): null}
</div>
    )

    var playersDominos={
      player1:this.state.players?this.state.players[0]:null,
      player2:this.state.players?this.state.players[1]:null,
      player3:this.state.players?this.state.players[2]:null
    }

    return (
      <React.Fragment>
        <div id="game">
       <h1 id="turn">{this.state.turn?`${this.state.turn}'s turn`:null}</h1>
        <ChatContainer/>
        <OnlineUsers url={`/games/${this.state.gameName}/users`}/>
            <Board
              dominos={this.state.boardDominos}
              selectedDomino={this.state.selectedDomino}
              moveTileToBoard={this.moveTileToBoard}
              allowedPlaces={this.state.myTurn && this.state.allowedPlaces}
            />
            <Player
            skipTurn={this.skipTurn}
            myTurn={this.state.myTurn}
            playerDominos={this.state.playerDominos}
            selectDomino={this.selectDomino}
            selectedDomino={this.state.myTurn? this.state.selectedDomino:"pending"}
            drawCard={this.drawCard}
            stackDominos={this.state.stackDominos}
            timesPlaceOnBoard={this.state.timesPlaceOnBoard}
            timesDrawFromStack={this.state.timesDrawFromStack}
            seconds={this.state.seconds}
            minutes={this.state.minutes}
            checkAvailableMoves={this.checkAvailableMoves}
          />
        {this.state.gameState ==="playing"&& this.state.userState==="player"|| this.state.gameState ==="waiting"? null: gameOver}
        {this.state.gameState==="waiting"? stopGame: null}

        <div className="playersDominos">
           <h2>All Players Dominos:</h2>
           {playersDominos.player1?(<h3>{playersDominos.player1.name}:{playersDominos.player1.playerDominos.length}</h3>):null}
           {playersDominos.player2?(<h3>{playersDominos.player2.name}:{playersDominos.player2.playerDominos.length}</h3>):null}
           {playersDominos.player3?(<h3>{playersDominos.player3.name}:{playersDominos.player3.playerDominos.length}</h3>):null}
           </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Game;
