

const mongoose = require("mongoose");

class MongoDBStrategy {
  async connect() {
  const credentials = process.env.DB_USERNAME && process.env.DB_PASSWORD
  ? `${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@`
  : "";
const uri = `mongodb://${credentials}${process.env.DB_SERVER}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    try {
      await mongoose.connect(uri, {  });
      console.log("MongoDB connected successfully!");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      throw error;
    }
  }
    async disconnect() {
    try {
      await mongoose.disconnect();
      console.log("MongoDB disconnected successfully!");
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
      throw error;
    }
  }
  // Add document example
  async add(Model, documentData) {
    try {
      const newDocument = new Model(documentData); // Create a new instance with the provided data
      const result = await newDocument.save(); // Save the document to MongoDB
      console.log("Document added successfully:", result);

      return result; // Return the saved document
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  }
  async get(Model, filter) {
    try {
      const result = await Model.findOne(filter);
      if (result) {
        console.log("Document found:", result);
      } else {
        console.log("No document matches the filter.");
      }

      return result;
    } catch (error) {
      console.error("Error finding document:", error);
      throw error;
    }
  }

  // Return the mongoose model
  getModel(modelName, path) {
    require(path);
    return mongoose.model(modelName);
  }

  async save(Model) {
    try {
      await Model.save();

      return Model;
    } catch (error) {
      console.error("Error finding document:", error);
      throw error;
    }
  }
   // Update an existing document
  async update(Model, filter, updateFields) {
    try {
      //   const Model = mongoose.model(modelName); // Ensure the model is defined elsewhere in your project
      const result = await Model.updateOne(filter, { $set: updateFields });

      if (result.matchedCount > 0) {
        console.log(
          `Successfully matched and updated ${result.modifiedCount} document(s).`
        );
      } else {
        console.log("No documents matched the filter. No updates applied.");
      }
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

}

module.exports = MongoDBStrategy;

