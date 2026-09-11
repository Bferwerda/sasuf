(() => {
  "use strict";

  const CONFIG = window.STUDY_CONFIG || {};
  const STUDY_SITE = String(CONFIG.studySite || "").toUpperCase();
  const STORAGE_KEY = `genai-green-draft-${STUDY_SITE || "UNKNOWN"}-${CONFIG.studyVersion || "v4"}`;

  const scenarios = [
    {
      id: "proofreading",
      title: "Proofreading your own text",
      text: "You have written a short piece of coursework yourself. Before submitting it, you are considering using Generative AI to identify grammar, spelling and clarity problems in your text.",
      art: "proofread"
    },
    {
      id: "concept_explanation",
      title: "Understanding a difficult concept",
      text: "You encounter a concept in one of your courses that you do not fully understand. You are considering asking Generative AI to explain the concept in simpler language and provide an example.",
      art: "concept"
    },
    {
      id: "reading_summary",
      title: "Working through an academic reading",
      text: "You have been assigned a long academic article for one of your courses and need to understand its main arguments before your next class. You are considering using Generative AI to help summarise and structure the article.",
      art: "reading"
    },
    {
      id: "brainstorming",
      title: "Brainstorming ideas",
      text: "You are at the beginning of an assignment and need possible directions or ideas to explore. You are considering using Generative AI to generate a range of starting points before developing the work yourself.",
      art: "brainstorm"
    },
    {
      id: "language_support",
      title: "Language support",
      text: "You understand the topic of an academic text, but some of the language makes it difficult to follow. You are considering using Generative AI to translate or rephrase parts of the text in a language or form that is easier for you to understand.",
      art: "language"
    },
    {
      id: "factual_information",
      title: "Finding straightforward factual information",
      text: "You need a straightforward factual answer for your coursework, such as the meaning of a term, a date, or a basic definition. The information could also be found using a conventional web search or reference source. You are considering asking Generative AI instead.",
      art: "search"
    },
    {
      id: "organising_information",
      title: "Organising information",
      text: "You have collected notes and information for an assignment and need to organise them into themes or categories. You are considering using Generative AI to suggest an initial structure that you would then review and revise yourself.",
      art: "organise"
    },
    {
      id: "assessed_writing",
      title: "Drafting assessed work",
      text: "You need to write part of an assessed assignment. You are considering asking Generative AI to produce a first draft, which you would then edit and adapt before submitting the work.",
      art: "assessed"
    }
  ];

  const scenarioMeasures = [
    { key: "likelihood", text: "How likely would you be to use GenAI in this situation?", left: "Very unlikely", right: "Very likely" },
    { key: "appropriate", text: "How appropriate do you think using GenAI would be in this situation?", left: "Very inappropriate", right: "Very appropriate" },
    { key: "value", text: "GenAI would add meaningful value in this situation.", left: "Strongly disagree", right: "Strongly agree" },
    { key: "alternative", text: "An adequate non-GenAI alternative is available for this situation.", left: "Strongly disagree", right: "Strongly agree" },
    { key: "learning", text: "Using GenAI here would support my learning rather than replace it.", left: "Strongly disagree", right: "Strongly agree" },
    { key: "resource_concern", text: "The computing and environmental resources required by GenAI would matter to my decision in this situation.", left: "Strongly disagree", right: "Strongly agree" }
  ];

  const reasonOptions = [
    ["time", "Time or convenience"],
    ["quality", "Expected quality"],
    ["learning", "Learning or understanding"],
    ["language", "Language or accessibility support"],
    ["alternative", "Availability of other tools or options"],
    ["cost_access", "Cost, internet or access"],
    ["integrity", "Academic rules or integrity"],
    ["privacy", "Privacy or sensitive information"],
    ["sustainability", "Computing / environmental resources"],
    ["habit", "Habit or familiarity"]
  ];

  const steps = [
    { type: "consent", title: "About the study" },
    { type: "context", title: "About you and your study context" },
    { type: "baseline", title: "Your current GenAI use" },
    ...scenarios.map((s, index) => ({ type: "scenario", title: s.title, scenario: s, scenarioNumber: index + 1 })),
    { type: "reflection", title: "Final reflections" },
    { type: "submit", title: "Submit your responses" }
  ];

  const state = loadDraft() || {
    sessionId: crypto.randomUUID ? crypto.randomUUID() : fallbackUUID(),
    studyVersion: CONFIG.studyVersion || "2026-09-v4",
    startedAt: null,
    currentStep: 0,
    consent: {},
    context: {},
    baseline: {},
    scenarios: {},
    reflection: {},
    scenarioOrder: scenarios.map(s => s.id)
  };

  // Migrate in case a prior draft exists with missing fields.
  state.scenarios ||= {};
  state.context ||= {};
  state.baseline ||= {};
  state.reflection ||= {};
  state.scenarioOrder ||= scenarios.map(s => s.id);

  const hero = document.getElementById("hero");
  const panel = document.getElementById("studyPanel");
  const screen = document.getElementById("screen");
  const startBtn = document.getElementById("startBtn");
  const saveExitBtn = document.getElementById("saveExitBtn");
  const brandHome = document.getElementById("brandHome");
  const progressLabel = document.getElementById("progressLabel");
  const progressPercent = document.getElementById("progressPercent");
  const progressBar = document.getElementById("progressBar");

  if (!['SE', 'SA'].includes(STUDY_SITE)) {
    document.body.innerHTML = '<main style="max-width:760px;margin:80px auto;padding:24px;font-family:system-ui"><h1>Study configuration error</h1><p>This survey entry point is missing a valid study site.</p></main>';
    throw new Error('Invalid or missing studySite in config.js');
  }

  const siteName = STUDY_SITE === 'SE' ? 'Sweden' : 'South Africa';
  document.querySelectorAll('[data-site-label]').forEach(el => { el.textContent = `${siteName} study`; });
  document.querySelectorAll('[data-site-name]').forEach(el => { el.textContent = siteName; });

  const hasDraft = Boolean(state.startedAt);
  if (hasDraft) {
    startBtn.textContent = "Continue saved study →";
  }

  startBtn.addEventListener("click", () => {
    state.startedAt ||= new Date().toISOString();
    saveDraft();
    hero.classList.add("hidden");
    panel.classList.remove("hidden");
    saveExitBtn.classList.remove("hidden");
    renderStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  saveExitBtn.addEventListener("click", () => {
    saveCurrentForm(false);
    saveDraft();
    panel.classList.add("hidden");
    saveExitBtn.classList.add("hidden");
    hero.classList.remove("hidden");
    startBtn.textContent = "Continue saved study →";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  brandHome.addEventListener("click", (e) => {
    e.preventDefault();
    if (!panel.classList.contains("hidden")) saveCurrentForm(false);
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
    else if (step.type === "baseline") renderBaseline();
    else if (step.type === "scenario") renderScenario(step);
    else if (step.type === "reflection") renderReflection();
    else if (step.type === "submit") renderSubmit();
  }

  function renderConsent() {
    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">Participant information</span>
        <h2>About the study</h2>
        <p class="screen-intro">We are studying how university students in Sweden and South Africa decide when Generative AI is useful and appropriate for academic tasks. The same survey and scenarios are used across both contexts; there are no experimental conditions.</p>
        <ul class="consent-list">
          <li>Participation is voluntary and you may stop before submitting.</li>
          <li>The survey takes approximately 12–15 minutes.</li>
          <li>We do not ask for your name or email address.</li>
          <li>Your responses may be used in research publications and to inform a co-design workshop in South Africa.</li>
          <li>Only aggregated or anonymised findings will be reported.</li>
        </ul>
        <div class="notice warning">
          <strong>Before live recruitment:</strong> replace all bracketed researcher, ethics and storage placeholders in <code>config.js</code> with your institution-approved text.
        </div>
        <div class="field">
          <div class="field-label">Research contact</div>
          <div>${escapeHTML(CONFIG.researcherName || "[Researcher name]")} · ${escapeHTML(CONFIG.researcherEmail || "[researcher email]")}</div>
        </div>
        <div class="field">
          <div class="field-label">Ethics reference</div>
          <div>${escapeHTML(CONFIG.ethicsReference || "[Ethics reference]")}</div>
        </div>
        <div class="field">
          <div class="field-label">Data storage and privacy</div>
          <div class="field-hint">${escapeHTML(CONFIG.privacyText || "[Insert institution-approved privacy/data-storage statement]")}</div>
        </div>
        <div class="consent-box">
          <label class="checkbox-choice">
            <input type="checkbox" id="consentCheck" ${state.consent.agreed ? "checked" : ""}>
            <span>I have read the information above, I am at least 18 years old, and I voluntarily agree to participate.</span>
          </label>
        </div>
        <div id="validation" class="validation"></div>
        ${navButtons(false, "Continue")}
      </article>`;
    bindNav(() => {
      const agreed = document.getElementById("consentCheck").checked;
      if (!agreed) return showValidation("Please confirm your consent before continuing.");
      state.consent = { agreed: true, timestamp: new Date().toISOString() };
      return true;
    });
  }

  function renderContext() {
    const c = state.context;
    const institutions = Array.isArray(CONFIG.institutions) && CONFIG.institutions.length
      ? CONFIG.institutions
      : (STUDY_SITE === 'SE'
          ? ['Jönköping University', 'University of Gothenburg', 'Other']
          : ['University of Fort Hare', 'Walter Sisulu University', 'Other']);
    const institutionOptions = [['', 'Select…'], ...institutions.map(name => [name, name])];

    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">Study context · ${escapeHTML(siteName)}</span>
        <h2>About you and your studies</h2>
        <p class="screen-intro">This entry point is fixed to the <strong>${escapeHTML(siteName)}</strong> study. These questions let us compare patterns across higher-education contexts without asking you to select a country.</p>

        ${selectField("institution", "Current institution", institutionOptions, c.institution)}

        ${selectField("studyLevel", "Current study level", [
          ["", "Select…"], ["Bachelor", "Bachelor's / undergraduate"], ["Master", "Master's / postgraduate taught"], ["Doctoral", "Doctoral / PhD"], ["Other", "Other"]
        ], c.studyLevel)}

        ${selectField("discipline", "Broad field of study", [
          ["", "Select…"], ["Computing", "Computer science / IT / engineering"], ["Business", "Business / economics / management"], ["Education", "Education"], ["Health", "Health / medicine"], ["Humanities", "Humanities / languages"], ["Social Sciences", "Social sciences"], ["Natural Sciences", "Natural sciences"], ["Other", "Other"]
        ], c.discipline)}

        ${selectField("languageComfort", "How comfortable are you studying in the main language used in your programme?", [
          ["", "Select…"], ["1", "1 — Not at all comfortable"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7 — Very comfortable"]
        ], c.languageComfort)}

        <div id="validation" class="validation"></div>
        ${navButtons(true, "Continue")}
      </article>`;
    bindNav(() => {
      const required = ["institution", "studyLevel", "discipline", "languageComfort"];
      if (required.some(id => !document.getElementById(id).value)) return showValidation("Please answer all questions on this page.");
      state.context = collectValues(required);
      state.context.studySite = STUDY_SITE;
      return true;
    });
  }

  function renderBaseline() {
    const b = state.baseline;
    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">Current practice</span>
        <h2>Your current GenAI use</h2>
        <p class="screen-intro">Think about tools such as ChatGPT, Gemini, Copilot, Claude or other systems that generate text, images, code or explanations.</p>

        ${selectField("useFrequency", "How often do you currently use Generative AI for your studies?", [
          ["", "Select…"], ["Never", "Never"], ["Less than monthly", "Less than once a month"], ["Monthly", "A few times a month"], ["Weekly", "A few times a week"], ["Daily", "Daily or almost daily"]
        ], b.useFrequency)}

        ${yesNoUnsure("paidAccess", "Do you currently have access to a paid/premium GenAI service?", b.paidAccess)}
        ${yesNoUnsure("guidance", "Has your institution or programme given you clear guidance about acceptable GenAI use?", b.guidance)}
        ${yesNoUnsure("resourceAwareness", "Before this survey, were you aware that different digital tools can require substantially different amounts of computing resources?", b.resourceAwareness)}

        ${likert("internetAccess", "I have reliable enough internet access to use GenAI when I want to.", b.internetAccess, "Strongly disagree", "Strongly agree")}
        ${likert("aiConfidence", "I feel confident deciding when GenAI is appropriate for an academic task.", b.aiConfidence, "Strongly disagree", "Strongly agree")}
        ${likert("aiLiteracy", "I understand the main limitations and risks of using GenAI for academic work.", b.aiLiteracy, "Strongly disagree", "Strongly agree")}
        ${likert("sustainabilityImportance", "The environmental and computing-resource implications of digital tools are important to me.", b.sustainabilityImportance, "Strongly disagree", "Strongly agree")}

        <div id="validation" class="validation"></div>
        ${navButtons(true, "Continue to scenarios")}
      </article>`;
    bindNav(() => {
      const ids = ["useFrequency", "paidAccess", "guidance", "resourceAwareness", "internetAccess", "aiConfidence", "aiLiteracy", "sustainabilityImportance"];
      if (ids.some(id => !getValue(id))) return showValidation("Please answer all questions on this page.");
      state.baseline = Object.fromEntries(ids.map(id => [id, getValue(id)]));
      return true;
    });
  }

  function renderScenario(step) {
    const s = step.scenario;
    const saved = state.scenarios[s.id] || {};
    screen.innerHTML = `
      <article class="screen-card">
        <div class="scenario-layout">
          <aside class="scenario-art" aria-hidden="true">${scenarioSVG(s.art)}</aside>
          <div>
            <div class="scenario-number">${step.scenarioNumber} / ${scenarios.length}</div>
            <h2>${escapeHTML(s.title)}</h2>
            <p class="scenario-text">${escapeHTML(s.text)}</p>

            ${scenarioMeasures.map(m => likert(`${s.id}_${m.key}`, m.text, saved[m.key], m.left, m.right)).join("")}

            <div class="field scenario-question">
              <div class="field-label">Which considerations would matter most to your decision?</div>
              <div class="field-hint">Select up to three.</div>
              <div class="choice-grid">
                ${reasonOptions.map(([value,label]) => `
                  <label class="checkbox-choice"><input type="checkbox" name="${s.id}_reasons" value="${value}" ${saved.reasons?.includes(value) ? "checked" : ""}><span>${escapeHTML(label)}</span></label>`).join("")}
              </div>
            </div>
            <div class="field">
              <label for="${s.id}_comment">Anything else about your decision? <span class="field-hint">(optional)</span></label>
              <textarea id="${s.id}_comment" maxlength="800">${escapeHTML(saved.comment || "")}</textarea>
            </div>
            <div id="validation" class="validation"></div>
            ${navButtons(true, step.scenarioNumber === scenarios.length ? "Continue" : "Next scenario")}
          </div>
        </div>
      </article>`;

    const boxes = [...document.querySelectorAll(`input[name="${s.id}_reasons"]`)];
    boxes.forEach(box => box.addEventListener("change", () => {
      const checked = boxes.filter(b => b.checked);
      if (checked.length > 3) {
        box.checked = false;
        showValidation("Please select no more than three considerations.");
      } else {
        showValidation("");
      }
    }));

    bindNav(() => {
      const answers = {};
      for (const m of scenarioMeasures) {
        const v = getValue(`${s.id}_${m.key}`);
        if (!v) return showValidation("Please complete all six rating questions before continuing.");
        answers[m.key] = v;
      }
      const reasons = boxes.filter(b => b.checked).map(b => b.value);
      if (reasons.length === 0) return showValidation("Please select at least one consideration that matters to your decision.");
      answers.reasons = reasons;
      answers.comment = document.getElementById(`${s.id}_comment`).value.trim();
      state.scenarios[s.id] = answers;
      return true;
    });
  }

  function renderReflection() {
    const r = state.reflection;
    screen.innerHTML = `
      <article class="screen-card">
        <span class="eyebrow">Final reflections</span>
        <h2>When is GenAI worth using?</h2>
        <p class="screen-intro">There are no right or wrong answers. We are interested in the principles you personally use when deciding.</p>

        <div class="field">
          <label for="worthUsing">In what kinds of academic situations do you think using GenAI is particularly valuable or justified?</label>
          <textarea id="worthUsing" maxlength="1500">${escapeHTML(r.worthUsing || "")}</textarea>
        </div>
        <div class="field">
          <label for="avoidUsing">In what kinds of academic situations do you think students should avoid or reconsider using GenAI?</label>
          <textarea id="avoidUsing" maxlength="1500">${escapeHTML(r.avoidUsing || "")}</textarea>
        </div>
        <div class="field">
          <label for="guidanceWanted">What guidance or support would help you make better decisions about GenAI use? <span class="field-hint">(optional)</span></label>
          <textarea id="guidanceWanted" maxlength="1500">${escapeHTML(r.guidanceWanted || "")}</textarea>
        </div>
        <div id="validation" class="validation"></div>
        ${navButtons(true, "Review & submit")}
      </article>`;
    bindNav(() => {
      const worth = document.getElementById("worthUsing").value.trim();
      const avoid = document.getElementById("avoidUsing").value.trim();
      if (!worth || !avoid) return showValidation("Please answer the first two reflection questions.");
      state.reflection = {
        worthUsing: worth,
        avoidUsing: avoid,
        guidanceWanted: document.getElementById("guidanceWanted").value.trim()
      };
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
        <div class="notice ${configured ? "" : "warning"}">
          ${configured
            ? `<strong>Live storage is configured.</strong> When you submit, the response will be sent over HTTPS to the study database. Your temporary browser draft will then be deleted.`
            : `<strong>Demo mode:</strong> no remote database is configured, so nothing will be uploaded. Clicking submit will create a local JSON download for testing only.`}
        </div>
        <div class="field">
          <div class="field-label">Anonymous study code</div>
          <div class="completion-code">${escapeHTML(state.sessionId)}</div>
          <div class="field-hint">This randomly generated code is used to distinguish responses. It is not based on your name or email.</div>
        </div>
        <div id="validation" class="validation"></div>
        <div class="actions">
          <button class="secondary-button" id="backBtn" type="button">← Back</button>
          <div class="right"><button class="primary-button" id="submitBtn" type="button">${configured ? "Submit responses" : "Finish demo & download JSON"}</button></div>
        </div>
      </article>`;

    document.getElementById("backBtn").addEventListener("click", () => goBack());
    document.getElementById("submitBtn").addEventListener("click", submitStudy);
  }

  async function submitStudy() {
    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.textContent = "Submitting…";
    showValidation("");

    const payload = buildPayload();

    try {
      if (backendConfigured()) {
        await submitToBackend(payload);
        localStorage.removeItem(STORAGE_KEY);
        renderCompletion(true);
      } else {
        downloadJSON(payload);
        localStorage.removeItem(STORAGE_KEY);
        renderCompletion(false);
      }
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.textContent = "Try again";
      showValidation("The response could not be submitted. Your answers are still saved on this device. Please check your connection and try again.");
    }
  }

  function renderCompletion(live) {
    progressBar.style.width = "100%";
    progressPercent.textContent = "100%";
    progressLabel.textContent = "Complete";
    saveExitBtn.classList.add("hidden");
    screen.innerHTML = `
      <article class="screen-card">
        <div class="completion">
          <div class="completion-icon">✓</div>
          <h2>Thank you</h2>
          <p class="screen-intro" style="margin-left:auto;margin-right:auto">Your participation helps us understand how students in different higher-education contexts make decisions about GenAI use.</p>
          <div class="completion-code">${escapeHTML(state.sessionId)}</div>
          <div class="notice storage-status">
            ${live
              ? `<strong>Response saved.</strong> The study response was accepted by the configured research database. The temporary browser draft has been removed.`
              : `<strong>Demo completed.</strong> A JSON copy was downloaded to this device. No response was sent to a research database because remote storage has not yet been configured.`}
          </div>
        </div>
      </article>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildPayload() {
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
        submitted_at_client: new Date().toISOString(),
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

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    let responseBody = null;
    try { responseBody = await res.json(); } catch (_) {}

    if (!res.ok || !responseBody?.ok) {
      const detail = responseBody?.error || `HTTP ${res.status}`;
      throw new Error(`Storage failed: ${detail}`);
    }
  }

  function backendConfigured() {
    return Boolean(String(CONFIG.submissionEndpoint || "").trim());
  }

  function bindNav(validateAndSave) {
    const back = document.getElementById("backBtn");
    const next = document.getElementById("nextBtn");
    if (back) back.addEventListener("click", goBack);
    if (next) next.addEventListener("click", () => {
      if (validateAndSave() === true) {
        state.currentStep += 1;
        saveDraft();
        renderStep();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  function goBack() {
    saveCurrentForm(false);
    state.currentStep = Math.max(0, state.currentStep - 1);
    saveDraft();
    renderStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveCurrentForm(strict) {
    // Best-effort draft save when leaving a page. Validation remains on Continue.
    const step = steps[state.currentStep];
    try {
      if (step.type === "context") {
        state.context = collectValues(["institution", "studyLevel", "discipline", "languageComfort"]);
        state.context.studySite = STUDY_SITE;
      } else if (step.type === "baseline") {
        const ids = ["useFrequency", "paidAccess", "guidance", "resourceAwareness", "internetAccess", "aiConfidence", "aiLiteracy", "sustainabilityImportance"];
        state.baseline = Object.fromEntries(ids.map(id => [id, getValue(id)]));
      } else if (step.type === "scenario") {
        const s = step.scenario;
        const answers = {};
        for (const m of scenarioMeasures) answers[m.key] = getValue(`${s.id}_${m.key}`) || "";
        answers.reasons = [...document.querySelectorAll(`input[name="${s.id}_reasons"]:checked`)].map(b => b.value);
        answers.comment = document.getElementById(`${s.id}_comment`)?.value.trim() || "";
        state.scenarios[s.id] = answers;
      } else if (step.type === "reflection") {
        state.reflection = {
          worthUsing: document.getElementById("worthUsing")?.value.trim() || "",
          avoidUsing: document.getElementById("avoidUsing")?.value.trim() || "",
          guidanceWanted: document.getElementById("guidanceWanted")?.value.trim() || ""
        };
      }
      if (!strict) saveDraft();
    } catch (_) {}
  }

  function navButtons(showBack, nextText) {
    return `<div class="actions">
      ${showBack ? `<button class="secondary-button" id="backBtn" type="button">← Back</button>` : `<span></span>`}
      <div class="right"><button class="primary-button" id="nextBtn" type="button">${escapeHTML(nextText)} →</button></div>
    </div>`;
  }

  function selectField(id, label, options, value = "") {
    return `<div class="field"><label for="${id}">${escapeHTML(label)}</label><select id="${id}">${options.map(([v,l]) => `<option value="${escapeHTML(v)}" ${String(value) === String(v) ? "selected" : ""}>${escapeHTML(l)}</option>`).join("")}</select></div>`;
  }

  function yesNoUnsure(id, label, value = "") {
    return `<div class="field"><div class="field-label">${escapeHTML(label)}</div><div class="choice-grid">
      ${[["Yes","Yes"],["No","No"],["Unsure","Not sure"]].map(([v,l]) => `<label class="choice"><input type="radio" name="${id}" value="${v}" ${String(value)===v?"checked":""}><span>${l}</span></label>`).join("")}
    </div></div>`;
  }

  function likert(id, label, value = "", left = "Strongly disagree", right = "Strongly agree") {
    return `<div class="likert-block">
      <div class="likert-label">${escapeHTML(label)}</div>
      <div class="likert-scale" role="radiogroup" aria-label="${escapeHTML(label)}">
        ${[1,2,3,4,5,6,7].map(n => `<div class="likert-option"><input id="${id}_${n}" type="radio" name="${id}" value="${n}" ${String(value)===String(n)?"checked":""}><label for="${id}_${n}">${n}</label></div>`).join("")}
      </div>
      <div class="likert-anchors"><span>${escapeHTML(left)}</span><span>${escapeHTML(right)}</span></div>
    </div>`;
  }

  function getValue(id) {
    const el = document.getElementById(id);
    if (el && (el.tagName === "SELECT" || el.tagName === "TEXTAREA" || el.tagName === "INPUT" && el.type === "text")) return el.value;
    const checked = document.querySelector(`input[name="${CSS.escape(id)}"]:checked`);
    return checked ? checked.value : "";
  }

  function collectValues(ids) {
    return Object.fromEntries(ids.map(id => [id, document.getElementById(id)?.value || ""]));
  }

  function showValidation(message) {
    const el = document.getElementById("validation");
    if (el) el.textContent = message || "";
    return false;
  }

  function saveDraft() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  function downloadJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `genai-study-${data.session_id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function escapeHTML(str) {
    return String(str ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[c]));
  }

  function fallbackUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function scenarioSVG(kind) {
    const commonStart = `<svg viewBox="0 0 240 220" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="12" width="216" height="196" rx="28" fill="#fff"/><circle cx="190" cy="48" r="24" fill="#f3b960" opacity=".65"/><circle cx="49" cy="178" r="31" fill="#8fd3c1" opacity=".48"/>`;
    const commonEnd = `</svg>`;
    const stroke = `fill="none" stroke="#17363d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
    const teal = `fill="#1d5a61"`;
    const mint = `fill="#8fd3c1"`;
    const sand = `fill="#f3b960"`;
    const parts = {
      proofread: `<rect x="63" y="46" width="112" height="135" rx="10" fill="#eaf6f2"/><path d="M82 78h70M82 100h48M82 122h62" ${stroke}/><path d="m84 150 13 13 27-32" ${stroke}/><circle cx="151" cy="149" r="17" ${sand}/><path d="m143 149 7 7 12-16" ${stroke}/>`,
      concept: `<path d="M120 48c-31 0-51 22-51 49 0 20 11 32 24 42 7 6 10 12 10 21h34c0-9 4-15 11-21 13-10 23-22 23-42 0-27-20-49-51-49Z" fill="#fff4df" stroke="#17363d" stroke-width="5"/><path d="M103 178h34M108 191h24" ${stroke}/><circle cx="120" cy="99" r="12" ${teal}/><path d="M120 72v14M93 86l12 7M147 86l-12 7" ${stroke}/>` ,
      reading: `<rect x="56" y="60" width="96" height="116" rx="8" fill="#eaf6f2" transform="rotate(-8 56 60)"/><rect x="88" y="47" width="96" height="116" rx="8" fill="#fff4df" transform="rotate(7 88 47)"/><path d="M98 78h55M94 99h63M91 120h48" ${stroke}/><path d="M168 146c15 0 26 11 26 26M175 131c23 0 41 18 41 41" ${stroke}/>` ,
      brainstorm: `<circle cx="120" cy="93" r="43" fill="#fff4df" stroke="#17363d" stroke-width="5"/><path d="M120 46V31M78 58 67 47M162 58l11-11M65 93H49M191 93h-16" ${stroke}/><path d="M105 140h30M110 154h20" ${stroke}/><rect x="45" y="154" width="38" height="31" rx="5" ${mint}/><rect x="157" y="151" width="40" height="34" rx="5" ${sand}/>` ,
      language: `<path d="M48 62h88v66H88l-25 22v-22H48Z" fill="#eaf6f2" stroke="#17363d" stroke-width="5"/><path d="M104 102h88v62h-21v20l-23-20h-44Z" fill="#fff4df" stroke="#17363d" stroke-width="5"/><path d="M66 84h51M66 102h35M123 124h50M123 142h34" ${stroke}/>` ,
      search: `<circle cx="103" cy="100" r="48" fill="#eaf6f2" stroke="#17363d" stroke-width="5"/><path d="m138 136 35 35" ${stroke}/><path d="M68 100h70M103 64c15 16 15 56 0 72M103 64c-15 16-15 56 0 72M66 85h74M66 115h74" ${stroke}/>` ,
      organise: `<rect x="49" y="52" width="52" height="43" rx="7" ${mint}/><rect x="139" y="53" width="52" height="43" rx="7" ${sand}/><rect x="94" y="145" width="52" height="43" rx="7" ${teal}/><path d="M75 96v24h45M165 96v24h-45M120 120v24" ${stroke}/><circle cx="120" cy="120" r="8" fill="#fff" stroke="#17363d" stroke-width="5"/>` ,
      assessed: `<rect x="61" y="42" width="118" height="143" rx="10" fill="#eaf6f2" stroke="#17363d" stroke-width="5"/><path d="M82 73h55M82 95h76M82 117h58" ${stroke}/><rect x="117" y="131" width="48" height="36" rx="7" fill="#fff4df" stroke="#17363d" stroke-width="5"/><path d="M129 131v-9c0-10 7-18 12-18s12 8 12 18v9" ${stroke}/>`
    };
    return commonStart + (parts[kind] || parts.concept) + commonEnd;
  }
})();
