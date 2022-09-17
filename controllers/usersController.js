const fs = require('fs');
const USERS_PATH = 'db/users.json';

//Probleme si DB vide !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

module.exports = {
    getUsers: function() {
        return new Promise((resolve, reject) => {
            fs.readFile(USERS_PATH, function(err, data) {
                // Check for errors
                //if (err) throw err;
                if (err) {
                    console.log(err);
                    resolve({ error: true });
                }
                console.log("Data read");

                resolve(JSON.parse(data));
            });
        });
    },

    addUser: function(newUser) {
        return new Promise(async(resolve, reject) => {
            let users = await module.exports.getUsers(); //On recup

            if (users != null) {
                let newID = users.sort((a, b) => { //Tri
                    return a.id - b.id;
                })[users.length - 1].id + 1;

                let finalUser = {
                    id: newID,
                    ...newUser
                }

                users.push(finalUser);

                fs.writeFile(USERS_PATH, JSON.stringify(users), err => {
                    if (err) {
                        console.log(err);
                        resolve({ error: true });
                    }

                    console.log("Done writing"); // Success

                    resolve(finalUser);
                });
            }
        });
    },

    updateUser: function(updatedUser) {
        return new Promise(async(resolve, reject) => {
            let users = await module.exports.getUsers(); //On recup

            if (users != null) {
                users = users.map((user) => {
                    if (user.id == updatedUser.id) return updatedUser;
                    return user;
                });

                fs.writeFile(USERS_PATH, JSON.stringify(users), err => {
                    if (err) {
                        console.log(err);
                        resolve({ error: true });
                    }

                    console.log("Done writing"); // Success

                    resolve(updatedUser);
                });
            }
        });
    }
}