import { Exercise } from "../models/exercise.model.js";
import { seedExercises } from "../data/exercises.js";

export async function listExercises(req, res) {
  const category = req.query.category;
  const filters = category ? { category } : {};
  let items = await Exercise.find(filters).sort({ createdAt: -1 }).lean();

  if (!items.length) {
    items = category ? seedExercises.filter((exercise) => exercise.category === category) : seedExercises;
  }

  res.json({ items });
}
