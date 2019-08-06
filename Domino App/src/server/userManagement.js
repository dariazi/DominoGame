const express = require('express');
const router = express.Router();
const auth = require('./auth');


const userManagement = express.Router();

userManagement.get('/', auth.userAuthentication, (req, res) => {
	const userName = auth.getUserInfo(req.session.id).name;
	res.json({name:userName});
});

userManagement.get('/allUsers', auth.userAuthentication, (req, res) => {	
	res.json(auth.userList);
});

userManagement.post('/addUser', auth.addUserToAuthList, (req, res) => {	
	res.sendStatus(200);	
});

userManagement.get('/logout', auth.removeUserFromAuthList, (req, res) => {
		res.sendStatus(200);		
	}
);


module.exports = userManagement;