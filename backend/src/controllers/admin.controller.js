import { seedExercises } from "../data/exercises.js";
import { Exercise } from "../models/exercise.model.js";
import { ForumPost } from "../models/forum-post.model.js";
import { PopulationStat } from "../models/population-stat.model.js";
import { User } from "../models/user.model.js";
import { seedPopulationBenchmarks } from "../services/population.service.js";

export async function seedExerciseLibrary(_req, res) {
  await Exercise.deleteMany({});
  await Exercise.insertMany(seedExercises);
  await seedPopulationBenchmarks();

  res.json({ inserted: seedExercises.length });
}

export async function getAdminStats(_req, res) {
  const [users, exercises, forumPosts, populationStats] = await Promise.all([
    User.countDocuments({}),
    Exercise.countDocuments({}),
    ForumPost.countDocuments({}),
    PopulationStat.countDocuments({})
  ]);

  res.json({
    users,
    exercises,
    forumPosts,
    populationStats
  });
}
