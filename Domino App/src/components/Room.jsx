import React from "react"
import binImg from './resources/bin.png';

class Room extends React.Component{
    constructor(props){
        super(props)
        this.state={
            gameName: props.gameName,
            admin:props.admin,
            reqPlayers:props.reqPlayers,
            numPlayers:props.numPlayers,
            gameState:props.gameState,
            bin:"none",
        }
        this.deleteRoom=this.deleteRoom.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.numPlayers !== this.state.numPlayers)
        this.setState({ numPlayers: nextProps.numPlayers });
        if (nextProps.gameState !== this.state.gameState)
            this.setState({ gameState: nextProps.gameState });
    }

    deleteRoom(){
        fetch(`/games/${this.state.gameName}`, {method: 'DELETE', credentials: 'include'})
        .then(response => {            
            if (!response.ok)                
                throw response;
            })             
    }

    render(){
        var bin={
            display:this.state.admin===this.props.currentUser.name&&this.state.numPlayers===0? "block":"none"
        }
        return(
            <div className= "room" style={{opacity:this.state.gameState!==`waiting`?`0.6`:`1`}} 
            onClick={ ()=>{this.state.gameState===`waiting`?this.props.enterGameHandler(this.state.gameName):null}}>
                <b>Name: {this.state.gameName}</b><br></br>
                Admin: {this.state.admin}<br></br>
                Players required: {this.state.reqPlayers}<br></br>
                Players Connected: {this.state.numPlayers}<br></br>
                State:{this.state.gameState}
                <img className="bin" src={binImg} alt="bin" style={bin} onClick={ (e)=>{
                    e.cancelBubble=true;
                    e.stopPropagation();
                    this.deleteRoom()}}></img>
            </div>
        )
    }
}
export default Room