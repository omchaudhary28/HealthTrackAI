import { TestResult } from "../models/test-result.model.js";
import { getPopulationComparison } from "../services/population.service.js";
import { getTestByKey, getTestsSummary, scoreTest } from "../services/assessment.service.js";
import { classifyTestResult, mapTestKeyToType } from "../services/test-result-classifier.js";

export async function listTests(_req, res) {
  res.json({ items: getTestsSummary() });
}

export async function getTest(req, res) {
  res.json(getTestByKey(req.params.testKey));
}

export async function submitTest(req, res) {
  const scored = scoreTest(req.params.testKey, req.body.answers);
  const comparisons = await Promise.all(
    Object.entries(scored.dimensionScores)
      .filter(([metric]) => !metric.endsWith("stability"))
      .slice(0, 6)
      .map(([metric, score]) => getPopulationComparison(metric, score))
  );

  const testType = mapTestKeyToType(scored.test.key);
  const result = classifyTestResult(testType, scored.dimensionScores);

  const savedResult = await TestResult.create({
    userId: req.user.sub,
    testKey: scored.test.key,
    category: scored.test.category,
    answers: scored.answers,
    dimensionScores: scored.dimensionScores,
    labels: scored.labels,
    mentalScore: scored.mentalScore,
    resultType: result.result_type,
    resultDescription: result.description,
    strengths: result.strengths,
    suggestions: result.suggestions,
    recommendedExercises: result.recommended_exercises,
    interpretation: scored.interpretation,
    populationComparison: comparisons
  });

  res.status(201).json({
    id: savedResult.id,
    ...scored,
    result,
    populationComparison: comparisons,
    disclaimer: "Results support self-reflection and are not a medical diagnosis."
  });
}
