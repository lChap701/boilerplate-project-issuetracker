require("dotenv").config();
const mongoose = require("mongoose");

// Connects to database
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  project_name: String,
  issues: [{ type: Schema.Types.ObjectId, ref: "Issues" }],
});

const issueSchema = new Schema(
  {
    issue_title: String,
    issue_text: String,
    created_by: String,
    assigned_to: String,
    open: Boolean,
    status_text: String,
    project: { type: Schema.Types.ObjectId, ref: "Projects" },
  },
  {
    timestamps: {
      createdAt: "created_on",
      updatedAt: "updated_on",
    },
  }
);

// Models
const Project = mongoose.model("Projects", projectSchema);
const Issue = mongoose.model("Issues", issueSchema);

/**
 * Module for running CRUD operations once connected to the DB
 * @module ./crud
 *
 */
const crud = {
  addProject: (data) => new Project(data).save(),
  addIssue: (data) => new Issue(data).save(),
  getProject: (title) => Project.findOne({ project_name: title }),
  getAllIssues: (_id) => Issue.find({ project: _id }),
  getIssues: (data) => Issue.find(data),
  updateIssue: (_id, data) => Issue.updateOne({ _id: _id }, data),
  deleteIssue: (_id) => Issue.deleteOne({ _id: _id }),
};

module.exports = crud;
