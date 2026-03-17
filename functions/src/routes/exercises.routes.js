import { Router } from "express";
import { listExercises } from "../controllers/exercises.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.get("/", asyncHandler(listExercises));

export default router;
