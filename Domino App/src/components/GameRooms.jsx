import React from 'react';
import ReactDOM from 'react-dom';
//import ConverssionArea from './converssionArea.jsx';
import OnlineUsers from './OnlineUsers.jsx';
import GamesContainer from './GamesContainer.jsx'

export default function(props) {               
    return(
        <div className="gameRooms-container">
            <OnlineUsers url="/users/allUsers" />
            <GamesContainer  enterGameHandler={props.enterGameHandler} currentUser={props.currentUser}/>
        </div>
    )

    
}