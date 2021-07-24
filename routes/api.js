"use strict";

/* My changes */
const crud = require("../crud");

/**
 * Module that handles most of the routing
 * @module ./routes/api.js
 *
 * @param {Express} app   Represents the Express application
 *
 */
module.exports = function(app) {
  app
    .route("/api/issues/:project")
    .get(function(req, res) {
      crud.getProject(req.params.project).then((project) => {
        if (project !== null) {
          const keys = Object.keys(req.query);

          // Checks if data should be filtered
          if (keys.length == 0) {
            crud.getAllIssues(project._id).then(
              (issues) => res.json(issues)
            );
          } else {
            let data = {
              project: project._id
            };

            keys.forEach((key) => {
              data[key] = req.query[key];
            });

            crud.getIssues(data).then(
              (issues) => res.json(issues)
            );
          }
        } else {
          res.json([]);
        }
      });
    })

    .post(function(req, res) {
      crud.getProject(req.params.project).then(
        (result) => {
          if (result === null) {
            const data = {
              project_name: req.params.project,
              issues: []
            };

            crud.addProject(data).then((project) => {
              const issue = {
                issue_title: req.body.issue_title,
                issue_text: req.body.issue_text,
                created_by: req.body.created_by,
                assigned_to:
                  req.body.assigned_to === undefined
                    ? ""
                    : req.body.assigned_to,
                status_text:
                  req.body.status_text === undefined
                    ? ""
                    : req.body.status_text,
                open: req.body.open === undefined
                  ? true
                  : req.body.open,
                project: project._id,
              };

              if (
                issue.issue_title !== undefined &&
                issue.issue_text !== undefined &&
                issue.created_by !== undefined
              ) {
                crud.addIssue(issue).then((data) => {
                  project.issues.push(data);
                  project.save();
                  res.json(data);
                });
              } else {
                res.json(
                  { error: "required field(s) missing" }
                );
              }
            });
          } else {
            const issue = {
              issue_title: req.body.issue_title,
              issue_text: req.body.issue_text,
              created_by: req.body.created_by,
              assigned_to:
                req.body.assigned_to === undefined
                  ? ""
                  : req.body.assigned_to,
              status_text:
                req.body.status_text === undefined
                  ? ""
                  : req.body.status_text,
              open: req.body.open === undefined
                ? true
                : req.body.open,
              project: result._id,
            };

            if (
              issue.issue_title !== undefined &&
              issue.issue_text !== undefined &&
              issue.created_by !== undefined
            ) {
              crud.addIssue(issue).then((data) => {
                result.issues.push(data);
                result.save();
                res.json(data);
              });
            } else {
              res.json(
                { error: "required field(s) missing" }
              );
            }
          }
        });
    })

    .put(function(req, res) {
      crud.getProject(req.params.project).then((project) => {
        if (project !== null) {
          const data = { 
            updated_on: new Date().toISOString() 
          };
          let keys = Object.keys(req.body);
          const ID = req.body._id;

          // Checks if any fields should be updated
          if (keys.indexOf("_id") === -1) {
            res.json({ error: "missing _id" });
          } else if (keys.length === 1) {
            res.json({ 
              error: "no update field(s) sent", 
              _id: ID
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
                crud.updateIssue(ID, data)
                .then((issue) => {
                  res.json({ 
                    result: "successfully updated", 
                    _id: ID 
                  });
                })
                .catch(() => { 
                  res.json({ 
                    error: "could not update", 
                    _id: ID 
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

    .delete(function(req, res) {
      crud.getProject(req.params.project).then((project) => {
        if (project !== null) {

        }
      });
    });
};
