const express = require('express');
const projectsDb = require('../data/helpers/projectModel');
const actionsDB = require('../data/helpers/actionModel');
const router = express.Router();

//----------POST Requests----------//

//Creates new Project

//Creates a new Action under a specific Project

//----------GET Requests----------//

//Gets a list of all Projects

//Gets a specific project by it's id

//Gets all actions for a specific project

//----------DELETE Requests----------//

//Deletes a specific project

//----------PUT Requests----------//

//Updates a specific project

//---------custom middleware---------//

//checks the given project id to make sure it exists in the database
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
    const id = req.params.id;
    const actionData = req.body;

    actionsDB.get(id)
        .then(project => {
            if (project) {
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
            } else {
                res.status(400).json({ message: "invalid project id" })
            }
        })
        .catch(err => {
            console.log(`error on GET /api/projects/${id}`, err);
            res.status(500).json({ error: "The project information could not be retrieved." })
        });

}

module.exports = router;