import React from 'react';
import ReactDOM from 'react-dom';
import LoginModal from './login-modal.jsx';
import GameRooms from './GameRooms.jsx';
import Game from './Game'

export default class BaseContainer extends React.Component {
    constructor(args) {
        super(...args);
        this.state = {
            showLogin: true,
            inGame:null,
            currentUser: {
                name: ''
            }
        };
        
        this.handleSuccessedLogin = this.handleSuccessedLogin.bind(this);
        this.handleLoginError = this.handleLoginError.bind(this);
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.logoutHandler= this.logoutHandler.bind(this);
        this.enterGameHandler=this.enterGameHandler.bind(this);
        this.backToGameRooms=this.backToGameRooms.bind(this);
        this.getUserName();
    }
    render() {        
        if (this.state.showLogin) {
            return (<LoginModal loginSuccessHandler={this.handleSuccessedLogin} loginErrorHandler={this.handleLoginError}/>)
        }
        return this.renderGamesRoom();
    }


    handleSuccessedLogin() {
        this.setState(()=>({showLogin:false}), this.getUserName);        
    }

    handleLoginError() {
        console.error('login failed');
        this.setState(()=>({showLogin:true}));
    }

    renderGamesRoom() {
        if (!this.state.inGame)
            return(
            <div className="games-room-container">
                <div className="user-info-area">
                    Hello {this.state.currentUser.name}
                    <button className="recButton" onClick={this.logoutHandler}>Logout</button>
                </div>
                <GameRooms enterGameHandler={this.enterGameHandler} currentUser={this.state.currentUser}/>   

            </div>
        )
        else
            return(
              <Game gameName={this.state.inGame} backToGameRooms={this.backToGameRooms}/>
            )
        
        
    }

    enterGameHandler(gameName){    
        fetch(`/games/pass/${gameName}`, {method:'PUT', credentials: 'include' ,headers: {"Content-Type": "application/json"}})
        .then(response => {            
            if (!response.ok) {                
                throw response;
            }
            else
            this.setState(()=>{
                return({
                    inGame:gameName  
                })
            })          
        });
        return false;

    }

    getUserName() {
        this.fetchUserInfo()
        .then(userInfo => {
            this.setState(()=>({currentUser:userInfo, showLogin: false}));
        })
        .catch(err=>{            
            if (err.status === 401) { // incase we're getting 'unautorithed' as response
                this.setState(()=>({showLogin: true}));
            } else {
                throw err; // in case we're getting an error
            }
        });
    }

    fetchUserInfo() {        
        return fetch('/users',{method: 'GET', credentials: 'include'})
        .then(response => {            
            if (!response.ok){
                throw response;
            }
            return response.json();
        });
    }

    logoutHandler() {
        fetch('/users/logout', {method: 'GET', credentials: 'include'})
        .then(response => {
            if (!response.ok) {
                console.log(`failed to logout user ${this.state.currentUser.name} `, response);                
            }
            this.setState(()=>({currentUser: {name:''}, showLogin: true}));
        })
    }

    backToGameRooms(){
        this.setState({
            inGame:null,
        })

    }
}