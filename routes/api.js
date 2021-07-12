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
module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(function (req, res) {
      let project = req.params.project;
      crud(req.method, req.query, res, project);
    })

    .post(function (req, res) {
      let project = req.params.project;
      crud(req.method, req.body, res, project);
    })

    .put(function (req, res) {
      let project = req.params.project;
      crud(req.method, req.body, res, project);
    })

    .delete(function (req, res) {
      let project = req.params.project;
      crud(req.method, req.body, res, project);
    });
};
