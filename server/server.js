import dotenv from "dotenv"
dotenv.config();
import { connectDB } from "./config/db.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000

connectDB();

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`)
})