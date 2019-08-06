import React from 'react';
import ReactDOM from 'react-dom';
const auth = require('../server/auth');

export default class OnlineUsers extends React.Component {
    constructor(args) {
        super(...args);
        
        this.state = {
            users: []
        };        

        this.getUsers = this.getUsers.bind(this);
    }

    componentDidMount() {
        this.getUsers();
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    render() {      
        return(
            <div className="online-users-wrpper">
                <h2>ONLINE USERES</h2>
                {this.state.users.map((line, index) => (<p key={line+ index}>{line}</p>))}
            </div>
        )
    }

    getUsers() {
        return fetch(this.props.url, {method: 'GET', credentials: 'include'})
        .then((response) => {
            if (!response.ok){
                throw response;
            }
            this.timeoutId = setTimeout(this.getUsers, 200);

            return response.json();            
        })
        .then(content => {
            const users=[];
            for (var id in content) {
                users.push(content[id])
              }
            this.setState(()=>({users: users}));
        })
        .catch(err => {throw err});
    }
}