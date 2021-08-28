const Issue = require("./issue");
const crud = require("./crud");

const BadWords = require("bad-words");
let filter = new BadWords();
filter.removeWords("dick", "pussy");

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
    filter.isProfane(issue.issue_title) ||
    filter.isProfane(issue.issue_text) ||
    filter.isProfane(issue.created_by) ||
    filter.isProfane(issue.assigned_to) ||
    filter.isProfane(issue.status_text)
  ) {
    res.json({ error: "No curse words are allowed" });
    return;
  }

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
