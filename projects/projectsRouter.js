const express = require('express');
const projectsDb = require('../data/helpers/projectModel');
const actionsDB = require('../data/helpers/actionModel');
const router = express.Router();

//----------POST Requests----------//

//Creates new Project
router.post('/', validateProjectBody, (req, res) => {
    const projectData = req.body;

    projectsDb.insert(projectData)
        .then(project => {
            res.status(201).json({ message: "project added successfully" })
        })
        .catch(err => {
            console.log('error on POST /api/projects', err);
            res.status(500).json({ error: "There was an error while saving the project to the database" })
        })
});

//Creates a new Action under a specific Project
router.post('/actions', validateActionBody, (req, res) => {
    const actionData = req.body;

    actionsDB.insert(actionData)
        .then(() => {
            res.status(201).json(actionData)
        })
});

//----------GET Requests----------//

//Gets a list of all Projects
router.get('/', (req, res) => {
    projectsDb.get()
        .then(projects => {
            res.status(200).json(projects);
        })
        .catch(err => {
            console.log('error on GET /api/projects', err);
            res.status(500).json({ error: "The projects information could not be retrieved." })
        });
});

//Gets a specific project by it's id (includes all actions for the project)
router.get('/:id', validateProjectID, (req, res) => {
    const id = req.params.id;

    projectsDb.get(id)
        .then(project => {
            res.status(200).json(project);
        })
        .catch(err => {
            console.log(`error on GET /api/projects/${id}`, err);
            res.status(500).json({ error: "The project information could not be retrieved." })
        });
});

//gets all actions for a specific project
router.get('/:id/actions', validateProjectID, (req, res) => {
    const id = req.params.id;
    projectsDb.getProjectActions(id)
        .then(actions => {
            if (actions.length) {
                res.status(200).json(actions);
            } else {
                res.status(200).json({ message: "This project doesn't have any actions yet." })
            }
        })
});

//----------DELETE Requests----------//

//Deletes a specific project
router.delete('/:id', validateProjectID, (req, res) => {
    const id = req.params.id;
    projectsDb.remove(id)
        .then(() => {
            res.status(200).json({ message: 'Project deleted successfully' })
        })
});

//Deletes a specific action
router.delete('/actions/:actionID', validateActionID, (req, res) => {
    const actionID = req.params.actionID;
    actionsDB.remove(actionID)
        .then(() => {
            res.status(200).json({ message: 'Action deleted successfully' })
        })
})

//----------PUT Requests----------//

//Updates a specific project
router.put('/:id', validateProjectID, validateProjectBody, (req, res) => {
    const id = req.params.id;
    const changes = req.body;
    projectsDb.update(id, changes)
        .then(project => {
            res.status(200).json(project);
        })
        .catch(err => {
            console.log(`error on PUT /api/projects/${id}`, err);
            res.status(500).json({ error: "The project information could not be updated." })
        })
});

//Updates a specific action for a specific project
router.put('/actions/:actionID', validateProjectID, validateActionBody, (req, res) => {
    const actionID = req.params.actionID;
    const changes = req.body;

    actionsDB.update(actionID, changes)
        .then(action => {
            res.status(200).json(action);
        })
        .catch(err => {
            console.log(`error on PUT /api/projects/actions/${actionID}`, err);
            res.status(500).json({ error: "The action information could not be updated." })
        })
})

//---------custom middleware---------//

//checks the given PROJECT ID to make sure it exists in the database
function validateProjectID(req, res, next) {
    const id = req.params.id;

    projectsDb.get(id)
        .then(project => {
            if (project) {
                next();
            } else {
                res.status(400).json({ message: "invalid project id" })
            }
        })
        .catch(err => {
            console.log(`error on GET /api/projects/${id}`, err);
            res.status(500).json({ error: "The project information could not be retrieved." })
        });
}

//Checks the given ACTION ID to make sure it exists in the database
function validateActionID(req, res, next) {
    const id = req.params.id;

    actionsDB.get(id)
        .then(action => {
            if (action) {
                next();
            } else {
                res.status(400).json({ message: "invalid action id" })
            }
        })
        .catch(err => {
            console.log(`error on GET /api/projects/actions/${id}`, err);
            res.status(500).json({ error: "The action information could not be retrieved." })
        });
}

//checks the body on a request to create a new project to ensure there is a body
function validateProjectBody(req, res, next) {
    const projectData = req.body;

    if (!projectData.name || !projectData.description) {
        res.status(400).json({ errorMessage: "Please provide a name and description for the project." })
    } else {
        next();
    }
}

//checks the body on a request to create a new action to ensure there is a body
function validateActionBody(req, res, next) {
    const id = req.body.project_id;
    const actionData = req.body;

    projectsDb.get(id)
        .then(project => {
            if (!project) {
                res.status(400).json({ message: "invalid project id" })
            } else {
                if (!actionData) {
                    res.status(400).json({ message: "missing action data" })
                } else if (!actionData.description) {
                    res.status(400).json({ message: "missing required description field" })
                } else if (actionData.description.length > 128) {
                    res.status(400).json({ message: "Description must be 128 characters or less." })
                } else if (!actionData.project_id) {
                    res.status(400).json({ message: "missing required project_id field" })
                } else if (!actionData.notes) {
                    res.status(400).json({ message: "missing required notes field" })
                } else {
                    next();
                }
            }
        })
        .catch(err => {
            console.log(`error on GET /api/projects/${id}`, err);
            res.status(500).json({ error: "The project information could not be retrieved." })
        });
}

module.exports = router;