const express = require('express');
const app = express();

const fs = require('fs');
var path = require('path');

const PORT = 5500;

app.listen(
    PORT,
    () => {
        console.log(`Server started : ${PORT}`);
    }
)

app.use(express.json()); //Le body des request renvoient .json
//app.use("/static", express.static(path.resolve(__dirname, "public", "static")));
app.use("/static", express.static(path.join(__dirname, 'public/static')));


function getTasks() {
    return new Promise((resolve, reject) => {
        fs.readFile("tasks.json", function(err, data) {
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
}

function getTaskById(id) {
    return new Promise((resolve, reject) => {
        fs.readFile("tasks.json", function(err, data) {
            // Check for errors
            //if (err) throw err;
            if (err) {
                console.log(err);
                resolve({ error: true });
            }
            console.log("Data read");

            let tasks = JSON.parse(data);

            let task = tasks.find((val) => val.id == id);

            resolve(task);
        });
    });
}

function addTask(newTask) {
    return new Promise(async(resolve, reject) => {
        let tasks = await getTasks(); //On recup

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

            fs.writeFile("tasks.json", JSON.stringify(tasks), err => {
                if (err) {
                    console.log(err);
                    resolve({ error: true });
                }

                console.log("Done writing"); // Success

                resolve(finalTask);
            });
        }
    });
}

function updateTask(id, updatedTask) {
    return new Promise(async(resolve, reject) => {
        let tasks = await getTasks(); //On recup

        if (tasks != null) {
            const newTasks = tasks.map(obj => {
                if (obj.id == id) {
                    return {...updatedTask, id: obj.id };
                }
                return obj;
            });

            fs.writeFile("tasks.json", JSON.stringify(newTasks), err => {
                if (err) {
                    console.log(err);
                    resolve({ error: true });
                }
                console.log("Done writing"); // Success

                resolve(updatedTask);
            });
        }
    });
}

function deleteTask(id) {
    return new Promise(async(resolve, reject) => {
        let tasks = await getTasks(); //On recup

        if (tasks != null) {
            let taskToDelete = await getTaskById(id);

            const newTasks = tasks.filter(obj => obj.id != id);

            fs.writeFile("tasks.json", JSON.stringify(newTasks), err => {
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

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/`);
})

app.get("/tasks", async(req, res) => {
    console.log("GET /tasks");

    const tasks = await getTasks();
    console.log(tasks);

    res.status(200).send(tasks);
    console.log("OK");

})

app.get("/tasks/:id", async(req, res) => {
    console.log("GET /tasks/:id");

    const { id } = req.params;

    const task = await getTaskById(id);
    console.log(task);

    res.status(200).send(task);
    console.log("OK");

})

app.post('/task', async(req, res) => {
    console.log("POST /task");

    const { name } = req.body;
    const { priority } = req.body;

    if (!name || !priority) {
        res.status(418).send({ message: 'We need all the parameters !' });
    }

    let newTask = {
        id: -1,
        name: name,
        priority: priority
    }

    let taskToSend = await addTask(newTask);
    console.log(taskToSend);

    res.status(201).send(taskToSend);
})

app.put("/tasks/:id", async(req, res) => {
    console.log("PUT /tasks/:id");

    const { id } = req.params;
    const { name } = req.body;
    const { priority } = req.body;

    let newTask = {
        id: parseInt(id),
        name: name,
        priority: priority
    }

    const task = await updateTask(id, newTask);
    console.log(task);

    res.status(200).send(task);
    console.log("OK");
})

app.delete("/tasks/:id", async(req, res) => {
    console.log("DELETE /tasks/:id");

    const { id } = req.params;

    const task = await deleteTask(id);
    console.log(task);

    res.status(200).send(task);
    console.log("OK");
})