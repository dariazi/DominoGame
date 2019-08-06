import React from "react"
import Room from "./Room.jsx"

class GamesContainer extends React.Component{
    constructor(props){
        super(props)
        this.state={
            activeGames:[],
            errMessage: "",
        }
        this.newGame= this.newGame.bind(this);
        this.getGames= this.getGames.bind(this);
        this.createGame=this.createGame.bind(this);
        this.gamesDisplay= this. gamesDisplay.bind(this);
        this.createDominos= this. createDominos.bind(this);
        
    };

    componentDidMount(){
        this.getGames()
    }
    componentWillUnmount(){
        if (this.timeoutId)
            clearTimeout(this.timeoutId)
    }


    newGame(){
        document.getElementById("setGame").style.display="block"
    }

    closeSetGame(){
        this.setState(()=> ({errMessage: ""}));
        document.getElementById("setGame").style.display="none" 
        document.getElementById("setGameForm").reset();
    }
    
    createGame(event){
        event.preventDefault();
        var radios = document.getElementsByName('reqPlayers');
        const newGame={
            gameName:  event.target.elements.gameName.value,
            reqPlayers: Number(radios[0].checked===true? radios[0].value:radios[1].value),
            numPlayers:0,
            gameState: "waiting"
        }

        newGame.stackDominos=this.createDominos();

        fetch('/games', {method:'POST', body: JSON.stringify(newGame), credentials: 'include' ,headers: {"Content-Type": "application/json"}})
        .then(response => {            
            if (response.ok)                
                this.closeSetGame();
            else
                this.setState(()=> ({errMessage: "Game name already exist, please try another one"}));     
        });
        return false;
    }

    createDominos() {
        var i,j,x = 0;
        const dominosArr = [28];

        for (i = 0; i <= 6; i++) {
          for (j = i; j <= 6; j++) {
            dominosArr[x] = {
              high: j,
              low: i,
              x: 1,
              y: 5,
              axis: 0
            };
            x++;
          }
        }
        this.shuffleDominos(dominosArr);
        return dominosArr;
      }

      shuffleDominos(dominosArr) {
        var j, x, i;
        for (i = dominosArr.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = dominosArr[i];
          dominosArr[i] = dominosArr[j];
          dominosArr[j] = x;
        }
        return dominosArr
    
      }
    
    renderErrorMessage() {
        if (this.state.errMessage) {
            return (
                <div className="error-message">
                    {this.state.errMessage}
                </div>
            );
        }
        return null;
    }

   getGames(){
        return fetch('/games', {method:'GET', credentials: 'include'})
        .then((response)=> {
            if(!response.ok){
                throw response
            }
            this.timeoutId= setTimeout(this.getGames, 200)
            return response.json();
        })
        .then(content => {
            const games=[];
            for (var game in content) {
                games.push(content[game])
              }
            this.setState(()=>({
                activeGames: games,
            }));
        })
        .catch(err => {throw err});
    }


    gamesDisplay(){
        var i=0;
        var games=[];
        this.state.activeGames.map(game=>
            {
                games[i]=(
                <Room 
                key={game.gameName}
                admin={game.admin}
                numPlayers={game.numPlayers}
                reqPlayers={game.reqPlayers}
                gameName={game.gameName}
                gameState={game.gameState}
                currentUser={this.props.currentUser}
                enterGameHandler={this.props.enterGameHandler} />);
                i++
            })
            return games
    }

    render()
    {
         return(
            <div id="gamesContainer">
                {this.gamesDisplay()}
                <button className="cirButton" style={{position: "relative", margin:"4%"}} onClick={()=>this.newGame()}>+</button> 
                <div id="setGame">
                    <form id="setGameForm" onSubmit={this.createGame}>
                        Name your Game: <input type= "text" name="gameName" required/><br></br>
                        Number of players: 
                        <input type="radio" name="reqPlayers" value="2" defaultChecked/>2
                        <input type="radio" name="reqPlayers" value="3"/>3<br></br>
                        <input type="submit" className="recButton" value="Create"/>
                        <button className="recButton" onClick={()=>this.closeSetGame()}>cancel</button>
                        {this.renderErrorMessage()}
                    </form>
                </div>
            </div>
        )     
    }
}
export default GamesContainer;