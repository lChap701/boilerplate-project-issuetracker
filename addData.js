const Issue = require("./issue");
const crud = require("./crud");

/**
 * Module that adds data to the DB and displays the result
 * @module ./addData
 *
 * @param {*} data      Represents the data that was submitted
 * @param {*} project   Represents a project document
 * @param {*} res       Represents the response that is returned
 */
module.exports = function addData(data, project, res) {
  const issue = new Issue(
    data.issue_title,
    data.issue_text,
    data.created_by,
    data.assigned_to,
    data.status_text,
    data.open,
    project._id
  );

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
