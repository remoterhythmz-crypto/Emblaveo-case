"use strict";

const scenes = [
  { title: "The first watch", kicker: "CHAPTER 01 · THE FIRST WATCH", description: "The first postoperative assessment.", src: "assets/video1.mp4" },
  { title: "The change", kicker: "CHAPTER 02 · THE CHANGE", description: "A new fever and neurological deterioration.", src: "assets/video2.mp4" },
  { title: "The difficult question", kicker: "CHAPTER 03 · THE FAMILY", description: "A conversation outside the ICU.", src: "assets/video3.mp4" },
  { title: "The outcome", kicker: "CHAPTER 04 · THE OUTCOME", description: "Improvement, and the limits of a single report.", src: "assets/video4.mp4" }
];

const questions = [
  {
    title: "Which detail in Arthur’s record raises concern for an opportunistic, resistant infection?",
    choices: [
      "The presence of a routine postoperative dressing.",
      "Prolonged hospitalization with substantial prior broad-spectrum antibiotic exposure.",
      "His age alone."
    ],
    correct: 1,
    feedback: "Prolonged hospital exposure and antibiotic pressure raise concern for resistant opportunists. They are risk factors, not a diagnosis."
  },
  {
    title: "Arthur develops fever and new neurological signs. What is the best immediate approach?",
    choices: [
      "Assess urgently, obtain appropriate CSF and blood cultures when feasible and safe, and start prompt empiric management under local post-neurosurgical protocol.",
      "Wait for every final susceptibility result before examining or treating him.",
      "Assume the organism from his antibiotic history alone and choose a fixed-dose product for meningitis."
    ],
    correct: 0,
    feedback: "Urgent assessment and appropriate samples guide care. Management should not wait for a final culture when serious healthcare-associated meningitis is suspected."
  },
  {
    title: "Why can aztreonam combined with avibactam have activity against this organism?",
    choices: [
      "Aztreonam resists L1 hydrolysis, while avibactam inhibits the L2 enzyme that can inactivate aztreonam.",
      "Avibactam removes the cell wall by itself.",
      "Aztreonam opens the blood–brain barrier."
    ],
    correct: 0,
    feedback: "The mechanism addresses the L1/L2 enzyme barrier. In the published case, clinicians administered aztreonam plus ceftazidime-avibactam; fixed-dose EMBLAVEO was not administered."
  },
  {
    title: "What did the published team measure to assess central nervous system exposure?",
    choices: [
      "Blood pressure alone.",
      "Paired peak and trough concentrations of aztreonam and avibactam in cerebrospinal fluid and plasma.",
      "Muscle concentration, assumed to be identical to CSF concentration."
    ],
    correct: 1,
    feedback: "The investigators measured drug concentrations in CSF and plasma over treatment. This case-specific monitoring is not automatically routine for every patient."
  },
  {
    title: "Which conclusion does the published case support?",
    choices: [
      "Fixed-dose EMBLAVEO was proven effective for S. maltophilia meningitis.",
      "One patient had clinical and microbiological cure with aztreonam plus ceftazidime-avibactam; this is a plausible strategy but does not establish broad efficacy.",
      "Every S. maltophilia isolate is susceptible to aztreonam-avibactam."
    ],
    correct: 1,
    feedback: "The report describes one favorable outcome with a specific two-drug regimen. It cannot establish broad efficacy or a new product indication."
  }
];

const captions = [
  [
    { start: 3.2, end: 6.7, text: "Doctor: Keep your eyes open for this one, Sarah." }
  ],
  [
    { start: .4, end: 2.9, text: "Doctor: Post-op day three. Still hoping for a quiet recovery." },
    { start: 3.3, end: 6.5, text: "Sarah: Doctor, his fever spiked—and the CSF cultures just came back." },
    { start: 6.6, end: 10, text: "Doctor: Stenotrophomonas maltophilia. A dual-enzyme fortress... standard carbapenems won't touch this." }
  ],
  [
    { start: .4, end: 3.1, text: "Doctor: The family is waiting. Every hour counts." },
    { start: 3.2, end: 6.5, text: "Doctor: We have a targeted plan, Clara. We are monitoring him closely." },
    { start: 6.6, end: 10, text: "Doctor: Can this combination cross into the central nervous system at bactericidal levels?" }
  ],
  [
    { start: .4, end: 3.1, text: "Doctor: Day fourteen. The critical inflection point." },
    { start: 3.2, end: 5.1, text: "Arthur: I feel like myself again, Doctor." },
    { start: 5.2, end: 6.5, text: "Clara: Thank you." },
    { start: 6.6, end: 10, text: "Doctor: Complete clinical cure—achieved through rational mechanism-guided therapy." }
  ]
];

