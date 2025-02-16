const express = require("express");
const app = express();
const authRoutes = require("./src/routes/auth_Route.js");

const port = 3000;

app.use(express.json());

app.use("/api/", authRoutes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
