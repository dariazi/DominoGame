const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const auth = require('./auth');


const games = {};
const gamesManagement = express.Router();
gamesManagement.use(bodyParser.json());


function checkGameName(req, res, next) {	
	if (games[req.body.gameName] !== undefined) {
		res.status(403).send('game name already exist');
	} else 
		next();
}

function enterGame(req, res) {	

	games[req.params.gameName].onlineUsers[req.session.id]=auth.getUserInfo(req.session.id);

	const gameStats=games[req.params.gameName];
	const userStats=gameStats.onlineUsers[req.session.id];
	if(gameStats.numPlayers===gameStats.reqPlayers)
		userStats.userState='viewing'
	else{
	games[req.params.gameName].numPlayers++;
	//get 6 dominos for the player
	var playerDominos=gameStats.stackDominos.splice(0,6);
	userStats.playerDominos=playerDominos;

	userStats.userState='player'
	gameStats.turnManager.push(req.session.id);
	userStats.stats={
		timesPlaceOnBoard:0,
		timesDrawFromStack:0,
		seconds:0,
	};
	gameStats.winner="";
	gameStats.loser="";
	}

	if(gameStats.numPlayers===gameStats.reqPlayers){
		gameStats.gameState='playing';
		gameStats.currTurn=0;
	}
}
function exitGame(req, res) {	
	//return the player's dominos to the stack
	if(games[req.params.gameName].onlineUsers[req.session.id].playerDominos){
		games[req.params.gameName].onlineUsers[req.session.id].playerDominos.forEach(domino=>{domino.x=1; domino.y=5});
		games[req.params.gameName].stackDominos=games[req.params.gameName].stackDominos.concat(games[req.params.gameName].onlineUsers[req.session.id].playerDominos);  
	}  
	games[req.params.gameName].turnManager=games[req.params.gameName].turnManager.filter(item=>item!==req.session.id)
	if(games[req.params.gameName].numPlayers>0)games[req.params.gameName].numPlayers--;
	delete games[req.params.gameName].onlineUsers[req.session.id];
	if(games[req.params.gameName].gameState==='over'&&games[req.params.gameName].numPlayers===0)
		resetGame(req.params.gameName);
}	


function resetGame(gameName){
	games[gameName].gameState='waiting';
	games[gameName].skippedTurns=0;
	games[gameName].boardDominos.forEach(domino=>{domino.x=1; domino.y=5; domino.axis=0;});
	games[gameName].stackDominos= games[gameName].stackDominos.concat(games[gameName].boardDominos);
	games[gameName].boardDominos=[];
	games[gameName].winner=winner={id:null, sum:0};
	games[gameName].loser=loser={id:null, sum:0}
}
function nextTurn(req){

	if(games[req.params.gameName].currTurn+1 ===games[req.params.gameName].turnManager.length)
		games[req.params.gameName].currTurn=0;
	else games[req.params.gameName].currTurn++
}
gamesManagement.route('/')
	.get(auth.userAuthentication, (req, res) => {		
		res.json(games);
	})
	.post(auth.userAuthentication,checkGameName, (req, res) => {	
		const newGame=req.body;
		newGame.admin=auth.getUserInfo(req.session.id).name;
		newGame.onlineUsers={};
		newGame.boardDominos=[];
		newGame.turnManager=[];
		games[req.body.gameName] = newGame; 

        res.sendStatus(200);
	});

gamesManagement.route('/:gameName')
	.post(auth.userAuthentication, (req, res) => {	
		games[req.params.gameName].stackDominos=req.body;
		res.sendStatus(200);	
	})
	.get(auth.userAuthentication, (req, res) => {
		const gameStats=games[req.params.gameName];
		const userStats=gameStats.onlineUsers[req.session.id];
		if(userStats){
			gameStats.playerDominos=(userStats.userState==='viewing' ?
			gameStats.onlineUsers[gameStats.turnManager[gameStats.currTurn]].playerDominos: userStats.playerDominos)
			gameStats.myTurn= (gameStats.turnManager[gameStats.currTurn]===req.session.id? true:false)
			gameStats.turn=auth.getUserInfo(gameStats.turnManager[gameStats.currTurn]).name
			gameStats.userState=gameStats.onlineUsers[req.session.id].userState}

		 		res.json(gameStats);	
	})
	.delete(auth.userAuthentication, (req, res) => {	
		delete games[req.params.gameName]
		res.sendStatus(200);	
	})
	.put(auth.userAuthentication, (req, res) => {	
		const gameStats=games[req.params.gameName];
		const userStats=gameStats.onlineUsers[req.session.id];
		if(gameStats.stackDominos.length!==0){
			gameStats.onlineUsers[req.session.id].playerDominos=userStats.playerDominos.concat(games[req.params.gameName].stackDominos.splice(0,1));
			userStats.stats.timesDrawFromStack++;
			userStats.stats.seconds+=Number(req.body);
			userStats.stats.score=calcScore(userStats.playerDominos);
		}
		else //if called by isgameover
		{
			games[req.params.gameName].skippedTurns++
			if(games[req.params.gameName].skippedTurns===games[req.params.gameName].reqPlayers)
				setScores(req,res)
			games[req.params.gameName].gameState='over'		
		}
		nextTurn(req)
		res.sendStatus(200);
	})

