const fs = require('fs');
const TASK_LISTS_PATH = 'db/task-lists.json';


module.exports = {

    getTaskLists: function() {
        return new Promise((resolve, reject) => {
            fs.readFile(TASK_LISTS_PATH, function(err, data) {
                if (err) {
                    console.log(err);
                    resolve({ error: true });
                }
                console.log("Data read");

                let taskLists = JSON.parse(data);

                resolve(taskLists);
            });
        });
    },

    getTaskListById: function(id) {
        return new Promise(async(resolve, reject) => {
            let taskLists = await module.exports.getTaskLists();

            let taskList = {};

            if (taskLists != null) {
                taskList = taskLists.find((task) => task.id == id);
            }

            resolve(taskList);
        });
    },

    getTaskInTaskList: function(idTaskList, idTask) {
        return new Promise(async(resolve, reject) => {
            let taskLists = await module.exports.getTaskLists();

            let task = {};

            if (taskLists != null) {
                let taskList = taskLists.find((taskList) => taskList.id == idTaskList);

                if (taskList != null) {
                    task = taskList.tasks.find((task) => task.id == idTask);
                }
            }
            resolve(task);
        });
    },

    addTaskList: function(newTaskList) {
        return new Promise(async(resolve, reject) => {
            let taskLists = await module.exports.getTaskLists(); //On recup

            let finalTaskList = {};

            if (taskLists == null) taskLists = [];

            let newID = 1;

            if (taskLists.length > 0) {
                newID = taskLists.sort((a, b) => { //Tri
                    return a.id - b.id;
                })[taskLists.length - 1].id + 1;
            }

            finalTaskList = {
                ...newTaskList,
                id: newID
            }

            taskLists.push(finalTaskList);

            fs.writeFile(TASK_LISTS_PATH, JSON.stringify(taskLists), err => {
                if (err) {
                    console.log(err);
                    resolve({ error: true });
                }

                console.log("Data write"); // Success

            });

            resolve(finalTaskList);
        });
    },

    addTaskInTaskList: function(newTask, id) {
        return new Promise(async(resolve, reject) => {
            let taskLists = await module.exports.getTaskLists(); //On recup

            var finalTask = {};

            if (taskLists != null) {
                const newTaskLists = taskLists.map(obj => {
                    if (obj.id == id) {
                        let newID = 1 //BIEN !
                        if (obj.tasks.length > 0) {
                            newID = obj.tasks.sort((a, b) => { //Tri
                                return a.id - b.id;
                            })[obj.tasks.length - 1].id + 1;
                        }

                        finalTask = {
                            ...newTask,
                            id: newID
                        }

                        obj.tasks.push(finalTask)
                    }
                    return obj;
                });

                fs.writeFile(TASK_LISTS_PATH, JSON.stringify(newTaskLists), err => {
                    if (err) {
                        console.log(err);
                        resolve({ error: true });
                    }

                    console.log("Data write"); // Success
                });
            }
            resolve(finalTask);
        });
    },

    updateTaskList: function(updatedTaskList, id) {
        return new Promise(async(resolve, reject) => {
            let taskLists = await module.exports.getTaskLists(); //On recup

            var finalTaskList = {};

            if (taskLists != null) {
                const newTaskLists = taskLists.map(obj => {
                    if (obj.id == id) {
                        finalTaskList = {
                            ...updatedTaskList,
                            id: obj.id,
                            tasks: obj.tasks //On prend pas en compte cette modiff pour l'instant !
                        }
                        return finalTaskList;
                    }
                    return obj;
                });

                fs.writeFile(TASK_LISTS_PATH, JSON.stringify(newTaskLists), err => {
                    if (err) {
                        console.log(err);
                        resolve({ error: true });
                    }
                    console.log("Data write"); // Success

                });
            }
            resolve(finalTaskList);
        });
    },

    updateTaskInTaskList: function(updatedTask, idTaskList, idTask) {
        return new Promise(async(resolve, reject) => {
            let taskLists = await module.exports.getTaskLists(); //On recup

            var finalTask = {};

            if (taskLists != null) {
                const newTaskLists = taskLists.map(taskList => { //Gymnastique
                    if (taskList.id == idTaskList) {
                        taskList.tasks = taskList.tasks.map((task) => {
                            if (task.id == idTask) {
                                finalTask = {
                                    ...updatedTask,
                                    id: task.id
                                }
                                return finalTask;
                            }
                            return task;
                        })
                    }
                    return taskList;
                });

                fs.writeFile(TASK_LISTS_PATH, JSON.stringify(newTaskLists), err => {
                    if (err) {
                        console.log(err);
                        resolve({ error: true });
                    }

                    console.log("Data write"); // Success
                });
            }
            resolve(finalTask);
        });
    },

    deleteTaskList: function(id) {
        return new Promise(async(resolve, reject) => {
            let taskLists = await module.exports.getTaskLists(); //On recup;

            let taskListToDelete = {}

            if (taskLists != null) {
                taskListToDelete = await module.exports.getTaskListById(id);

                if (taskListToDelete != null) {
                    const newTaskLists = taskLists.filter(obj => obj.id != id);

                    fs.writeFile(TASK_LISTS_PATH, JSON.stringify(newTaskLists), err => {
                        if (err) {
                            console.log(err);
                            resolve({ error: true });
                        }
                        console.log("Data write"); // Success
                    });
                }
            }
            resolve(taskListToDelete);
        });
    },

    deleteTaskInTaskList: function(idTaskList, idTask) {
        return new Promise(async(resolve, reject) => {
            let taskLists = await module.exports.getTaskLists(); //On recup

            let taskToDelete = {};

            if (taskLists != null) {
                taskToDelete = await module.exports.getTaskInTaskList(idTaskList, idTask);

                if (taskToDelete != null) {
                    const newTaskLists = taskLists.map(taskList => {
                        if (taskList.id == idTaskList) {
                            taskList.tasks = taskList.tasks.filter((task) => task.id != idTask);
                        }
                        return taskList;
                    });

                    fs.writeFile(TASK_LISTS_PATH, JSON.stringify(newTaskLists), err => {
                        if (err) {
                            console.log(err);
                            resolve({ error: true });
                        }
                        console.log("Data write"); // Success
                    });
                }
            }
            resolve(taskToDelete);
        });
    }
}