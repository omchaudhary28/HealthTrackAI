import { MoodLog } from "../models/mood-log.model.js";

export async function listMoodLogs(req, res) {
  const items = await MoodLog.find({ userId: req.user.sub }).sort({ date: -1 }).lean();
  res.json({ items });
}

export async function createMoodLog(req, res) {
  const logDate = new Date(req.body.date || Date.now());
  logDate.setHours(0, 0, 0, 0);

  const payload = {
    userId: req.user.sub,
    date: logDate,
    mood: req.body.mood,
    stressLevel: req.body.stressLevel,
    sleepQuality: req.body.sleepQuality,
    energyLevel: req.body.energyLevel,
    notes: req.body.notes
  };

  const item = await MoodLog.findOneAndUpdate(
    { userId: payload.userId, date: payload.date },
    payload,
    { upsert: true, new: true }
  );

  res.status(201).json(item);
}
