"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const helperController_1 = require("../controllers/helperController");
const router = (0, express_1.Router)();
router.get("/all-books", helperController_1.getAllBooks);
router.get("/all-users", helperController_1.getAllUsers);
exports.default = router;