const $ = (id) => document.getElementById(id);
const intro = $("intro");
const experience = $("experience");
const completion = $("completion");
const video = $("sceneVideo");
const profileDialog = $("profileDialog");
let sceneIndex = 0;
let activeQuestion = -1;
let answered = false;
let score = 0;
const scoredQuestions = new Set();
let profileViewed = false;
let video2MidShown = false;
let captionsOn = false;
let gateActive = false;

function formatTime(seconds) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function updateTransport() {
  const duration = Number.isFinite(video.duration) ? video.duration : 10;
  const pct = Math.min(100, Math.max(0, (video.currentTime / duration) * 100));
  $("progressFill").style.width = `${pct}%`;
  $("progressTrack").setAttribute("aria-valuenow", String(Math.round(pct)));
  $("timeLabel").textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
  $("playPauseButton").textContent = video.paused ? "▶" : "Ⅱ";
  $("playPauseButton").setAttribute("aria-label", video.paused ? "Play video" : "Pause video");
  const cue = captionsOn ? captions[sceneIndex].find(item => video.currentTime >= item.start && video.currentTime < item.end) : null;
  $("videoCaption").hidden = !cue;
  if (cue) $("videoCaption").textContent = cue.text;
  $("videoSourceNote").hidden = !(sceneIndex === 3 && video.currentTime >= Math.max(0, duration - 1.5));
}

async function playVideo() {
  if (gateActive || !experience.hidden && !$("paperInteraction").hidden) return;
  try {
    await video.play();
    $("videoFallback").hidden = true;
  } catch {
    // Browser autoplay rules may require a direct press on the visible play button.
    $("playPauseButton").focus();
  }
  updateTransport();
}

function loadScene(index) {
  sceneIndex = index;
  gateActive = false;
  activeQuestion = -1;
  answered = false;
  $("paperInteraction").hidden = true;
  $("postVideoActions").hidden = true;
  $("decisionCard").hidden = true;
  $("videoFallback").hidden = true;
  $("sceneTitle").textContent = scenes[index].title;
  $("sceneKicker").textContent = scenes[index].kicker;
  $("sceneDescription").textContent = scenes[index].description;
  $("chapterCounter").innerHTML = `${String(index + 1).padStart(2, "0")} <span>/ 04</span>`;
  $("sceneStamp").innerHTML = `<span class="stamp-dot"></span> SCENE ${String(index + 1).padStart(2, "0")} <span class="stamp-divider"></span> ARTHUR VANCE`;
  video.pause();
  video.src = scenes[index].src;
  video.load();
  experience.scrollIntoView({ behavior: "smooth", block: "start" });
  playVideo();
}

function showProfilePrompt() {
  gateActive = true;
  video.pause();
  // Holding the actual last frame makes the paper remain visibly clickable.
  $("paperInteraction").hidden = false;
  $("postVideoActions").hidden = false;
  $("continueAfterProfile").hidden = !profileViewed;
  $("paperHotspot").focus();
}

function openProfile() {
  profileViewed = true;
  $("continueAfterProfile").hidden = false;
  profileDialog.showModal();
}

function closeProfile(continueToQuestion = false) {
  profileDialog.close();
  if (continueToQuestion) showQuestion(0);
  else $("paperHotspot").focus();
}

function showQuestion(index) {
  activeQuestion = index;
  answered = false;
  gateActive = true;
  video.pause();
  $("paperInteraction").hidden = true;
  $("postVideoActions").hidden = true;
  const q = questions[index];
  $("decisionNumber").textContent = `DECISION ${String(index + 1).padStart(2, "0")} / 05`;
  $("decisionTitle").textContent = q.title;
  const list = $("answerList");
  list.replaceChildren();
  q.choices.forEach((choice, choiceIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.innerHTML = `<span class="option-letter" aria-hidden="true">${String.fromCharCode(65 + choiceIndex)}</span><span class="option-text"></span>`;
    button.querySelector(".option-text").textContent = choice;
    button.addEventListener("click", () => answerQuestion(choiceIndex));
    list.append(button);
  });
  $("decisionFeedback").hidden = true;
  $("continueButton").hidden = true;
  $("decisionCard").hidden = false;
  $("decisionCard").scrollIntoView({ behavior: "smooth", block: "center" });
  list.querySelector("button")?.focus({ preventScroll: true });
}

