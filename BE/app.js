const express = require("express");
const app = express();
//const authRoutes = require("./src/routes/auth_route.js");
const uploadRoutes = require("./src/routes/upload_route.js");
const compareRoutes = require("./src/routes/compare_route.js");

const port = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/upload", uploadRoutes);
app.use("/compare", compareRoutes);
//app.use("/auth/", authRoutes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
