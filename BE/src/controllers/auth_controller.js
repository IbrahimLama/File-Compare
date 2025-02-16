const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DatabaseConnectionManager = require("../config/database_connection_manager");

class AuthController {
  constructor() {
    this.dbManager = new DatabaseConnectionManager();
    this.model = this.dbManager.strategy.getModel("User", "../models/users.js");

    this.registerUser = this.registerUser.bind(this);
    this.loginUser = this.loginUser.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
  }

  // User registration
  async registerUser(req, res) {
    const { username, password, email, ...additionalFields } = req.body;

    try {
      // Open connection once at the start of the request
      await this.dbManager.connect();
      console.log("Database connection successful!");

      const filter = { username }; // Define the filter to find the document
      const userExists = await this.dbManager.strategy.get(this.model, filter);

      if (userExists) {
        // Return a 400 if the user already exists
        return res.status(400).json({ message: "User already exists" });
      }

      // Add the new user to the database
      await this.dbManager.strategy.add(this.model, {
        username,
        password,
        email,
        ...additionalFields,
      });
      console.log("New user added successfully!");

      res.status(201).json({
        username,
        password,
        email,
        ...additionalFields,
      });
    } catch (error) {
      console.error("Database connection failed:", error.message);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // User login
  async loginUser(req, res) {
    const { username, password } = req.body;

    try {
      // Open connection once at the start of the request
      await this.dbManager.connect();
      console.log("Database connection successful!");

      const filter = { username }; // Define the filter to find the document
      const user = await this.dbManager.strategy.findOne(this.model, filter);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("start JWT");
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || "your-very-secure-secret-key",
        {
          expiresIn: "1h",
        }
      );
      res.status(200).json({ token });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Error logging in", error });
    } 
  }

  // Password reset
  async resetPassword(req, res) {
    const { email, newPassword } = req.body;

    try {
      // Open connection once at the start of the request
      await this.dbManager.connect();
      console.log("Database connection successful!");

      const filter = { email }; // Define the filter to find the document
      const user = await this.dbManager.strategy.get(this.model, filter);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await this.dbManager.strategy.save(user);
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Error resetting password", error });
    } 
  }
}

module.exports = new AuthController();
