const crud = require("./crud");

/**
 * Adds data to the DB and displays the result
 * @module ./addData
 *
 * @param {*} data      Represents the data that was submitted
 * @param {*} project   Represents a project document
 * @param {*} res       Represents the response that is returned
 */
module.exports = function addData(data, project, res) {
  const issue = {
    issue_title: data.issue_title,
    issue_text: data.issue_text,
    created_by: data.created_by,
    assigned_to: data.assigned_to === undefined ? "" : data.assigned_to,
    status_text: data.status_text === undefined ? "" : data.status_text,
    open: data.open === undefined ? true : data.open,
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
    res.json({ error: "required field(s) missing" });
  }
};
