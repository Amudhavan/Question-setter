// Local storage keys
const TESTS_KEY = 'quiz_ai_generated_tests';
const SUBMISSIONS_KEY = 'quiz_ai_user_submissions';

// Save a newly generated test
export function saveTest(test) {
  const tests = getTests();
  const testToSave = {
    ...test,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  tests.push(testToSave);
  localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
  return testToSave;
}

// Get all generated tests
export function getTests() {
  try {
    return JSON.parse(localStorage.getItem(TESTS_KEY)) || [];
  } catch {
    return [];
  }
}

// Get a specific test by ID
export function getTestById(id) {
  const tests = getTests();
  return tests.find(t => t.id === id);
}

// Save a completed user submission
export function saveSubmission(testId, answers, score, totalQuestions) {
  const submissions = getSubmissions();
  const newSubmission = {
    id: Date.now().toString(),
    testId,
    answers, // Array of selected option indices corresponding to question index
    score,
    totalQuestions,
    submittedAt: new Date().toISOString(),
  };
  submissions.push(newSubmission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
  return newSubmission;
}

// Get all submissions
export function getSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)) || [];
  } catch {
    return [];
  }
}

// Get a submission by its ID
export function getSubmissionById(id) {
  const submissions = getSubmissions();
  return submissions.find(s => s.id === id);
}

// Get the latest submission for a given test ID
export function getSubmissionByTestId(testId) {
  const submissions = getSubmissions();
  // Filter by testId and sort by newest first
  return submissions
    .filter(s => s.testId === testId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
}

// Get combined history (tests + latest submission if taken)
export function getHistory() {
  const tests = getTests();
  const submissions = getSubmissions();
  
  return tests.map(test => {
    // Find submissions for this test
    const testSubmissions = submissions.filter(s => s.testId === test.id);
    // Sort to get latest
    const latestSubmission = testSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];
    
    return {
      ...test,
      submission: latestSubmission || null,
      isCompleted: !!latestSubmission
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
