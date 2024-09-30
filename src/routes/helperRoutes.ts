import { Router } from "express";
import { getAllBooks, getAllUsers } from "../controllers/helperController";

const router = Router();

router.get("/all-books", getAllBooks);
router.get("/all-users", getAllUsers);

export default router;