function calcScore(playerDominos){
	var score=0;
	playerDominos.forEach((domino)=>{
		score+=domino.high;
		score+=domino.low;
	})
	return score;
}

function setScores(req,res){
	var sums= [], i=0, winner, loser;
		games[req.params.gameName].turnManager.map((item,i)=>{
			sums[i] =
			{sum: calcSum(games[req.params.gameName].onlineUsers[item]), 
			id:item}
			i++})
	winner=loser=sums[0];
	if(!games[req.params.gameName].winner){
		sums.map(item => {
			if(item.sum < winner.sum) winner=item})
		games[req.params.gameName].winner= games[req.params.gameName].onlineUsers[winner.id]
		}
	
	sums.map(item => {
		if(item.sum > loser.sum) loser=item})
	games[req.params.gameName].loser= games[req.params.gameName].onlineUsers[loser.id]

}

function calcSum(player){
var sum= 0
 player.playerDominos.forEach(element => {
	 sum+= element.high+element.low
 });
 return sum
}
gamesManagement.route('/:gameName/viewers')
.get(auth.userAuthentication, (req, res) => {
	var viewers={};
	for (sessionid in games[req.params.gameName].onlineUsers) {
		users[sessionid] = auth.getUserInfo(sessionid).name;
	}

	res.json(viewers);
})

gamesManagement.route('/:gameName/users')
.get(auth.userAuthentication, (req, res) => {
	var users={};
	for (sessionid in games[req.params.gameName].onlineUsers) {
		users[sessionid] = auth.getUserInfo(sessionid).name;
	}

	res.json(users);
})
.put(auth.userAuthentication, (req, res) => {
	games[req.params.gameName].onlineUsers[req.session.id].userState='viewing'
	res.sendStatus(200);
})


gamesManagement.route('/:gameName/stack')
.get(auth.userAuthentication, (req, res) => {		
	res.json(games[req.params.gameName].stackDominos);
})
gamesManagement.route('/:gameName/board')
.get(auth.userAuthentication, (req, res) => {		
	res.json(games[req.params.gameName].boardDominos);
})
.put(auth.userAuthentication, (req, res) => {
	var i;
	const gameStats=games[req.params.gameName];
	const userStats=gameStats.onlineUsers[req.session.id];
	for(i=0;i<userStats.playerDominos.length;i++)
		if(userStats.playerDominos[i].high===req.body.high&&userStats.playerDominos[i].low===req.body.low){
			userStats.playerDominos[i].x=req.body.x;
			userStats.playerDominos[i].y=req.body.y;
			userStats.playerDominos[i].axis=req.body.axis;
			gameStats.boardDominos=gameStats.boardDominos.concat(userStats.playerDominos.splice(i,1));
		}
	userStats.stats.timesPlaceOnBoard++;
	userStats.stats.score=calcScore(userStats.playerDominos);
	userStats.stats.seconds+=req.body.secForTurn;
	games[req.params.gameName].skippedTurns=0
	if (userStats.playerDominos.length===0)
		clearedTiles(req,res)
	else
		nextTurn(req,res)	
	res.sendStatus(200);
});

function clearedTiles(req,res){
	if(games[req.params.gameName].reqPlayers===2){
		games[req.params.gameName].winner=games[req.params.gameName].onlineUsers[req.session.id]
		games[req.params.gameName].onlineUsers[req.session.id].userState='won'
		games[req.params.gameName].loser=games[req.params.gameName].onlineUsers[games[req.params.gameName].turnManager[1-games[req.params.gameName].currTurn]]
		games[req.params.gameName].gameState='over'	}
	else{
		if (!games[req.params.gameName].winner){
			games[req.params.gameName].winner=games[req.params.gameName].onlineUsers[req.session.id]
			games[req.params.gameName].onlineUsers[req.session.id].userState='won'
		}
		else{
		games[req.params.gameName].loser=games[req.params.gameName].onlineUsers[games[req.params.gameName].turnManager[1-games[req.params.gameName].currTurn]]
		games[req.params.gameName].gameState='over'	}
		games[req.params.gameName].turnManager=games[req.params.gameName].turnManager.filter(item=>item!==req.session.id)
		if(games[req.params.gameName].currTurn===games[req.params.gameName].turnManager.length){
			games[req.params.gameName].currTurn=0}
		}

 	}
gamesManagement.route('/:gameName/dominos')
.get(auth.userAuthentication, (req, res) => {		
	res.json(games[req.params.gameName].stackDominos);
})


gamesManagement.route('/pass/:gameName')
	.put(auth.userAuthentication, (req, res) => {	
		if(games[req.params.gameName].numPlayers<games[req.params.gameName].reqPlayers)
		{enterGame(req)}
		res.sendStatus(200);	
	})
	.delete(auth.userAuthentication, (req, res) => {	
		exitGame(req);
		res.sendStatus(200);	
	});
	
gamesManagement.route('/:gameName/:id')
	.get(auth.userAuthentication, (req, res) => {		
		res.json(games[req.params.gameName].onlineUsers[req.session.id]);
	})
	





module.exports = gamesManagement;