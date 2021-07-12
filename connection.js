require("dotenv").config();
const { MongoClient } = require("mongodb");

/**
 * Connects to the MongoDB database
 * @module ./connection
 *
 * @param {Function} callback  Represents a callback function
 *
 */
module.exports = async (callback) => {
  // Sets up the client
  const client = new MongoClient(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    
    // Make the appropriate DB calls
    callback(client);
  } catch (e) {
    // Catch any errors
    console.error(e);
    throw new Error("Unable to Connect to Database");
  }
};
