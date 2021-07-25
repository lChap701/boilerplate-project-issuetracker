/**
 * Module for creating Issue objects to save in the DB
 * @module ./issue
 *
 */
module.exports = class Issue {
  constructor(
    title,
    text,
    creator,
    assigned = "",
    status = "",
    open = true,
    projID
  ) {
    this.issue_title = title;
    this.issue_text = text;
    this.created_by = creator;
    this.assigned_to = assigned;
    this.status_text = status;
    this.open = open;
    this.project = projID;
  }
};
