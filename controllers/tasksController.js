const fs = require('fs');
const TASKS_PATH = 'db/tasks.json';


module.exports = {
    getTasks: function() {
        return new Promise((resolve, reject) => {
            fs.readFile(TASKS_PATH, function(err, data) {
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

    getTaskById: function(id) {
        return new Promise(async(resolve, reject) => {
            let tasks = await module.exports.getTasks();
            // Check for errors
            //if (err) throw err;

            console.log("Data read");

            let task = tasks.find((val) => val.id == id);

            resolve(task);
        });
    },

    addTask: function(newTask) {
        return new Promise(async(resolve, reject) => {
            let tasks = await module.exports.getTasks(); //On recup

            if (tasks != null) {
                let newID = tasks.sort((a, b) => { //Tri
                    return a.id - b.id;
                })[tasks.length - 1].id + 1;

                let finalTask = {
                        ...newTask,
                        id: newID
                    }
                    //console.log(finalTask);

                tasks.push(finalTask);

                fs.writeFile(TASKS_PATH, JSON.stringify(tasks), err => {
                    if (err) {
                        console.log(err);
                        resolve({ error: true });
                    }

                    console.log("Done writing"); // Success

                    resolve(finalTask);
                });
            }
        });
    },

    updateTask: function(id, updatedTask) {
        return new Promise(async(resolve, reject) => {
            let tasks = await module.exports.getTasks(); //On recup

            if (tasks != null) {
                const newTasks = tasks.map(obj => {
                    if (obj.id == id) {
                        return {...updatedTask, id: obj.id };
                    }
                    return obj;
                });

                fs.writeFile(TASKS_PATH, JSON.stringify(newTasks), err => {
                    if (err) {
                        console.log(err);
                        resolve({ error: true });
                    }
                    console.log("Done writing"); // Success

                    resolve(updatedTask);
                });
            }
        });
    },

    deleteTask: function(id) {
        return new Promise(async(resolve, reject) => {
            let tasks = await module.exports.getTasks(); //On recup

            if (tasks != null) {
                let taskToDelete = await module.exports.getTaskById(id);

                const newTasks = tasks.filter(obj => obj.id != id);

                fs.writeFile(TASKS_PATH, JSON.stringify(newTasks), err => {
                    if (err) {
                        console.log(err);
                        resolve({ error: true });
                    }
                    console.log("Done writing"); // Success

                    resolve(taskToDelete);
                });
            }
        });
    }
}