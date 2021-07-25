"use strict";

/* My changes */
const crud = require("../crud");
const addData = require("../addData");

/**
 * Module that handles most of the routing
 * @module ./routes/api
 *
 * @param {Express} app   Represents the Express application
 *
 */
module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(function (req, res) {
      crud.getProject(req.params.project).then((project) => {
        if (project !== null) {
          const keys = Object.keys(req.query);

          // Checks if data should be filtered
          if (keys.length == 0) {
            crud.getAllIssues(project._id).then((issues) => res.json(issues));
          } else {
            let data = { project: project._id };

            keys.forEach((key) => {
              data[key] = req.query[key];
            });

            crud.getIssues(data).then((issues) => res.json(issues));
          }
        } else {
          res.json([]);
        }
      });
    })

    .post(function (req, res) {
      crud.getProject(req.params.project).then((result) => {
        if (result === null) {
          const data = {
            project_name: req.params.project,
            issues: [],
          };

          crud.addProject(data).then((project) => {
            addData(req.body, project, res);
          });
        } else {
          addData(req.body, result, res);
        }
      });
    })

    .put(function (req, res) {
      crud.getProject(req.params.project).then((project) => {
        if (project !== null) {
          const data = { updated_on: new Date() };
          let keys = Object.keys(req.body);
          const ID = req.body._id;

          // Checks if any fields should be updated
          if (keys.indexOf("_id") === -1) {
            res.json({ error: "missing _id" });
          } else if (keys.length === 1) {
            res.json({
              error: "no update field(s) sent",
              _id: ID,
            });
          } else {
            // if (req.body.open) {
            //   req.body.open = req.body.open == "true" ? true : false;
            // }

            keys.forEach((key) => {
              if (key !== "_id") {
                data[key] = req.body[key];
              }
            });

            project.issues.forEach((issue) => {
              if (issue == ID) {
                crud
                  .updateIssue(ID, data)
                  .then((issue) => {
                    res.json({
                      result: "successfully updated",
                      _id: ID,
                    });
                  })
                  .catch((e) => {
                    res.json({
                      error: "could not update",
                      _id: ID,
                    });
                  });
              }
            });
          }
        } else {
          res.json([]);
        }
      });
    })

    .delete(function (req, res) {
      crud.getProject(req.params.project).then((project) => {
        if (project !== null) {
        } else {
          res.json([]);
        }
      });
    });
};
