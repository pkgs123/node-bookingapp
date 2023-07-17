const express = require("express");
const app = express();
require("dotenv").config();
const dbConfig = require("./config/dbConfig");
const moment = require("moment");
app.use(express.json());

const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const doctorRoute = require("./routes/doctorsRoute");

app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/doctor", doctorRoute);

const port = process.env.PORT || 8000;

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Node Express Server Started at ${port}!`));

console.log("format",moment().format())