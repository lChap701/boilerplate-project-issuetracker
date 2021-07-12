/**
 * Module for retreiving IDs of the 'Test 2' issue
 * @module ../getId.js
 *
 * @param {MongoClient} client  Represents the database
 * @param {String} title  Represents the title to search for
 * @returns   Returns the issue ID
 */
module.exports = async (client, title) => {
  const issues = await client.db("issueTracker").collection("issues");
  const issue = await issues.findOne({ issue_title: title });
  return issue._id;
};
