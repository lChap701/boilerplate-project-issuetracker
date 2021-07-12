const ObjectID = require("mongodb").ObjectID;
const connection = require("./connection");
const addData = require("./addData");

/**
 * Module for performing/handling CRUD operations
 * @module ../crud
 *
 * @param {String} method   Represents the current HTTP method
 * @param {*} data   Represents the data that was submitted/entered in the URL
 * @param {Response<any, Record<string, any>, number>} res  Represents the response that should occur
 * @param {String} project  Represents the project in the URL
 */
module.exports = (method, data, res, project) => {
  connection(async (client) => {
    // Accesses the collections in issueTracker
    const projects = await client.db("issueTracker").collection("projects");
    const issues = await client.db("issueTracker").collection("issues");

    // Attempts to find the project contained in the URL
    const proj = await projects.findOne({ project_name: project });

    // Checks if the project was found
    switch (method) {
      case "GET":
        if (proj !== null) {
          const keys = Object.keys(data);

          // Checks if data should be filtered
          if (keys.length == 0) {
            // Displays all results
            const json = await proj.issues.map((i) => {
              return {
                _id: i._id,
                issue_title: i.issue_title,
                issue_text: i.issue_text,
                created_by: i.created_by,
                assigned_to: i.assigned_to,
                status_text: i.status_text,
                open: i.open,
                created_on: i.created_on,
                updated_on: i.updated_on,
              };
            });

            res.json(json);
          } else {
            let is = [];
            let found = true;

            // Filters data by query string
            keys.forEach((k) => {
              is = proj.issues.filter((i) => {
                if (i[k].toString() == data[k]) {
                  return {
                    _id: i._id,
                    issue_title: i.issue_title,
                    issue_text: i.issue_text,
                    created_by: i.created_by,
                    assigned_to: i.assigned_to,
                    status_text: i.status_text,
                    open: i.open,
                    created_on: i.created_on,
                    updated_on: i.updated_on,
                  };
                } else {
                  found = false;
                }
              });
            });

            // Checks what should be returned
            if (found) {
              res.json(is);
            } else {
              res.json([]);
            }
          }
        }
        break;
      case "POST":
        if (proj === null) {
          // Creates an object containing project information
          const p = {
            project_name: project,
            issues: [],
          };

          // Adds project to the DB
          await projects.insertOne(p, async (err) => {
            if (err) {
              res.send(err);
            } else {
              await addData(p, projects, issues, res, data);
            }
          });
        } else {
          await addData(proj, projects, issues, res, data);
        }
        break;
      case "PUT":
        try {
          if (proj !== null) {
            const projectObj = { "issues.$.updated_on": new Date() };
            const issueObj = { updated_on: new Date() };
            const ID = new ObjectID(data._id);
            let keys = Object.keys(data);

            // Checks if any fields should be updated
            if (keys.indexOf("_id") === -1) {
              res.json({ error: "missing _id" });
            } else if (keys.length === 1) {
              res.json({ error: "no update field(s) sent", _id: data._id });
            } else {
              keys.forEach((k) => {
                if (k !== "_id") {
                  let ik = "issues.$." + k;
                  projectObj[ik] = data[k];
                  issueObj[k] = data[k];
                }
              });

              // Gets the new values that should be added
              const projectValues = { $set: projectObj };
              const issueValues = { $set: issueObj };

              // Checks if any issue is found
              const issue = await issues.findOne({ _id: ID });

              if (issue === null) {
                res.json({ error: "could not update", _id: data._id });
              } else {
                // Updates the selected issue and displays the result
                issues.updateOne({ _id: ID }, issueValues, (err) => {
                  if (err) {
                    res.json({ error: "could not update", _id: data._id });
                  } else {
                    // Updates the assigned project
                    projects.updateOne({ _id: ID }, projectValues, (err) => {
                      if (err) {
                        res.json({
                          error: "could not update",
                          _id: data._id,
                        });
                      } else {
                        const obj = {
                          result: "successfully updated",
                          _id: data._id,
                        };

                        res.json(obj);
                      }
                    });
                  }
                });
              }
            }
          } else {
            res.json({ error: "could not update", _id: data._id });
          }
        } catch {
          res.json({ error: "could not update", _id: data._id });
        }
        break;
      case "DELETE":
        try {
          if (proj !== null) {
            if (data._id) {
              const ID = new ObjectID(data._id);
              const val = { $pull: { issues: { _id: ID } } };

              // Checks if any issue is found
              const issue = await issues.findOne({ _id: ID });

              if (issue === null) {
                res.json({ error: "could not delete", _id: data._id });
              } else {
                // Removes an issue from the project document
                projects.updateOne({ _id: proj._id }, val, (err) => {
                  if (err) {
                    res.json({ error: "could not delete", _id: data._id });
                  } else {
                    // Deletes an issue document
                    issues.deleteOne({ _id: ID }, (err) => {
                      if (err) {
                        res.json({ error: "could not delete", _id: data._id });
                      } else {
                        const obj = {
                          result: "successfully deleted",
                          _id: data._id,
                        };

                        res.json(obj);
                      }
                    });
                  }
                });
              }
            } else {
              res.json({ error: "missing _id" });
            }
          } else {
            res.json({ error: "could not delete", _id: data._id });
          }
        } catch {
          res.json({ error: "could not delete", _id: data._id });
        }
        break;
    }
  });
};
