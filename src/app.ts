import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bookRoutes from "./routes/bookRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import helperRoutes from "./routes/helperRoutes";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/helper", helperRoutes);

const mongoURI = process.env.MONGODB_URI;
const port = process.env.PORT;

if (!mongoURI) {
  throw new Error("MONGODB_URI is not defined in the environment variables.");
}
if (!port) {
  throw new Error("PORT is not defined in the environment variables.");
}

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server running on PORT ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });

export default app;
