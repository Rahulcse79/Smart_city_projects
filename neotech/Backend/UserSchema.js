const mongoose = require("mongoose");

// Mongoose schema
const SchemaSET = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    unique: true
  }
  });

const Database = mongoose.model("users",SchemaSET);

module.exports = Database;