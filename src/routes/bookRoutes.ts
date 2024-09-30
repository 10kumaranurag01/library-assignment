import { Router } from "express";
import { getBooksByFilters } from "../controllers/bookController";
import { validateParams } from "../middlewares/validateSchema";
import { bookQuerySchema } from "../schemas/bookQuerySchema";

const router = Router();

router.get("/", validateParams(bookQuerySchema), getBooksByFilters);

export default router;
