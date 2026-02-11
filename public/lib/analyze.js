const clean = (t) =>
  t.toLowerCase().replace(/[^a-z ]/g, "").split(" ").filter(w => w.length > 3);

export function analyzeJD(jd, content) {
  const jdWords = new Set(clean(jd));
  const cWords = new Set(clean(content));

  let matched = [];
  let missing = [];

  jdWords.forEach(w => {
    if (cWords.has(w)) matched.push(w);
    else missing.push(w);
  });

  let score = Math.round((matched.length / jdWords.size) * 100);
  score = Math.min(95, Math.max(40, score));

  return {
    atsScore: score,
    keywords: matched.slice(0, 15),
    missingSkills: missing.slice(0, 10),
  };
}
