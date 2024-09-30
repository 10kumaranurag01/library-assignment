import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

export const validateBody =
  (bodySchema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const reqBody = req.body;
    try {
      bodySchema.parse(reqBody);
      next();
    } catch (error: any) {
      res.status(400).json({
        message: "Body validation error",
        errors: error.errors,
      });
      return;
    }
  };

export const validateQuery =
  (querySchema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      querySchema.parse(req.query);
      next();
    } catch (error: any) {
      res.status(400).json({
        message: "Query validation error",
        errors: error.errors,
      });
      return;
    }
  };

export const validateParams =
  (paramsSchema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      paramsSchema.parse(req.params);
      next();
    } catch (error: any) {
      res.status(400).json({
        message: "Params validation error",
        errors: error.errors,
      });
      return;
    }
  };