function answerQuestion(choiceIndex) {
  if (answered) return;
  answered = true;
  const q = questions[activeQuestion];
  const correct = choiceIndex === q.correct;
  if (correct && !scoredQuestions.has(activeQuestion)) {
    score++;
    scoredQuestions.add(activeQuestion);
  }
  [...$("answerList").children].forEach((button, index) => {
    button.disabled = true;
    if (index === choiceIndex) button.classList.add(correct ? "correct" : "incorrect");
    if (index === q.correct && !correct) button.classList.add("revealed");
  });
  const feedback = $("decisionFeedback");
  feedback.replaceChildren();
  const heading = document.createElement("strong");
  heading.textContent = correct ? "Well reasoned" : "Consider the evidence";
  feedback.append(heading, document.createTextNode(q.feedback));
  feedback.classList.toggle("is-wrong", !correct);
  feedback.hidden = false;
  const label = activeQuestion === 4 ? "Finish case" : activeQuestion === 1 ? "Reveal the result" : "Continue the story";
  $("continueButton").innerHTML = `${label} <span aria-hidden="true">→</span>`;
  $("continueButton").hidden = false;
  feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function continueStory() {
  if (!answered) return;
  $("decisionCard").hidden = true;
  gateActive = false;
  if (activeQuestion === 1) {
    // Scene 2 intentionally has a decision before its culture-result reveal.
    video.currentTime = Math.max(video.currentTime, 6.5);
    experience.scrollIntoView({ behavior: "smooth", block: "start" });
    playVideo();
  } else if (activeQuestion === 4) {
    finishCase();
  } else {
    loadScene(sceneIndex + 1);
  }
}

function finishCase() {
  video.pause();
  experience.hidden = true;
  completion.hidden = false;
  const heading = completion.querySelector(".eyebrow");
  heading.textContent = `CASE COMPLETED · ${score} / 5 DECISIONS CORRECT`;
  completion.scrollIntoView({ behavior: "smooth", block: "start" });
  $("restartButton").focus({ preventScroll: true });
}

function resetExperience() {
  score = 0;
  scoredQuestions.clear();
  profileViewed = false;
  video2MidShown = false;
  gateActive = false;
  completion.hidden = true;
  experience.hidden = false;
  loadScene(0);
}

video.addEventListener("timeupdate", () => {
  updateTransport();
  if (sceneIndex === 1 && !video2MidShown && video.currentTime >= 6.45 && !gateActive) {
    video2MidShown = true;
    video.pause();
    showQuestion(1);
  }
});
video.addEventListener("loadedmetadata", updateTransport);
video.addEventListener("play", updateTransport);
video.addEventListener("pause", updateTransport);
video.addEventListener("error", () => { $("videoFallback").hidden = false; });
video.addEventListener("ended", () => {
  updateTransport();
  if (sceneIndex === 0) showProfilePrompt();
  else if (sceneIndex === 1) showQuestion(2);
  else if (sceneIndex === 2) showQuestion(3);
  else showQuestion(4);
});

$("startButton").addEventListener("click", () => {
  intro.hidden = true;
  experience.hidden = false;
  loadScene(0);
});
$("paperHotspot").addEventListener("click", openProfile);
$("openProfileBelow").addEventListener("click", openProfile);
$("closeProfile").addEventListener("click", () => closeProfile(false));
$("closeProfileContinue").addEventListener("click", () => closeProfile(true));
$("continueAfterProfile").addEventListener("click", () => showQuestion(0));
$("continueButton").addEventListener("click", continueStory);
$("restartButton").addEventListener("click", resetExperience);
$("retryVideo").addEventListener("click", () => { video.load(); playVideo(); });
$("playPauseButton").addEventListener("click", () => {
  if (video.paused) playVideo(); else video.pause();
});
$("muteButton").addEventListener("click", () => {
  video.muted = !video.muted;
  $("muteButton").textContent = video.muted ? "◖×" : "◖))";
  $("muteButton").setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
});
$("captionButton").addEventListener("click", () => {
  captionsOn = !captionsOn;
  $("captionButton").textContent = captionsOn ? "CC ON" : "CC OFF";
  $("captionButton").setAttribute("aria-pressed", String(captionsOn));
  updateTransport();
});
$("replayButton").addEventListener("click", () => {
  $("paperInteraction").hidden = true;
  $("postVideoActions").hidden = true;
  $("decisionCard").hidden = true;
  gateActive = false;
  video.currentTime = 0;
  experience.scrollIntoView({ behavior: "smooth", block: "start" });
  playVideo();
});
profileDialog.addEventListener("click", (event) => {
  if (event.target === profileDialog) closeProfile(false);
});
profileDialog.addEventListener("close", () => {
  if (profileViewed && sceneIndex === 0 && activeQuestion !== 0) $("continueAfterProfile").hidden = false;
});
updateTransport();
