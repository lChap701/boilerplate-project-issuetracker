/**
 * Module that adds issues to the project document and issues collection on POST
 * @module  ./addData
 *
 * @param {Object} project  Represents an object that contains project information
 * @param {Collection<TSchema>} projects  Represents the projects collection
 * @param {Collection<TSchema>} issues    Represents the issues collection
 * @param {Response<any, Record<string, any>, number>} res  Represents the response that should occur
 * @param {*} data   Represents the data that was submitted
 *
 */
// Creates an object contain issue information
module.exports = async (project, projects, issues, res, data) => {
  const is = {
    issue_title: data.issue_title,
    issue_text: data.issue_text,
    created_by: data.created_by,
    assigned_to: data.assigned_to === undefined ? "" : data.assigned_to,
    status_text: data.status_text === undefined ? "" : data.status_text,
    open: data.open === undefined ? true : data.open,
    project: project._id,
    created_on: new Date(),
    updated_on: new Date(),
  };

  if (
    is.issue_title !== undefined &&
    is.issue_text !== undefined &&
    is.created_by !== undefined
  ) {
    // Adds the issue to the DB
    await issues.insertOne(is, async (err) => {
      if (err) {
        res.send(err);
      } else {
        // Adds the issue to the current project document
        await projects.updateOne(
          { _id: project._id },
          { $push: { issues: is } },
          (err) => {
            if (err) {
              res.send(err);
            } else {
              res.json({
                _id: is._id,
                issue_title: is.issue_title,
                issue_text: is.issue_text,
                created_by: is.created_by,
                assigned_to: is.assigned_to,
                status_text: is.status_text,
                open: is.open,
              });
            }
          }
        );
      }
    });
  } else {
    res.json({ error: "required field(s) missing" });
  }
};
