"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
const validateBody = (bodySchema) => (req, res, next) => {
    const reqBody = req.body;
    try {
        bodySchema.parse(reqBody);
        next();
    }
    catch (error) {
        res.status(400).json({
            message: "Body validation error",
            errors: error.errors,
        });
        return;
    }
};
exports.validateBody = validateBody;
const validateQuery = (querySchema) => (req, res, next) => {
    try {
        querySchema.parse(req.query);
        next();
    }
    catch (error) {
        res.status(400).json({
            message: "Query validation error",
            errors: error.errors,
        });
        return;
    }
};
exports.validateQuery = validateQuery;
const validateParams = (paramsSchema) => (req, res, next) => {
    try {
        paramsSchema.parse(req.params);
        next();
    }
    catch (error) {
        res.status(400).json({
            message: "Params validation error",
            errors: error.errors,
        });
        return;
    }
};
exports.validateParams = validateParams;
