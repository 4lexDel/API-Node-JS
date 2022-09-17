var bcrypt = require('bcrypt');
const { getUsers, addUser, updateUser } = require('./controllers/usersController');
var jwtUtils = require('./utils/jwt.utils');
//var asyncLib  = require('async');

//const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,16}$/;


function cryptPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 5, function(err, bcryptedPassword) {
            resolve(bcryptedPassword);
        });
    });
}

function isPasswordCorrect(password, cryptedPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, cryptedPassword, function(errBycrypt, res) {
            resolve(res);
        });
    });
}




module.exports = {
    register: async(req, res) => {
        console.log("REGISTER FUNCTION");

        // Params
        var { username } = req.body;
        var { password } = req.body;

        //console.log(req.body);
        //console.log(password);

        if (username == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        if (username.length >= 13 || username.length <= 4) {
            return res.status(400).json({ 'error': 'wrong username (must be length 5 - 12)' });
        }

        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
        }

        //return res.status(201).json({ "Success": "parameters OK !" });
        let users = await getUsers();
        userFound = users.find((user) => user.username == username);

        if (userFound) {
            return res.status(400).json({ 'error': 'user already exist' });
        }

        const cryptedPassword = await cryptPassword(password);

        console.log(`MDP (clair) : ${password} => MDP (Chiffré) : ${cryptedPassword}`);

        // const test = await isPasswordCorrect(password, cryptedPassword);
        // console.log(`Res : ${test}`);

        const newUser = {
            username: username,
            password: cryptedPassword,
            isAdmin: 0
        }

        const userAdd = await addUser(newUser);

        if (userAdd) {
            return res.status(201).send({
                id: userAdd.id,
                username: userAdd.username
            });
        }
        return res.status(500).json({ 'error': 'cannot add user' });
    },

    login: async(req, res) => {
        console.log("LOGIN FUNCTION");

        // Params
        var { username } = req.body;
        var { password } = req.body;

        console.log(username);

        if (username == null || password == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        let users = await getUsers();
        const userFound = users.find((user) => user.username == username);

        if (!userFound) {
            return res.status(400).json({ 'error': 'user doesn\'t exist' });
        }

        const testPassword = await isPasswordCorrect(password, userFound.password);

        if (!testPassword) {
            return res.status(403).json({ 'error': 'invalid password' });
        }
        return res.status(201).json({
            'userId': userFound.id,
            'token': jwtUtils.generateTokenForUser(userFound) //Important
        });

        //Erreur 500 de reserve ?????????
    },

    getUserProfile: async(req, res) => {
        // Getting auth header
        var headerAuth = req.headers['authorization'];
        console.log(`TEST TOKEN : ${headerAuth}`);
        var userId = jwtUtils.getUserId(headerAuth); //THE TOKEN IS CHECK !!!

        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });

        let users = await getUsers();
        const userFound = users.find((user) => user.id == userId);

        if (userFound) {
            return res.status(201).send({
                id: userFound.id,
                username: userFound.username,
                isAdmin: userFound.isAdmin
            });
        }
        return res.status(500).json({ 'error': 'user not found' });
    },

    changePassword: async(req, res) => {
        console.log("UPDATE PASSWORD FUNCTION");

        // Params
        var { username } = req.body;
        var { password } = req.body;
        var { newPassword } = req.body;

        console.log(username);

        if (username == null || password == null || newPassword == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
        }

        if (!PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
        }

        if (password == newPassword) return res.status(400).json({ 'error': 'the new password is the same than the last one' });

        let users = await getUsers();
        const userFound = users.find((user) => user.username == username);

        if (!userFound) {
            return res.status(400).json({ 'error': 'user doesn\'t exist' });
        }

        const testPassword = await isPasswordCorrect(password, userFound.password);

        if (!testPassword) {
            return res.status(403).json({ 'error': 'invalid password' });
        }

        //changement de mot de passe 
        const cryptedNewPassword = await cryptPassword(newPassword);

        console.log(`MDP (clair) : ${newPassword} => MDP (Chiffré) : ${cryptedNewPassword}`);

        updatedUser = {
            ...userFound,
            password: cryptedNewPassword
        }

        let userToSend = await updateUser(updatedUser);

        if (userToSend != null) {
            return res.status(201).send({
                id: userToSend.id,
                username: userToSend.username
            });
        }
    }
}