import connectDB from "./db/index.js";
import dotenv from "dotenv/config.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("ERROR " + error);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`app is listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongo db connection failed " + err);
  });
