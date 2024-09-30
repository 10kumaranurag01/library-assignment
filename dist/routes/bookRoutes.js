"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookController_1 = require("../controllers/bookController");
const validateSchema_1 = require("../middlewares/validateSchema");
const bookQuerySchema_1 = require("../schemas/bookQuerySchema");
const router = (0, express_1.Router)();
router.get("/", (0, validateSchema_1.validateParams)(bookQuerySchema_1.bookQuerySchema), bookController_1.getBooksByFilters);
exports.default = router;
