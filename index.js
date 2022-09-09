const express = require('express');
const app = express();

var path = require('path');
const { getTasks, getTaskById, addTask, updateTask, deleteTask } = require('./controllers/tasksController');
const { login, register, getUserProfile } = require('./usersAuth');

var cors = require('cors');
const jwtUtils = require('./utils/jwt.utils');

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

app.use(cors());

app.use(function(req, res, next) { //Midleware
    console.log('Time:', Date.now());
    next();
});



app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/`);
})

app.get("/api/tasks", async(req, res) => {
    console.log("GET /tasks");
    /**-------------------------------------------------------------------------------------AUTH------ */
    var headerAuth = req.headers['authorization']; //Get the token
    var userId = jwtUtils.getUserId(headerAuth); //Check if it exist and get the userId

    if (userId < 0) return res.status(400).json({ 'error': 'wrong token' });
    /**----------------------------------------------------------------------------------------------- */

    let tasks = await getTasks();

    tasks = tasks.filter((task) => task.userId == userId); //ON VERIFIE LE PROPRIETAIRE !!!

    console.log(tasks);

    res.status(200).send(tasks);
    console.log("OK");
})

app.get("/api/tasks/:id", async(req, res) => {
    console.log("GET /tasks/:id");

    /**-------------------------------------------------------------------------------------AUTH------ */
    var headerAuth = req.headers['authorization']; //Get the token
    var userId = jwtUtils.getUserId(headerAuth); //Check if it exist and get the userId

    if (userId < 0) return res.status(400).json({ 'error': 'wrong token' });
    /**----------------------------------------------------------------------------------------------- */

    const { id } = req.params;

    let task = await getTaskById(id);

    if (task.userId != userId) return res.status(200).send({});

    console.log(task);

    res.status(200).send(task);
    console.log("OK");
})

app.post('/api/task', async(req, res) => {
    console.log("POST /task");

    /**-------------------------------------------------------------------------------------AUTH------ */
    var headerAuth = req.headers['authorization']; //Get the token
    var userId = jwtUtils.getUserId(headerAuth); //Check if it exist and get the userId

    if (userId < 0) return res.status(400).json({ 'error': 'wrong token' });
    /**----------------------------------------------------------------------------------------------- */

    const { name } = req.body;
    const { priority } = req.body;

    if (!name || !priority) {
        res.status(418).send({ message: 'We need all the parameters !' });
    }

    let newTask = {
        id: -1,
        userId: userId,
        name: name,
        priority: priority
    }

    let taskToSend = await addTask(newTask);
    console.log(taskToSend);

    res.status(201).send(taskToSend);
})

app.put("/api/tasks/:id", async(req, res) => {
    console.log("PUT /tasks/:id");

    /**-------------------------------------------------------------------------------------AUTH------ */
    var headerAuth = req.headers['authorization']; //Get the token
    var userId = jwtUtils.getUserId(headerAuth); //Check if it exist and get the userId

    if (userId < 0) return res.status(400).json({ 'error': 'wrong token' });

    /**----------------------------------------------------------------------------------------------- */

    const { id } = req.params;
    const { name } = req.body;
    const { priority } = req.body;

    let taskToUpdate = await getTaskById(id);

    if (taskToUpdate.userId != userId) return res.status(200).send({});

    let newTask = {
        id: parseInt(id),
        userId: userId,
        name: name,
        priority: priority
    }

    const task = await updateTask(id, newTask);
    console.log(task);

    res.status(200).send(task);
    console.log("OK");
})

app.delete("/api/tasks/:id", async(req, res) => {
    console.log("DELETE /tasks/:id");

    /**-------------------------------------------------------------------------------------AUTH------ */
    var headerAuth = req.headers['authorization']; //Get the token
    var userId = jwtUtils.getUserId(headerAuth); //Check if it exist and get the userId

    if (userId < 0) return res.status(400).json({ 'error': 'wrong token' });

    /**----------------------------------------------------------------------------------------------- */

    const { id } = req.params;

    let taskToDelete = await getTaskById(id);

    if (taskToDelete.userId != userId) return res.status(200).send({});

    const task = await deleteTask(id);
    console.log(task);

    res.status(200).send(task);
    console.log("OK");
})

/** -------------------------------Authentification------------------------------------------ */

app.post("/api/register", async(req, res) => {
    console.log("POST /api/register");

    register(req, res);
    //res.status(201).send("Register process...");
})

app.post("/api/login", async(req, res) => {
    console.log("POST /api/login");

    login(req, res);
    //res.status(201).send("Login process...");
})

app.get("/api/test", async(req, res) => {
    console.log("TEST /api/test");

    getUserProfile(req, res);
})