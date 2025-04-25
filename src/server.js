const express = require("express");
const { PORT, LOCAL_HOST, FRONTEND_URL } = require("./config/serverConfig.js");
const apiRoutes = require("./routes/apiRoutes.js");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [FRONTEND_URL, LOCAL_HOST];
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use("/api", apiRoutes);
app.use(
  "/files",
  express.static(path.join(__dirname, "files"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
      }
    },
  })
);
app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`);
});