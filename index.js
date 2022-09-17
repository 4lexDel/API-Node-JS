const express = require('express');
const app = express();

var path = require('path');
const { login, register, getUserProfile, changePassword } = require('./usersAuth');

var cors = require('cors');
const jwtUtils = require('./utils/jwt.utils');
const { getTaskLists, getTaskListById, addTaskList, addTaskInTaskList, updateTaskList, updateTaskInTaskList, getTaskInTaskList, deleteTaskList, deleteTaskInTaskList } = require('./controllers/task-listsController');

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


function authMid(req, res, next) { //This midleware check the token and share the userId return
    var headerAuth = req.headers['authorization']; //Get the token
    var userId = jwtUtils.getUserId(headerAuth); //Check if it exist and get the userId

    if (userId < 0) return res.status(400).json({ 'error': 'wrong token' });

    req.auth = { userId };

    next();
}


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/`);
})

/** -------------------------------Authentification------------------------------------------ */

app.post("/api/register", async(req, res) => {
    console.log("POST /api/register");

    register(req, res);
})

app.post("/api/login", async(req, res) => {
    console.log("POST /api/login");

    login(req, res);
})

app.get("/api/test", async(req, res) => {
    console.log("TEST /api/test");

    getUserProfile(req, res);
})

app.put("/api/changePassword", authMid, async(req, res) => {
    console.log("Change password /api/changePassword");

    changePassword(req, res);
})

/**------------------------------------------------------------------------------------------- */


app.get("/api/task-lists", authMid, async(req, res) => { //[CHECK, ]
    console.log("GET API/task-lists");
    //console.log([] != null);

    let userId = req.auth.userId;

    let taskLists = await getTaskLists();

    if (taskLists != null) {
        taskLists = taskLists.filter((taskList) => taskList.userId == userId);
    }

    return res.status(200).send(taskLists);
})

app.get("/api/task-lists/:id", authMid, async(req, res) => { //[CHECK, ]
    console.log("GET API/task-lists/:id");

    let userId = req.auth.userId;

    const { id } = req.params;

    let taskList = await getTaskListById(id);

    if (!taskList || taskList.userId != userId) return res.status(200).send({});

    return res.status(200).send(taskList);
})

app.get("/api/task-lists/:idTaskList/:idTask", authMid, async(req, res) => { //[CHECK, ]
    console.log("GET API/task-lists/:idTaskList/:idTask");

    let userId = req.auth.userId;

    const { idTaskList } = req.params;
    const { idTask } = req.params;

    let taskList = await getTaskListById(idTaskList);

    if (!taskList || taskList.userId != userId) return res.status(200).send({});

    let taskToSend = await getTaskInTaskList(idTaskList, idTask);

    return res.status(200).send(taskToSend);
})

app.post('/api/task-list', authMid, async(req, res) => { //[CHECK, ]
    console.log("POST API/task-list");

    let userId = req.auth.userId;

    const { title } = req.body;
    const { tasks } = req.body;

    if (title == null || tasks == null) {
        return res.status(418).send({ message: 'We need all the parameters !' });
    }

    let newTaskList = {
        id: -1,
        userId: userId,
        title: title,
        tasks: tasks
    }

    let taskListToSend = await addTaskList(newTaskList);

    return res.status(201).send(taskListToSend);
})

app.post('/api/task-lists/:id', authMid, async(req, res) => { //[CHECK, ]
    console.log("POST API/task-lists/:id");

    let userId = req.auth.userId;

    const { id } = req.params;

    const { title } = req.body;
    const { description } = req.body;
    const { priority } = req.body;
    const { startDate } = req.body;
    const { endDate } = req.body;
    const { advancement } = req.body;
    const { backgroundColor } = req.body;
    const { fontColor } = req.body;

    if (title == null || description == null || priority == null || startDate == null || endDate == null || advancement == null) {
        return res.status(418).send({ message: 'We need all the parameters !' });
    }

    let taskList = await getTaskListById(id);

    if (!taskList || taskList.userId != userId) return res.status(200).send({});

    let newTask = {
        id: -1,
        title: title,
        description: description,
        priority: priority,
        startDate: startDate,
        endDate: endDate,
        advancement: advancement,
        backgroundColor: backgroundColor,
        fontColor: fontColor
    }

    let taskToSend = await addTaskInTaskList(newTask, id);

    return res.status(201).send(taskToSend);
})

app.put('/api/task-lists/:id', authMid, async(req, res) => { //[CHECK, ]
    console.log("PUT API/task-lists/:id");

    let userId = req.auth.userId;

    const { id } = req.params;

    const { title } = req.body;
    const { tasks } = req.body;

    if (title == null || tasks == null) {
        return res.status(418).send({ message: 'We need all the parameters !' });
    }

    let taskListToUpdate = await getTaskListById(id);

    if (taskListToUpdate == null || taskListToUpdate.userId != userId) return res.status(200).send({});

    /////

    let updatedTaskList = {
        id: -1,
        userId: userId,
        title: title,
        tasks: tasks /////////////////////////////////       IF vide!!!
    }

    let taskListToSend = await updateTaskList(updatedTaskList, id);

    return res.status(201).send(taskListToSend);
})

app.put('/api/task-lists/:idTaskList/:idTask', authMid, async(req, res) => { //[CHECK, ]
    console.log("PUT API/task-lists/:idTaskList/:idTask");

    let userId = req.auth.userId;

    const { idTaskList } = req.params;
    const { idTask } = req.params;

    const { title } = req.body;
    const { description } = req.body;
    const { priority } = req.body;
    const { startDate } = req.body;
    const { endDate } = req.body;
    const { advancement } = req.body;
    const { backgroundColor } = req.body;
    const { fontColor } = req.body;

    if (title == null || description == null || priority == null || startDate == null || endDate == null || advancement == null) {
        return res.status(418).send({ message: 'We need all the parameters !' });
    }

    let taskListToUpdate = await getTaskListById(idTaskList);

    if (taskListToUpdate == null || taskListToUpdate.userId != userId) return res.status(200).send({});

    let updatedTask = {
        id: -1,
        title: title,
        description: description,
        priority: priority,
        startDate: startDate,
        endDate: endDate,
        advancement: advancement,
        backgroundColor: backgroundColor,
        fontColor: fontColor
    }

    let taskToSend = await updateTaskInTaskList(updatedTask, idTaskList, idTask);

    return res.status(201).send(taskToSend);
})

app.delete('/api/task-lists/:id', authMid, async(req, res) => { //[CHECK, ]
    console.log("DELETE API/task-lists/:id");

    let userId = req.auth.userId;

    const { id } = req.params;

    let taskListToDelete = await getTaskListById(id);

    if (taskListToDelete == null || taskListToDelete.userId != userId) return res.status(200).send({});

    let taskListToSend = await deleteTaskList(id);

    return res.status(200).send(taskListToSend);
})

app.delete('/api/task-lists/:idTaskList/:idTask', authMid, async(req, res) => { //[CHECK, ]
    console.log("DELETE API/task-lists/:idTaskList/:idTask");

    let userId = req.auth.userId;

    const { idTaskList } = req.params;
    const { idTask } = req.params;

    let taskListUse = await getTaskListById(idTaskList);

    if (taskListUse == null || taskListUse.userId != userId) return res.status(200).send({});

    let taskToSend = await deleteTaskInTaskList(idTaskList, idTask);

    return res.status(200).send(taskToSend);
})



//------------TEST-------------//

//      ==> GET [CHECK]
//      ==> POST [CHECK]
//      ==> PUT [CHECK]
//      ==> DELETE [CHECK]

//------------Scenario de test------------//
/**
 * E1 = (Prendre une valeur innexistante, interdite puis correct)
 * 
 * 
 * Tout afficher                                                [CHECK]
 * Afficher 1 task-list précise : E1                            [CHECK]
 * Afficher 1 task précise : E1                                 [CHECK]
 * Ajouter une task-list vide                                   [CHECK]
 * Ajouter une task : E1 pour la selection de la tasklist       [CHECK]
 * Modifier une task list : E1                                  [CHECK]
 * Modifier une task : E1                                       [CHECK]
 * Supprimer une task list : E1                                 [CHECK]
 * SUpprimer une task : E1                                      [CHECK]
 */


//BUG RESTANTS :
//  - Pour l'ajout de taskList si il n'y en a aucune alors il n'y aura pas d'ajout
//  - Le format des données d'entrées n'est pas vérifié...
//  - Messages d'erreurs à compléter