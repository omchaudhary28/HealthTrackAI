import { ForumPost } from "../models/forum-post.model.js";
import { refreshMentalStateSnapshot } from "../services/wellness-profile.service.js";

export async function getDashboardSummary(req, res) {
  const [{ snapshot, savedMentalState }, communityVisiblePosts] = await Promise.all([
    refreshMentalStateSnapshot(req.user.sub),
    ForumPost.countDocuments({ status: "visible" })
  ]);

  res.json({
    latestBaseline: snapshot.latestBaseline,
    recentMoodLogs: snapshot.recentMoodLogs,
    recentJournalEntries: snapshot.recentJournalEntries,
    mentalStates: snapshot.mentalStates,
    communityVisiblePosts,
    currentMentalState: savedMentalState || snapshot.mentalStates?.[0] || null,
    suggestedAction: snapshot.suggestedAction,
    recommendationCards: snapshot.recommendationCards,
    analytics: snapshot.analytics,
    activitySummary: snapshot.activitySummary,
    user: snapshot.user
      ? {
          id: String(snapshot.user._id || snapshot.user.id),
          name: snapshot.user.name,
          email: snapshot.user.email,
          profile: snapshot.user.profile || {}
        }
      : null,
    aiInsightsHistory: snapshot.aiInsightsHistory,
    journalSignals: snapshot.journalSignals,
    exerciseHistory: snapshot.exerciseHistory
  });
}
