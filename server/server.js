import dotenv from "dotenv"
dotenv.config();
import { connectDB } from "./config/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || "0.0.0.0";

connectDB();

// Health check moved to app.js


app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`)
})