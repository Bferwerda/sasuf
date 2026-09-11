(() => {
  "use strict";

  const CONFIG = window.STUDY_CONFIG || {};
  const STUDY_SITE = String(CONFIG.studySite || "").toUpperCase();
  const STUDY_VERSION = CONFIG.studyVersion || "2026-09-v15";
  const STORAGE_KEY = `sasuf-genai-draft-${STUDY_SITE || "UNKNOWN"}-${STUDY_VERSION}`;

  const scenarios = [
    { id: "proofreading", title: "Proofreading your own text", text: "You have written a short piece of coursework yourself. Before submitting it, you want to identify grammar, spelling and clarity problems in your text.", art: "proofread" },
    { id: "concept_explanation", title: "Understanding a difficult concept", text: "You encounter a concept in one of your courses that you do not fully understand. You want help explaining the concept in simpler language and seeing an example.", art: "concept" },
    { id: "reading_summary", title: "Working through an academic reading", text: "You have been assigned a long academic article and need to understand its main arguments before your next class.", art: "reading" },
    { id: "brainstorming", title: "Brainstorming ideas", text: "You are at the beginning of an assignment and need possible directions or ideas to explore before developing the work yourself.", art: "brainstorm" },
    { id: "language_support", title: "Language support", text: "You understand the topic of an academic text, but some of the language makes it difficult to follow. You want help translating or rephrasing parts of it into a language or form that is easier for you to understand.", art: "language" },
    { id: "academic_sources", title: "Finding academic sources", text: "You are starting an assignment and need to identify relevant academic literature and evidence on your topic. You want help locating and understanding potentially relevant sources.", art: "sources" },
    { id: "organising_information", title: "Organising information", text: "You have collected notes and information for an assignment and need to organise them into themes or categories before you continue your own analysis.", art: "organise" },
    { id: "feedback_work", title: "Getting feedback on your own work", text: "You have written a draft of an assignment yourself and want feedback on its clarity, argumentation and areas that could be improved before submitting it.", art: "feedback" },
    { id: "assessed_writing", title: "Drafting assessed work", text: "You need to write part of an assessed assignment and are deciding how much digital or AI assistance, if any, you would use to help produce a first draft.", art: "assessed" },
    { id: "data_interpretation", title: "Interpreting data or visual information", text: "You are working with a table, graph or set of results for one of your courses and need to understand the main patterns and what conclusions can reasonably be drawn from them.", art: "data" }
  ];

  const assistanceLevels = [
    { value: 1, label: "No AI assistance", short: "No AI", description: "Do the task without AI assistance, using your own work and ordinary course materials." },
    { value: 2, label: "Conventional digital tool", short: "Conventional", description: "Use a non-generative tool such as web search, a dictionary, spell-checker, calculator or reference source." },
    { value: 3, label: "Specialized AI tool", short: "Specialized AI", description: "Use an AI feature designed mainly for one function, such as grammar suggestions, translation or autocomplete." },
    { value: 4, label: "General-purpose GenAI", short: "GenAI", description: "Use a standard conversational Generative AI tool to generate, transform or explain content." },
    { value: 5, label: "Advanced / reasoning GenAI", short: "Advanced AI", description: "Use a more capable reasoning, research or large-context mode/model for a demanding task." }
  ];

  const agreementLabels = ["Strongly disagree", "Disagree", "Somewhat disagree", "Neither agree nor disagree", "Somewhat agree", "Agree", "Strongly agree"];
  const comfortLabels = ["Not at all comfortable", "Slightly comfortable", "Somewhat comfortable", "Moderately comfortable", "Comfortable", "Quite comfortable", "Very comfortable"];
  const difficultyLabels = ["Not difficult at all", "Slightly difficult", "Somewhat difficult", "Moderately difficult", "Quite difficult", "Very difficult", "Extremely difficult"];
  const importanceLabels = ["Not important at all", "Slightly important", "Somewhat important", "Moderately important", "Quite important", "Very important", "Extremely important"];
  const confidenceLabels = ["Not at all confident", "Slightly confident", "Somewhat confident", "Moderately confident", "Quite confident", "Very confident", "Completely confident"];
  const tradeoffLabels = ["Strongly prefer the simpler option", "Prefer the simpler option", "Somewhat prefer the simpler option", "Neutral / depends", "Somewhat prefer the more capable AI", "Prefer the more capable AI", "Strongly prefer the more capable AI"];

  const scenarioMeasures = [
    { key: "difficulty", text: "How difficult would this task be for you to complete satisfactorily without Generative AI?", left: "Not difficult at all", right: "Extremely difficult", labels: difficultyLabels },
    { key: "stakes", text: "How important is it to get a highly accurate or high-quality result for this task?", left: "Not important at all", right: "Extremely important", labels: importanceLabels },
    { key: "evaluation", text: "If you used AI for this task, how confident are you that you could judge whether its output was correct and appropriate?", left: "Not at all confident", right: "Completely confident", labels: confidenceLabels },
    { key: "appropriate", text: "Using AI for this task would be appropriate.", left: "Strongly disagree", right: "Strongly agree", labels: agreementLabels },
    { key: "value", text: "AI assistance would add meaningful value compared with a simpler option.", left: "Strongly disagree", right: "Strongly agree", labels: agreementLabels },
    { key: "alternative", text: "A simpler digital or non-AI option would adequately meet my needs for this task.", left: "Strongly disagree", right: "Strongly agree", labels: agreementLabels },
    { key: "learning", text: "AI assistance would support my learning rather than replace it.", left: "Strongly disagree", right: "Strongly agree", labels: agreementLabels }
  ];

  const purposeOptions = [
    ["explain", "Explaining concepts or tutoring"],
    ["brainstorm", "Brainstorming or idea generation"],
    ["summarise", "Summarising readings or notes"],
    ["write", "Drafting or rewriting text"],
    ["proofread", "Proofreading or language improvement"],
    ["translate", "Translation or language support"],
    ["code_data", "Programming, data or technical work"],
    ["sources", "Finding academic sources or evidence"],
    ["search", "General information search"],
    ["feedback", "Getting feedback on my own work"],
    ["other", "Other study-related use"],
    ["not_using", "I have not used GenAI for my studies"]
  ];

  const reasonOptions = [
    ["time", "Time or convenience"],
    ["complexity", "Complexity of the task"],
    ["quality", "Expected quality"],
    ["stakes", "Importance of getting the result right"],
    ["oversight", "Confidence evaluating the AI output"],
    ["learning", "Learning or understanding"],
    ["language", "Language or accessibility support"],
    ["alternative", "Availability of simpler alternatives"],
    ["cost_access", "Cost, internet or access"],
    ["integrity", "Academic rules or integrity"],
    ["privacy", "Privacy or sensitive information"],
    ["sustainability", "Computing / environmental resources"],
    ["habit", "Habit or familiarity"]
  ];

  const state = loadDraft() || {
    sessionId: (crypto.randomUUID ? crypto.randomUUID() : fallbackUUID()),
    studyVersion: STUDY_VERSION,
    startedAt: null,
    currentStep: 0,
    consent: {},
    context: {},
    baseline: {},
    scenarios: {},
    reflection: {},
    timing: { activeMs: 0, stepMs: {}, sessions: 0 }
  };
  state.consent ||= {};
  state.context ||= {};
  state.baseline ||= {};
  state.scenarios ||= {};
  state.reflection ||= {};
  state.timing ||= { activeMs: 0, stepMs: {}, sessions: 0 };
  state.timing.activeMs = Number(state.timing.activeMs) || 0;
  state.timing.stepMs = (state.timing.stepMs && typeof state.timing.stepMs === "object") ? state.timing.stepMs : {};
  state.timing.sessions = Number(state.timing.sessions) || 0;
  const scenarioIds = scenarios.map(s => s.id);
  if (!Array.isArray(state.scenarioOrder) || state.scenarioOrder.length !== scenarioIds.length || state.scenarioOrder.some(id => !scenarioIds.includes(id))) {
    state.scenarioOrder = shuffledCopy(scenarioIds);
  }
  const orderedScenarios = state.scenarioOrder.map(id => scenarios.find(s => s.id === id)).filter(Boolean);

  const steps = [
    { type: "consent", title: "About the study" },
    { type: "context", title: "About you and your studies" },
    { type: "practice", title: "Your current GenAI use" },
    { type: "access", title: "Access, guidance and context" },
    { type: "literacy", title: "AI literacy and attitudes" },
    ...orderedScenarios.map((scenario, index) => ({ type: "scenario", title: scenario.title, scenario, scenarioNumber: index + 1 })),
    { type: "reflection", title: "Final reflections" },
    { type: "submit", title: "Submit" }
  ];

  const hero = document.getElementById("hero");
  const panel = document.getElementById("studyPanel");
  const screen = document.getElementById("screen");
  const startBtn = document.getElementById("startBtn");
  const saveExitBtn = document.getElementById("saveExitBtn");
  const brandHome = document.getElementById("brandHome");
  const progressLabel = document.getElementById("progressLabel");
  const progressPercent = document.getElementById("progressPercent");
  const progressBar = document.getElementById("progressBar");

  // Completion-time paradata: active foreground time, with long idle periods excluded.
  const TIMING_IDLE_LIMIT_MS = 120000;
  let timingRunning = false;
  let timingLastTick = Date.now();
  let timingLastActivity = Date.now();
  let timingLastPersist = Date.now();

  function timingStepKey() {
    const step = steps[state.currentStep];
    if (!step) return "unknown";
    return step.type === "scenario" && step.scenario ? `scenario:${step.scenario.id}` : step.type;
  }
  function tickTiming(now = Date.now(), forceVisible = false) {
    if (!timingRunning || (document.hidden && !forceVisible)) { timingLastTick = now; return; }
    const activeUntil = Math.min(now, timingLastActivity + TIMING_IDLE_LIMIT_MS);
    const delta = Math.max(0, activeUntil - timingLastTick);
    if (delta > 0) {
      state.timing.activeMs += delta;
      const key = timingStepKey();
      state.timing.stepMs[key] = (Number(state.timing.stepMs[key]) || 0) + delta;
    }
    timingLastTick = now;
  }
  function noteTimingActivity() {
    if (!timingRunning || document.hidden) return;
    const now = Date.now();
    tickTiming(now);
    timingLastActivity = now;
    timingLastTick = now;
  }
  function startTimingSession(countSession = true) {
    const now = Date.now();
    timingRunning = true; timingLastTick = now; timingLastActivity = now;
    if (countSession) state.timing.sessions += 1;
  }
  function pauseTiming() {
    if (!timingRunning) return;
    tickTiming(Date.now(), true);
    timingRunning = false;
  }
  function timingSnapshot(submittedAtClient) {
    tickTiming();
    const started = state.startedAt ? Date.parse(state.startedAt) : NaN;
    const submitted = Date.parse(submittedAtClient);
    const elapsedSeconds = Number.isFinite(started) && Number.isFinite(submitted) ? Math.max(0, Math.round((submitted - started) / 1000)) : null;
    const stepSeconds = {};
    Object.entries(state.timing.stepMs || {}).forEach(([key, ms]) => { stepSeconds[key] = Math.max(0, Math.round((Number(ms) || 0) / 1000)); });
    const scenarioSeconds = Object.entries(stepSeconds).filter(([key]) => key.startsWith("scenario:")).map(([, value]) => value).sort((a,b)=>a-b);
    const medianScenarioSeconds = scenarioSeconds.length ? (scenarioSeconds.length % 2 ? scenarioSeconds[(scenarioSeconds.length - 1) / 2] : Math.round((scenarioSeconds[scenarioSeconds.length/2 - 1] + scenarioSeconds[scenarioSeconds.length/2]) / 2)) : null;
    return {
      active_seconds: Math.max(0, Math.round(state.timing.activeMs / 1000)),
      elapsed_seconds: elapsedSeconds,
      step_seconds: stepSeconds,
      median_scenario_seconds: medianScenarioSeconds,
      survey_sessions: Math.max(1, Math.round(state.timing.sessions || 1)),
      idle_limit_seconds: TIMING_IDLE_LIMIT_MS / 1000
    };
  }
  ["pointerdown", "keydown", "input", "change"].forEach(type => document.addEventListener(type, noteTimingActivity));
  window.addEventListener("scroll", noteTimingActivity, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { tickTiming(Date.now(), true); timingRunning = false; saveDraft(); }
    else if (!panel.classList.contains("hidden")) startTimingSession(false);
  });
  window.addEventListener("pagehide", () => { pauseTiming(); saveCurrentForm(); saveDraft(); });
  setInterval(() => { if (timingRunning) { tickTiming(); if (Date.now() - timingLastPersist > 30000) { saveDraft(); timingLastPersist = Date.now(); } } }, 5000);

  // Validation feedback follows the missing question and disappears when that question is answered.
  screen.addEventListener("input", event => maybeClearValidation(event.target));
  screen.addEventListener("change", event => maybeClearValidation(event.target));

  if (!["SE", "SA"].includes(STUDY_SITE)) {
    document.body.innerHTML = '<main style="max-width:760px;margin:80px auto;padding:24px;font-family:system-ui"><h1>Study configuration error</h1><p>This survey entry point is missing a valid study site.</p></main>';
    throw new Error("Invalid or missing studySite in config.js");
  }

  const siteName = STUDY_SITE === "SE" ? "Sweden" : "South Africa";
  document.querySelectorAll("[data-site-label]").forEach(el => { el.textContent = `${siteName} study`; });
  document.querySelectorAll("[data-site-name]").forEach(el => { el.textContent = siteName; });

  if (state.startedAt) startBtn.textContent = "Continue saved study →";

  startBtn.addEventListener("click", () => {
    state.startedAt ||= new Date().toISOString();
    startTimingSession(true);
    saveDraft();
    hero.classList.add("hidden");
    panel.classList.remove("hidden");
    saveExitBtn.classList.remove("hidden");
    renderStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  saveExitBtn.addEventListener("click", () => {
    pauseTiming();
    saveCurrentForm();
    saveDraft();
    panel.classList.add("hidden");
    saveExitBtn.classList.add("hidden");
    hero.classList.remove("hidden");
    startBtn.textContent = "Continue saved study →";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  brandHome.addEventListener("click", (event) => {
    event.preventDefault();
    if (!panel.classList.contains("hidden")) { pauseTiming(); saveCurrentForm(); }
    saveDraft();
    panel.classList.add("hidden");
    saveExitBtn.classList.add("hidden");
    hero.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function renderStep() {
    const step = steps[state.currentStep];
    const pct = Math.round((state.currentStep / (steps.length - 1)) * 100);
    progressLabel.textContent = `Step ${state.currentStep + 1} of ${steps.length}`;
    progressPercent.textContent = `${pct}%`;
    progressBar.style.width = `${pct}%`;

    if (step.type === "consent") renderConsent();
    else if (step.type === "context") renderContext();
    else if (step.type === "practice") renderPractice();
    else if (step.type === "access") renderAccess();
    else if (step.type === "literacy") renderLiteracy();
    else if (step.type === "scenario") renderScenario(step);
    else if (step.type === "reflection") renderReflection();
    else if (step.type === "submit") renderSubmit();
  }

  function renderConsent() {
    const contacts = contactHTML();
    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">Participant information</span>
        <h2>About the study</h2>
        <p class="screen-intro">We are studying how university students in Sweden and South Africa choose between simpler digital tools and different levels of AI assistance for academic tasks. Everyone sees the same scenarios; this is a comparative survey rather than an experimental manipulation.</p>
        <ul class="consent-list consent-list-compact">
          <li>The survey takes approximately 20–25 minutes.</li>
          <li>Participation is voluntary, for students aged 18 or older, and you may stop at any time before submitting without giving a reason. Participating or not participating will not affect your studies, grades, services, or relationship with your university.</li>
          <li>We do not ask for your name, email address, student number, or other direct identifiers. Please do not enter identifying information in open-text boxes.</li>
          <li>Your responses may be used in academic research publications, project reports, and the development of preliminary guidance for responsible GenAI use.</li>
        </ul>
        <details class="participant-info-details">
          <summary>Privacy, data storage and research ethics</summary>
          <div class="participant-info-content">
            <section><h3>Ethics and participant rights</h3><p>${escapeHTML(CONFIG.ethicsText || "This is voluntary academic research involving university students aged 18 years or older. Choosing whether or not to participate will not affect your studies, grades, access to university services, or relationship with your university. You may stop the survey at any time before submitting your response, without giving a reason. If you have questions about participation, research ethics, or how your data are handled, please contact one of the researchers listed below.")}</p></section>
            <section><h3>Data storage and privacy</h3><p>${escapeHTML(CONFIG.privacyText || "When you submit the survey, your response is transmitted over HTTPS to a password-protected MySQL research database on the project server at wabisabitech.hk. The research dataset stores a random study identifier, your institution and study-context information, your questionnaire responses, and study timestamps. It does not intentionally store your name, email address, student number, IP address, browser fingerprint, or user-agent. Standard web-server and security logs may separately contain routine connection metadata and are not part of the research dataset. While you are completing the survey, an unfinished draft may be stored temporarily in your browser so that the survey can recover after a refresh; this local draft is removed after successful submission. Access to the research database is restricted to the research team. Data may be analysed across the participating institutions and used in academic publications, reports, and project outputs. Only aggregated or de-identified findings will be reported. Research data will be retained and disposed of in accordance with the applicable research-data requirements of the participating institutions.")}</p></section>
          </div>
        </details>
        <section class="participant-contacts"><h3>Research contacts</h3>${contacts}</section>
        <div class="notice info scenario-explainer"><strong>About the scenario questions:</strong> you will first choose the type of assistance you would normally use. Separately, you will answer a hypothetical trade-off question about preferring a simpler, lower-resource option or a more capable AI option that requires more computing resources. We do not assume that the five real-world tool categories themselves have a fixed environmental ranking.</div>
        <div class="consent-box"><label class="checkbox-choice"><input type="checkbox" id="consentCheck" ${state.consent.agreed ? "checked" : ""}><span>I have read the information above, I am at least 18 years old, and I voluntarily agree to participate.</span></label></div>
        <div id="validation" class="validation" role="alert"></div>
        ${navButtons(false, "Continue")}
      </article>`;
    bindNav(() => {
      if (!document.getElementById("consentCheck").checked) return showValidation("Please confirm your consent before continuing.", "consentCheck");
      state.consent = { agreed: true, timestamp: new Date().toISOString() };
      return true;
    });
  }

  function renderContext() {
    const c = state.context;
    const institutions = Array.isArray(CONFIG.institutions) ? CONFIG.institutions : [];
    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">Study context · ${escapeHTML(siteName)}</span>
        <h2>About you and your studies</h2>
        <p class="screen-intro">These questions help us interpret differences between higher-education contexts without collecting directly identifying information. The study site refers to where you study, not your nationality.</p>
        ${selectField("institution", "Current institution", [["", "Select…"], ...institutions.map(x => [x, x])], c.institution)}
        ${selectField("studyLevel", "Current study level", [["", "Select…"], ["Bachelor", "Bachelor's / undergraduate"], ["Master", "Master's / postgraduate taught"], ["Doctoral", "Doctoral / PhD"], ["Other", "Other"]], c.studyLevel)}
        ${selectField("programmeYear", "Year in your current programme", [["", "Select…"], ["1", "First year"], ["2", "Second year"], ["3", "Third year"], ["4+", "Fourth year or later"], ["Not applicable", "Not applicable / programme is not organised by year"]], c.programmeYear)}
        ${selectField("discipline", "Broad field of study", [["", "Select…"], ["Computing", "Computer science / IT / engineering"], ["Business", "Business / economics / management"], ["Education", "Education"], ["Health", "Health / medicine"], ["Humanities", "Humanities / languages"], ["Social Sciences", "Social sciences"], ["Natural Sciences", "Natural sciences"], ["Other", "Other"]], c.discipline)}
        ${ageField(c.age)}
        ${selectField("gender", "Gender", [["", "Select…"], ["Woman", "Woman"], ["Man", "Man"], ["Non-binary or another gender", "Non-binary or another gender"], ["Prefer not to say", "Prefer not to say"]], c.gender)}
        ${selectField("programmeLanguageFirst", "Is the main language used in your programme one of your first or home languages?", [["", "Select…"], ["Yes", "Yes"], ["No", "No"], ["Prefer not to say", "Prefer not to say"]], c.programmeLanguageFirst)}
        ${selectField("preUniversitySameCountry", "Did you complete most of your education before university in the same country in which you are currently studying?", [["", "Select…"], ["Yes", "Yes"], ["No", "No"], ["Prefer not to say", "Prefer not to say"]], c.preUniversitySameCountry)}
        ${rangeScale("languageComfort", "How comfortable are you studying in the main language used in your programme?", c.languageComfort, "Not at all comfortable", "Very comfortable", comfortLabels)}
        <div id="validation" class="validation" role="alert"></div>
        ${navButtons(true, "Continue")}
      </article>`;
    bindRangeScales();
    bindAgeField();
    bindNav(() => {
      const ids = ["institution", "studyLevel", "programmeYear", "discipline", "gender", "programmeLanguageFirst", "preUniversitySameCountry"];
      const missing = ids.find(id => !document.getElementById(id).value);
      if (missing) return showValidation("Please answer this question before continuing. You may choose 'Prefer not to say' where offered.", missing);
      const age = getAgeValue();
      if (!age) return showValidation("Please enter your age in whole years (18–75), or choose 'Prefer not to say'.", "age");
      if (!getScaleValue("languageComfort")) return showValidation("Please answer this question before continuing.", "languageComfort");
      state.context = { ...collectValues(ids), age, languageComfort: getScaleValue("languageComfort"), studySite: STUDY_SITE };
      return true;
    });
  }

  function renderPractice() {
    const b = state.baseline;
    const selectedPurposes = Array.isArray(b.purposes) ? b.purposes : [];
    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">Current practice</span>
        <h2>Your current GenAI use</h2>
        <p class="screen-intro">Think about tools such as ChatGPT, Gemini, Copilot, Claude, or other systems that generate text, images, code or explanations.</p>
        ${selectField("useFrequency", "How often have you used Generative AI for your studies during the past 12 months?", [["", "Select…"], ["Never", "Never"], ["Less than monthly", "Less than once a month"], ["Monthly", "A few times a month"], ["Weekly", "A few times a week"], ["Daily", "Daily or almost daily"]], b.useFrequency)}
        <div class="field"><div class="field-label">What have you used GenAI for in your studies during the past 12 months?</div><div class="field-hint">Select all that apply.</div><div class="choice-grid purpose-grid">${purposeOptions.map(([value,label]) => `<label class="checkbox-choice"><input type="checkbox" name="purposes" value="${value}" ${selectedPurposes.includes(value) ? "checked" : ""}><span>${escapeHTML(label)}</span></label>`).join("")}</div></div>
        ${yesNoUnsure("paidAccess", "Do you currently have access to a paid or premium GenAI service?", b.paidAccess)}
        ${yesNoUnsure("institutionalAccess", "Does your university provide you with access to a Generative AI service or licence?", b.institutionalAccess)}
        ${yesNoUnsure("guidance", "Has your institution or programme given you guidance about acceptable GenAI use?", b.guidance)}
        ${yesNoUnsure("formalTraining", "Have you received formal teaching, training, or instruction from your university about how to use Generative AI effectively?", b.formalTraining)}
        ${yesNoUnsure("resourceAwareness", "Before this survey, were you aware that different digital and AI tools can require substantially different amounts of computing resources?", b.resourceAwareness)}
        ${yesNoUnsureNA("localContextMismatch", "Have you encountered GenAI responses that were poorly suited to your local, cultural or regional context?", b.localContextMismatch)}
        <div id="validation" class="validation" role="alert"></div>
        ${navButtons(true, "Continue")}
      </article>`;
    bindPurposeExclusivity();
    bindNav(() => {
      const frequency = document.getElementById("useFrequency").value;
      const purposes = [...document.querySelectorAll('input[name="purposes"]:checked')].map(x => x.value);
      const paidAccess = getRadioValue("paidAccess"), institutionalAccess = getRadioValue("institutionalAccess"), guidance = getRadioValue("guidance"), formalTraining = getRadioValue("formalTraining"), resourceAwareness = getRadioValue("resourceAwareness"), localContextMismatch = getRadioValue("localContextMismatch");
      if (!frequency) return showValidation("Please answer this question before continuing.", "useFrequency");
      if (!purposes.length) return showValidation("Please select at least one option before continuing.", document.querySelector('input[name="purposes"]'));
      for (const name of ["paidAccess", "institutionalAccess", "guidance", "formalTraining", "resourceAwareness", "localContextMismatch"]) {
        if (!getRadioValue(name)) return showValidation("Please answer this question before continuing.", document.querySelector(`input[name="${name}"]`));
      }
      if (frequency === "Never" && !purposes.includes("not_using")) return showValidation("You selected 'Never'. Please also select 'I have not used GenAI for my studies'.", document.querySelector('input[name="purposes"][value="not_using"]'));
      if (frequency !== "Never" && purposes.includes("not_using")) return showValidation("Your use-frequency answer indicates some GenAI use. Please select the purposes that apply instead of 'I have not used GenAI'.", document.querySelector('input[name="purposes"][value="not_using"]'));
      Object.assign(state.baseline, { useFrequency: frequency, purposes, paidAccess, institutionalAccess, guidance, formalTraining, resourceAwareness, localContextMismatch });
      return true;
    });
  }

  function renderAccess() {
    const b = state.baseline;
    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">Access &amp; guidance</span>
        <h2>Your study context</h2>
        <p class="screen-intro">Please indicate how much you agree with each statement.</p>
        ${rangeScale("internetAccess", "I have reliable enough internet access to use GenAI when I want to.", b.internetAccess)}
        ${rangeScale("costConstraint", "The cost of data, internet access or paid AI services limits how I use GenAI.", b.costConstraint)}
        ${rangeScale("guidanceUnderstanding", "I understand what kinds of GenAI use are permitted in my courses or programme.", b.guidanceUnderstanding)}
        ${rangeScale("integrityConcern", "I am concerned about unintentionally violating academic-integrity rules when using GenAI.", b.integrityConcern)}
        ${rangeScale("languageBenefit", "GenAI can help me overcome language-related difficulties in my studies.", b.languageBenefit)}
        ${rangeScale("equalAccess", "Students at my institution have reasonably equal opportunities to access and use GenAI tools.", b.equalAccess)}
        ${rangeScale("peerNorm", "Using Generative AI for coursework is common among students in my programme.", b.peerNorm)}
        ${rangeScale("lecturerNorm", "My lecturers generally view responsible use of Generative AI positively.", b.lecturerNorm)}
        ${rangeScale("rulePreference", "I prefer clear rules about when Generative AI is and is not allowed in my coursework.", b.rulePreference)}
        <div id="validation" class="validation" role="alert"></div>
        ${navButtons(true, "Continue")}
      </article>`;
    bindRangeScales();
    bindNav(() => saveScaleGroup(["internetAccess", "costConstraint", "guidanceUnderstanding", "integrityConcern", "languageBenefit", "equalAccess", "peerNorm", "lecturerNorm", "rulePreference"]));
  }

  function renderLiteracy() {
    const b = state.baseline;
    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">AI literacy &amp; attitudes</span>
        <h2>How you evaluate GenAI</h2>
        <p class="screen-intro">Please indicate how much you agree with each statement.</p>
        ${rangeScale("aiConfidence", "I feel confident deciding when GenAI is appropriate for an academic task.", b.aiConfidence)}
        ${rangeScale("aiLiteracy", "I understand important limitations and risks of GenAI for academic work.", b.aiLiteracy)}
        ${rangeScale("verifyOutput", "I know how to check whether information produced by GenAI is reliable.", b.verifyOutput)}
        ${rangeScale("privacyKnowledge", "I know what kinds of information I should not share with a GenAI system.", b.privacyKnowledge)}
        ${rangeScale("sustainabilityImportance", "The environmental and computing-resource implications of digital tools are important to me.", b.sustainabilityImportance)}
        ${rangeScale("lowerResourcePreference", "If two options work equally well, I prefer the option that uses fewer computing resources.", b.lowerResourcePreference)}
        ${rangeScale("dependencyConcern", "I am concerned that relying too much on Generative AI could reduce my ability to perform academic tasks independently.", b.dependencyConcern)}
        ${rangeScale("careerImportance", "Being able to use GenAI effectively will be important for my future work or career.", b.careerImportance)}
        <div id="validation" class="validation" role="alert"></div>
        ${navButtons(true, "Continue to scenarios")}
      </article>`;
    bindRangeScales();
    bindNav(() => saveScaleGroup(["aiConfidence", "aiLiteracy", "verifyOutput", "privacyKnowledge", "sustainabilityImportance", "lowerResourcePreference", "dependencyConcern", "careerImportance"]));
  }

  function renderScenario(step) {
    const s = step.scenario;
    const saved = state.scenarios[s.id] || {};
    screen.innerHTML = `
      <article class="screen-card scenario-card">
        <div class="scenario-layout">
          <aside class="scenario-art" aria-hidden="true">${scenarioSVG(s.art)}</aside>
          <div class="scenario-content">
            <div class="scenario-number">${step.scenarioNumber} / ${scenarios.length}</div>
            <h2>${escapeHTML(s.title)}</h2>
            <p class="scenario-text">${escapeHTML(s.text)}</p>
            ${assistanceSlider(s.id, saved.assistanceLevel)}
            <details class="level-guide" ${step.scenarioNumber === 1 ? "open" : ""}><summary>What do the five assistance types mean?</summary><div class="level-guide-grid">${assistanceLevels.map(level => `<div><span class="level-number">${level.value}</span><p><strong>${escapeHTML(level.label)}</strong><br>${escapeHTML(level.description)}</p></div>`).join("")}</div><p class="scale-note">These categories describe the kind and capability of assistance you would choose. They are not treated as a fixed environmental-impact scale.</p></details>
            <div class="scenario-rating-intro"><strong>About this task</strong><span>Please rate the task and the role AI could play in it.</span></div>
            <div class="scenario-measures">${scenarioMeasures.map(m => rangeScale(`${s.id}_${m.key}`, m.text, saved[m.key], m.left, m.right, m.labels)).join("")}</div>
            ${tradeoffSlider(s.id, saved.resourceTradeoff)}
            <div id="validation" class="validation" role="alert"></div>
            ${navButtons(true, step.scenarioNumber === scenarios.length ? "Continue" : "Next scenario")}
          </div>
        </div>
      </article>`;

    bindAssistanceSlider(`${s.id}_assistance`);
    bindTradeoffSlider(`${s.id}_tradeoff`);
    bindRangeScales();

    bindNav(() => {
      const assistanceLevel = getScaleValue(`${s.id}_assistance`);
      if (!assistanceLevel) return showValidation("Please choose the type of assistance you would normally use.", `${s.id}_assistance`);
      const answers = { assistanceLevel };
      for (const m of scenarioMeasures) {
        const value = getScaleValue(`${s.id}_${m.key}`);
        if (!value) return showValidation("Please answer this task-rating question before continuing.", `${s.id}_${m.key}`);
        answers[m.key] = value;
      }
      const resourceTradeoff = getScaleValue(`${s.id}_tradeoff`);
      if (!resourceTradeoff) return showValidation("Please answer the resource–capability trade-off question.", `${s.id}_tradeoff`);
      answers.resourceTradeoff = resourceTradeoff;
      state.scenarios[s.id] = answers;
      return true;
    });
  }

  function renderReflection() {
    const r = state.reflection;
    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">Final reflections</span>
        <h2>When is more AI actually worth it?</h2>
        <p class="screen-intro">There are no right or wrong answers. We are interested in the principles you use when choosing between simpler tools and more capable AI systems.</p>
        <div class="field scenario-question"><div class="field-label">Across academic tasks, which factors most influence whether and how much AI you use?</div><div class="field-hint">Select up to five.</div><div class="choice-grid">${reasonOptions.map(([value,label]) => `<label class="checkbox-choice"><input type="checkbox" name="decisionFactors" value="${value}" ${(r.decisionFactors || []).includes(value) ? "checked" : ""}><span>${escapeHTML(label)}</span></label>`).join("")}</div></div>
        <div class="field"><label for="worthUsing">In what kinds of academic situations do you think GenAI is particularly valuable or justified?</label><textarea id="worthUsing" maxlength="1500">${escapeHTML(r.worthUsing || "")}</textarea></div>
        <div class="field"><label for="avoidUsing">In what kinds of academic situations do you think students should avoid or reconsider using GenAI?</label><textarea id="avoidUsing" maxlength="1500">${escapeHTML(r.avoidUsing || "")}</textarea></div>
        <div class="field"><label for="guidanceWanted">What should universities consider when giving students guidance on choosing between simpler digital tools and more capable AI systems? <span class="optional-tag">Optional</span></label><textarea id="guidanceWanted" maxlength="1500">${escapeHTML(r.guidanceWanted || "")}</textarea></div>
        <div class="field"><label for="otherComments">Anything else you would like us to know? <span class="optional-tag">Optional</span></label><textarea id="otherComments" maxlength="1500">${escapeHTML(r.otherComments || "")}</textarea></div>
        <div id="validation" class="validation" role="alert"></div>
        ${navButtons(true, "Review & submit")}
      </article>`;
    const factorBoxes = [...document.querySelectorAll('input[name="decisionFactors"]')];
    factorBoxes.forEach(box => box.addEventListener("change", () => {
      const checked = factorBoxes.filter(b => b.checked);
      if (checked.length > 5) { box.checked = false; showValidation("Please select no more than five factors.", box); }
      else showValidation("");
    }));
    bindNav(() => {
      const decisionFactors = factorBoxes.filter(b => b.checked).map(b => b.value);
      const worthUsing = document.getElementById("worthUsing").value.trim();
      const avoidUsing = document.getElementById("avoidUsing").value.trim();
      const guidanceWanted = document.getElementById("guidanceWanted").value.trim();
      if (!decisionFactors.length) return showValidation("Please select at least one factor that influences your AI choices.", document.querySelector('input[name="decisionFactors"]'));
      if (!worthUsing) return showValidation("Please answer this question before continuing.", "worthUsing");
      if (!avoidUsing) return showValidation("Please answer this question before continuing.", "avoidUsing");
      state.reflection = { decisionFactors, worthUsing, avoidUsing, guidanceWanted, otherComments: document.getElementById("otherComments").value.trim() };
      return true;
    });
  }

  function renderSubmit() {
    const configured = backendConfigured();
    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">Final step</span>
        <h2>Submit your responses</h2>
        <p class="screen-intro">Your answers are ready. You can go back to change anything before submitting.</p>
        <div class="notice ${configured ? "info" : "warning"}">${configured ? "<strong>Live storage is configured.</strong> Your response will be sent over HTTPS to the study database, then the temporary browser draft will be removed." : "<strong>Demo mode:</strong> no remote database is configured. Finishing will download a local JSON test response."}</div>
        <div class="field"><div class="field-label">Anonymous study code</div><div class="completion-code">${escapeHTML(state.sessionId)}</div><div class="field-hint">This randomly generated code distinguishes submissions. It is not based on your identity.</div></div>
        <div id="validation" class="validation" role="alert"></div>
        <div class="actions"><button class="secondary-button" id="backBtn" type="button">← Back</button><div class="right"><button class="primary-button" id="submitBtn" type="button">${configured ? "Submit responses" : "Finish demo & download JSON"}</button></div></div>
      </article>`;
    document.getElementById("backBtn").addEventListener("click", goBack);
    document.getElementById("submitBtn").addEventListener("click", submitStudy);
  }

  async function submitStudy() {
    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.textContent = "Submitting…";
    showValidation("");
    tickTiming();
    const payload = buildPayload();
    try {
      if (backendConfigured()) { await submitToBackend(payload); pauseTiming(); localStorage.removeItem(STORAGE_KEY); renderCompletion(true); }
      else { pauseTiming(); downloadJSON(payload); localStorage.removeItem(STORAGE_KEY); renderCompletion(false); }
    } catch (error) {
      console.error(error);
      btn.disabled = false;
      btn.textContent = "Try again";
      showValidation("The response could not be submitted. Your answers remain saved on this device. Please check your connection and try again.");
    }
  }

  function renderCompletion(live) {
    progressBar.style.width = "100%";
    progressPercent.textContent = "100%";
    progressLabel.textContent = "Complete";
    saveExitBtn.classList.add("hidden");
    screen.innerHTML = `<article class="screen-card"><div class="completion"><div class="completion-icon">✓</div><h2>Thank you</h2><p class="screen-intro completion-copy">Your participation helps us understand how students in different higher-education contexts choose an appropriate level of AI assistance.</p><div class="completion-code">${escapeHTML(state.sessionId)}</div><div class="notice info storage-status">${live ? "<strong>Response saved.</strong> The database accepted your response and the temporary browser draft has been removed." : "<strong>Demo completed.</strong> A JSON test response was downloaded; nothing was sent to a research database."}</div></div></article>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildPayload() {
    const submittedAtClient = new Date().toISOString();
    const timing = timingSnapshot(submittedAtClient);
    return {
      study_site: STUDY_SITE,
      session_id: state.sessionId,
      study_version: state.studyVersion,
      institution: state.context.institution || null,
      study_level: state.context.studyLevel || null,
      discipline: state.context.discipline || null,
      payload: {
        study_site: STUDY_SITE,
        started_at: state.startedAt,
        submitted_at_client: submittedAtClient,
        timing,
        scenario_order: state.scenarioOrder,
        consent: state.consent,
        context: { ...state.context, studySite: STUDY_SITE },
        baseline: state.baseline,
        scenarios: state.scenarios,
        reflection: state.reflection
      }
    };
  }

  async function submitToBackend(payload) {
    const endpoint = String(CONFIG.submissionEndpoint || "").trim();
    if (!endpoint) throw new Error("No submission endpoint configured");
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), cache: "no-store" });
    let body = null;
    try { body = await response.json(); } catch (_) {}
    if (!response.ok || !body?.ok) throw new Error(body?.error || `HTTP ${response.status}`);
  }

  function backendConfigured() { return Boolean(String(CONFIG.submissionEndpoint || "").trim()); }

  function saveScaleGroup(ids) {
    for (const id of ids) {
      if (!getScaleValue(id)) return showValidation("Please answer this question before continuing.", id);
    }
    ids.forEach(id => { state.baseline[id] = getScaleValue(id); });
    return true;
  }

  function bindNav(validateAndSave) {
    const back = document.getElementById("backBtn"), next = document.getElementById("nextBtn");
    if (back) back.addEventListener("click", goBack);
    if (next) next.addEventListener("click", () => {
      if (validateAndSave() === true) {
        clearValidation();
        tickTiming();
        state.currentStep += 1;
        saveDraft();
        renderStep();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function goBack() {
    tickTiming();
    saveCurrentForm();
    state.currentStep = Math.max(0, state.currentStep - 1);
    saveDraft();
    renderStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveCurrentForm() {
    const step = steps[state.currentStep];
    try {
      if (step.type === "context") {
        state.context = { ...collectValues(["institution", "studyLevel", "programmeYear", "discipline", "gender", "programmeLanguageFirst", "preUniversitySameCountry"]), age: getAgeValue() || "", languageComfort: getScaleValue("languageComfort"), studySite: STUDY_SITE };
      } else if (step.type === "practice") {
        Object.assign(state.baseline, {
          useFrequency: document.getElementById("useFrequency")?.value || "",
          purposes: [...document.querySelectorAll('input[name="purposes"]:checked')].map(x => x.value),
          paidAccess: getRadioValue("paidAccess"), institutionalAccess: getRadioValue("institutionalAccess"), guidance: getRadioValue("guidance"), formalTraining: getRadioValue("formalTraining"), resourceAwareness: getRadioValue("resourceAwareness"), localContextMismatch: getRadioValue("localContextMismatch")
        });
      } else if (step.type === "access") {
        ["internetAccess", "costConstraint", "guidanceUnderstanding", "integrityConcern", "languageBenefit", "equalAccess", "peerNorm", "lecturerNorm", "rulePreference"].forEach(id => { state.baseline[id] = getScaleValue(id); });
      } else if (step.type === "literacy") {
        ["aiConfidence", "aiLiteracy", "verifyOutput", "privacyKnowledge", "sustainabilityImportance", "lowerResourcePreference", "dependencyConcern", "careerImportance"].forEach(id => { state.baseline[id] = getScaleValue(id); });
      } else if (step.type === "scenario") {
        const s = step.scenario;
        const answers = { assistanceLevel: getScaleValue(`${s.id}_assistance`), resourceTradeoff: getScaleValue(`${s.id}_tradeoff`) };
        scenarioMeasures.forEach(m => { answers[m.key] = getScaleValue(`${s.id}_${m.key}`); });
        state.scenarios[s.id] = answers;
      } else if (step.type === "reflection") {
        state.reflection = {
          decisionFactors: [...document.querySelectorAll('input[name="decisionFactors"]:checked')].map(x => x.value),
          worthUsing: document.getElementById("worthUsing")?.value.trim() || "",
          avoidUsing: document.getElementById("avoidUsing")?.value.trim() || "",
          guidanceWanted: document.getElementById("guidanceWanted")?.value.trim() || "",
          otherComments: document.getElementById("otherComments")?.value.trim() || ""
        };
      }
      saveDraft();
    } catch (_) {}
  }

  function navButtons(showBack, nextText) {
    return `<div class="actions">${showBack ? '<button class="secondary-button" id="backBtn" type="button">← Back</button>' : '<span></span>'}<div class="right"><button class="primary-button" id="nextBtn" type="button">${escapeHTML(nextText)} →</button></div></div>`;
  }

  function selectField(id, label, options, value = "") {
    return `<div class="field"><label for="${id}">${escapeHTML(label)}</label><select id="${id}">${options.map(([v,l]) => `<option value="${escapeHTML(v)}" ${String(value) === String(v) ? "selected" : ""}>${escapeHTML(l)}</option>`).join("")}</select></div>`;
  }

  function ageField(value = "") {
    const prefer = String(value) === "Prefer not to say";
    const numeric = !prefer && value !== "" && value != null ? String(value) : "";
    return `<div class="field age-field">
      <label for="age">Age (in years)</label>
      <div class="field-hint">Exact age lets us describe and compare the samples more precisely. You may choose not to provide it.</div>
      <div class="age-entry-row">
        <input id="age" class="number-input" type="number" min="18" max="75" step="1" inputmode="numeric" autocomplete="off" placeholder="e.g., 23" value="${escapeHTML(numeric)}" ${prefer ? "disabled" : ""}>
        <label class="checkbox-choice age-prefer"><input id="agePreferNot" type="checkbox" ${prefer ? "checked" : ""}><span>Prefer not to say</span></label>
      </div>
    </div>`;
  }

  function getAgeValue() {
    const prefer = document.getElementById("agePreferNot");
    const input = document.getElementById("age");
    if (prefer?.checked) return "Prefer not to say";
    if (!input) return "";
    const raw = String(input.value || "").trim();
    if (!/^\d+$/.test(raw)) return "";
    const age = Number(raw);
    if (!Number.isInteger(age) || age < 18 || age > 75) return "";
    return String(age);
  }

  function bindAgeField() {
    const prefer = document.getElementById("agePreferNot");
    const input = document.getElementById("age");
    if (!prefer || !input) return;
    const sync = () => {
      input.disabled = prefer.checked;
      if (prefer.checked) input.value = "";
      maybeClearValidation(prefer.checked ? prefer : input);
    };
    prefer.addEventListener("change", sync);
  }

  function yesNoUnsure(id, label, value = "") { return radioChoices(id, label, [["Yes","Yes"],["No","No"],["Unsure","Not sure"]], value); }
  function yesNoUnsureNA(id, label, value = "") { return radioChoices(id, label, [["Yes","Yes"],["No","No"],["Unsure","Not sure"],["Not applicable","Not applicable / I have not used GenAI"]], value); }
  function radioChoices(id, label, choices, value = "") {
    return `<div class="field"><div class="field-label">${escapeHTML(label)}</div><div class="choice-grid compact-choices">${choices.map(([v,l]) => `<label class="choice"><input type="radio" name="${id}" value="${escapeHTML(v)}" ${String(value) === v ? "checked" : ""}><span>${escapeHTML(l)}</span></label>`).join("")}</div></div>`;
  }

  function scaleLabelsFor(left, right, explicitLabels) {
    if (Array.isArray(explicitLabels) && explicitLabels.length === 7) return explicitLabels;
    if (left === "Strongly disagree" && right === "Strongly agree") return agreementLabels;
    if (left === "Not at all comfortable" && right === "Very comfortable") return comfortLabels;
    return [left, `2`, `3`, `4`, `5`, `6`, right];
  }

  function positionedTickRow(count, className = "range-ticks") {
    const ticks = Array.from({ length: count }, (_, index) => {
      const fraction = count === 1 ? 0 : index / (count - 1);
      const pct = fraction * 100;
      const offset = 14 * (1 - 2 * fraction);
      return `<span style="left:calc(${pct.toFixed(4)}% + ${offset.toFixed(2)}px)">${index + 1}</span>`;
    }).join("");
    return `<div class="${className}" aria-hidden="true">${ticks}</div>`;
  }

  function rangeScale(id, label, value = "", left = "Strongly disagree", right = "Strongly agree", explicitLabels = null) {
    const labels = scaleLabelsFor(left, right, explicitLabels);
    const answered = value !== "" && value != null;
    const current = answered ? Number(value) : 4;
    const selectedLabel = answered ? labels[current - 1] : "Not answered";
    return `<div class="range-block">
      <div class="range-question">${escapeHTML(label)}</div>
      <div class="range-head"><span>${escapeHTML(left)}</span><span>${escapeHTML(right)}</span></div>
      <input class="survey-range" id="${id}" data-scale="7" data-answered="${answered ? "true" : "false"}" data-labels="${escapeHTML(JSON.stringify(labels))}" type="range" min="1" max="7" step="1" value="${current}" aria-label="${escapeHTML(label)}">
      ${positionedTickRow(7)}
      <output id="${id}_output" class="range-output ${answered ? "answered" : ""}">${escapeHTML(selectedLabel)}</output>
    </div>`;
  }

  function assistanceSlider(scenarioId, value = "") {
    const id = `${scenarioId}_assistance`;
    const answered = value !== "" && value != null;
    const current = answered ? Number(value) : 3;
    const level = assistanceLevels.find(x => x.value === current) || assistanceLevels[2];
    return `<section class="assistance-block" aria-labelledby="${id}_label">
      <div class="assistance-title" id="${id}_label">What type of assistance would you normally choose for this task?</div>
      <p class="field-hint">Choose the option you would most likely use if all five were available and permitted.</p>
      <input class="assistance-range" id="${id}" data-scale="5" data-answered="${answered ? "true" : "false"}" type="range" min="1" max="5" step="1" value="${current}" aria-label="Type of assistance">
      ${positionedTickRow(5, "assistance-ticks")}
      <div class="assistance-selected ${answered ? "answered" : ""}" id="${id}_selected"><div><strong>${answered ? escapeHTML(level.label) : "Move or tap the slider to choose"}</strong><p>${answered ? escapeHTML(level.description) : "Your answer will not be recorded until you interact with the scale."}</p></div></div>
    </section>`;
  }

  function tradeoffSlider(scenarioId, value = "") {
    const id = `${scenarioId}_tradeoff`;
    const answered = value !== "" && value != null;
    const current = answered ? Number(value) : 4;
    const selectedLabel = answered ? tradeoffLabels[current - 1] : "Not answered";
    return `<section class="tradeoff-block" aria-labelledby="${id}_label">
      <div class="tradeoff-title" id="${id}_label">Resource–capability trade-off</div>
      <p class="tradeoff-prompt">For this question, imagine that both options are permitted and you can choose between a simpler digital option requiring fewer computing resources and a more capable AI option requiring more computing resources. The more capable option may provide a better or more tailored result. Which would you prefer for this task?</p>
      <div class="tradeoff-head"><span>Simpler option<br><small>fewer computing resources</small></span><span>More capable AI<br><small>more computing resources</small></span></div>
      <input class="survey-range tradeoff-range" id="${id}" data-scale="7" data-answered="${answered ? "true" : "false"}" data-labels="${escapeHTML(JSON.stringify(tradeoffLabels))}" type="range" min="1" max="7" step="1" value="${current}" aria-label="Preference between a simpler lower-resource option and a more capable higher-resource AI option">
      ${positionedTickRow(7)}
      <output id="${id}_output" class="range-output ${answered ? "answered" : ""}">${escapeHTML(selectedLabel)}</output>
      <div class="tradeoff-anchor"><span>Strongly prefer simpler option</span><span>Neutral / depends</span><span>Strongly prefer more capable AI</span></div>
    </section>`;
  }

  function labelsFromInput(input) {
    try {
      const labels = JSON.parse(input.dataset.labels || "[]");
      return Array.isArray(labels) ? labels : [];
    } catch (_) { return []; }
  }

  function bindTradeoffSlider(id) {
    const input = document.getElementById(id), output = document.getElementById(`${id}_output`);
    if (!input || !output) return;
    const labels = labelsFromInput(input);
    const update = () => {
      input.dataset.answered = "true";
      output.textContent = labels[Number(input.value) - 1] || input.value;
      output.classList.add("answered");
      maybeClearValidation(input);
    };
    input.addEventListener("input", update);
    input.addEventListener("change", update);
    input.addEventListener("pointerdown", () => setTimeout(update, 0));
    input.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") update(); });
  }

  function bindRangeScales() {
    document.querySelectorAll('input.survey-range[data-scale="7"]:not(.tradeoff-range)').forEach(input => {
      const output = document.getElementById(`${input.id}_output`);
      const labels = labelsFromInput(input);
      const update = () => {
        input.dataset.answered = "true";
        output.textContent = labels[Number(input.value) - 1] || input.value;
        output.classList.add("answered");
        maybeClearValidation(input);
      };
      input.addEventListener("input", update);
      input.addEventListener("change", update);
      input.addEventListener("pointerdown", () => setTimeout(update, 0));
      input.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") update(); });
    });
  }

  function bindAssistanceSlider(id) {
    const input = document.getElementById(id), selected = document.getElementById(`${id}_selected`);
    if (!input || !selected) return;
    const update = () => {
      input.dataset.answered = "true";
      const level = assistanceLevels.find(x => x.value === Number(input.value));
      selected.classList.add("answered");
      selected.innerHTML = `<div><strong>${escapeHTML(level.label)}</strong><p>${escapeHTML(level.description)}</p></div>`;
      maybeClearValidation(input);
    };
    input.addEventListener("input", update);
    input.addEventListener("change", update);
    input.addEventListener("pointerdown", () => setTimeout(update, 0));
    input.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") update(); });
  }

  function bindPurposeExclusivity() {
    const boxes = [...document.querySelectorAll('input[name="purposes"]')];
    boxes.forEach(box => box.addEventListener("change", () => {
      if (!box.checked) return;
      if (box.value === "not_using") boxes.forEach(other => { if (other !== box) other.checked = false; });
      else { const none = boxes.find(x => x.value === "not_using"); if (none) none.checked = false; }
    }));
  }

  function getScaleValue(id) {
    const el = document.getElementById(id);
    if (!el || el.dataset.answered !== "true") return "";
    return el.value;
  }
  function getRadioValue(name) { return document.querySelector(`input[name="${CSS.escape(name)}"]:checked`)?.value || ""; }
  function collectValues(ids) { return Object.fromEntries(ids.map(id => [id, document.getElementById(id)?.value || ""])); }

  function resolveValidationTarget(target) {
    if (!target) return null;
    if (typeof target !== "string") return target;
    return document.getElementById(target) || document.querySelector(`[name="${CSS.escape(target)}"]`);
  }
  let activeValidationInput = null;
  function sameQuestion(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    const aName = a.getAttribute?.("name"), bName = b.getAttribute?.("name");
    if (aName && bName && aName === bName) return true;
    if ((a.id === "age" || a.id === "agePreferNot") && (b.id === "age" || b.id === "agePreferNot")) return true;
    return false;
  }
  function maybeClearValidation(changedInput) {
    if (activeValidationInput && sameQuestion(activeValidationInput, changedInput)) clearValidation();
  }
  function clearValidation() {
    const el = document.getElementById("validation");
    if (el) el.textContent = "";
    document.querySelectorAll(".validation-target").forEach(node => node.classList.remove("validation-target"));
    document.querySelectorAll(".inline-validation").forEach(node => node.remove());
    activeValidationInput = null;
  }
  function showValidation(message, target = null) {
    clearValidation();
    const el = document.getElementById("validation");
    if (el) el.textContent = message || "";
    const input = resolveValidationTarget(target);
    activeValidationInput = message ? input : null;
    if (message && input) {
      const block = input.closest(".range-block, .assistance-block, .tradeoff-block, .field, .consent-box") || input;
      block.classList.add("validation-target");
      if (block.appendChild && !["INPUT", "SELECT", "TEXTAREA"].includes(block.tagName)) {
        const inline = document.createElement("div");
        inline.className = "inline-validation";
        inline.setAttribute("role", "alert");
        inline.textContent = message;
        block.appendChild(inline);
      }
      requestAnimationFrame(() => {
        block.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => {
          try { input.focus({ preventScroll: true }); } catch (_) { try { input.focus(); } catch (_) {} }
        }, 320);
      });
    }
    return false;
  }
  function saveDraft() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {} }
  function loadDraft() { try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch (_) { return null; } }
  function downloadJSON(data) { const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `sasuf-genai-${data.study_site}-${data.session_id}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  function escapeHTML(str) { return String(str ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[c])); }
  function shuffledCopy(items) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  function fallbackUUID() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; const v = c === "x" ? r : (r & 0x3 | 0x8); return v.toString(16); }); }

  function contactHTML() {
    const contacts = Array.isArray(CONFIG.researchContacts) ? CONFIG.researchContacts : [];
    if (!contacts.length) return '<p class="field-hint">[Research contact]</p>';
    return `<div class="contacts">${contacts.map(c => `<div class="contact"><strong>${escapeHTML(c.name)}</strong>${c.affiliation ? `<span>${escapeHTML(c.affiliation)}</span>` : ""}${c.email ? `<a href="mailto:${escapeHTML(c.email)}">${escapeHTML(c.email)}</a>` : ""}</div>`).join("")}</div>`;
  }

  function scenarioSVG(kind) {
    const start = `<svg viewBox="0 0 240 220" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="12" width="216" height="196" rx="28" fill="#fff"/><circle cx="190" cy="48" r="24" fill="#f3b960" opacity=".65"/><circle cx="49" cy="178" r="31" fill="#8fd3c1" opacity=".48"/>`;
    const end = `</svg>`;
    const stroke = `fill="none" stroke="#17363d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
    const teal = `fill="#1d5a61"`, mint = `fill="#8fd3c1"`, sand = `fill="#f3b960"`;
    const parts = {
      proofread: `<rect x="63" y="46" width="112" height="135" rx="10" fill="#eaf6f2"/><path d="M82 78h70M82 100h48M82 122h62" ${stroke}/><path d="m84 150 13 13 27-32" ${stroke}/><circle cx="151" cy="149" r="17" ${sand}/><path d="m143 149 7 7 12-16" ${stroke}/>` ,
      concept: `<path d="M120 48c-31 0-51 22-51 49 0 20 11 32 24 42 7 6 10 12 10 21h34c0-9 4-15 11-21 13-10 23-22 23-42 0-27-20-49-51-49Z" fill="#fff4df" stroke="#17363d" stroke-width="5"/><path d="M103 178h34M108 191h24" ${stroke}/><circle cx="120" cy="99" r="12" ${teal}/><path d="M120 72v14M93 86l12 7M147 86l-12 7" ${stroke}/>` ,
      reading: `<rect x="56" y="60" width="96" height="116" rx="8" fill="#eaf6f2" transform="rotate(-8 56 60)"/><rect x="88" y="47" width="96" height="116" rx="8" fill="#fff4df" transform="rotate(7 88 47)"/><path d="M98 78h55M94 99h63M91 120h48" ${stroke}/><path d="M168 146c15 0 26 11 26 26M175 131c23 0 41 18 41 41" ${stroke}/>` ,
      brainstorm: `<circle cx="120" cy="93" r="43" fill="#fff4df" stroke="#17363d" stroke-width="5"/><path d="M120 46V31M78 58 67 47M162 58l11-11M65 93H49M191 93h-16" ${stroke}/><path d="M105 140h30M110 154h20" ${stroke}/><rect x="45" y="154" width="38" height="31" rx="5" ${mint}/><rect x="157" y="151" width="40" height="34" rx="5" ${sand}/>` ,
      language: `<path d="M48 62h88v66H88l-25 22v-22H48Z" fill="#eaf6f2" stroke="#17363d" stroke-width="5"/><path d="M104 102h88v62h-21v20l-23-20h-44Z" fill="#fff4df" stroke="#17363d" stroke-width="5"/><path d="M66 84h51M66 102h35M123 124h50M123 142h34" ${stroke}/>` ,
      sources: `<rect x="48" y="55" width="116" height="116" rx="12" fill="#eaf6f2" stroke="#17363d" stroke-width="5"/><path d="M70 82h70M70 104h55M70 126h62" ${stroke}/><circle cx="159" cy="142" r="27" fill="#fff4df" stroke="#17363d" stroke-width="5"/><path d="m179 162 23 23" ${stroke}/><path d="M150 142h18M159 133v18" ${stroke}/>` ,
      organise: `<rect x="49" y="52" width="52" height="43" rx="7" ${mint}/><rect x="139" y="53" width="52" height="43" rx="7" ${sand}/><rect x="94" y="145" width="52" height="43" rx="7" ${teal}/><path d="M75 96v24h45M165 96v24h-45M120 120v24" ${stroke}/><circle cx="120" cy="120" r="8" fill="#fff" stroke="#17363d" stroke-width="5"/>` ,
      feedback: `<rect x="52" y="45" width="112" height="136" rx="10" fill="#eaf6f2" stroke="#17363d" stroke-width="5"/><path d="M74 76h66M74 98h48M74 120h61" ${stroke}/><path d="M151 130l34-34 16 16-34 34-24 8Z" fill="#fff4df" stroke="#17363d" stroke-width="5"/><path d="m185 96 16 16" ${stroke}/>` ,
      assessed: `<rect x="61" y="42" width="118" height="143" rx="10" fill="#eaf6f2" stroke="#17363d" stroke-width="5"/><path d="M82 73h55M82 95h76M82 117h58" ${stroke}/><rect x="117" y="131" width="48" height="36" rx="7" fill="#fff4df" stroke="#17363d" stroke-width="5"/><path d="M129 131v-9c0-10 7-18 12-18s12 8 12 18v9" ${stroke}/>` ,
      data: `<path d="M55 168V62M55 168h132" ${stroke}/><rect x="76" y="122" width="22" height="46" rx="4" ${mint}/><rect x="112" y="94" width="22" height="74" rx="4" ${sand}/><rect x="148" y="70" width="22" height="98" rx="4" ${teal}/><path d="m72 102 32-23 31 11 43-35" ${stroke}/><circle cx="72" cy="102" r="6" fill="#fff" stroke="#17363d" stroke-width="4"/><circle cx="104" cy="79" r="6" fill="#fff" stroke="#17363d" stroke-width="4"/><circle cx="135" cy="90" r="6" fill="#fff" stroke="#17363d" stroke-width="4"/><circle cx="178" cy="55" r="6" fill="#fff" stroke="#17363d" stroke-width="4"/>`
    };
    return start + (parts[kind] || parts.concept) + end;
  }
})();
