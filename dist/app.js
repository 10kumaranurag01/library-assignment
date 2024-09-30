"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bookRoutes_1 = __importDefault(require("./routes/bookRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const helperRoutes_1 = __importDefault(require("./routes/helperRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/books", bookRoutes_1.default);
app.use("/api/transactions", transactionRoutes_1.default);
app.use("/api/helper", helperRoutes_1.default);
const mongoURI = process.env.MONGODB_URI;
const port = process.env.PORT;
if (!mongoURI) {
    throw new Error("MONGODB_URI is not defined in the environment variables.");
}
if (!port) {
    throw new Error("PORT is not defined in the environment variables.");
}
mongoose_1.default
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
exports.default = app;
