/**
 * CA DROP Delete Clock — paste (1) California resident? yes/no,
 * (2) DROP request submit date OR “not submitted”, (3) view date →
 * eligible to file / waiting for broker cycle / inside 45-day processing window /
 * up-to-90-day status lag / not CA-eligible share card.
 * Brand: CA DROP Delete Clock only. User paste only — no DROP account scrape.
 * Never ask SSN. Never invent broker Deleted/Exempted/Not found status.
 * Not legal advice. Official DROP only / not a paid removal service.
 * Pointer: privacy.ca.gov/drop only.
 */
(function () {
  "use strict";

  const DROP_URL = "https://privacy.ca.gov/drop/";
  const CPPA_BROKERS = "https://cppa.ca.gov/data_brokers/";
  const DROP_BROKER_PROCESS =
    "https://privacy.ca.gov/drop-for-data-brokers/process-drop-requests/";

  const AUG1_ISO = "2026-08-01";
  const AUG1_LABEL = "Aug 1 2026";
  const NOV_ISO = "2026-11-01";
  const NOV_LABEL = "November 2026";
  const CYCLE_45 = 45;
  const LAG_90 = 90;

  const CITE_ONE_LINER =
    "privacy.ca.gov/drop: free CA-resident tool to send one deletion request to 600+ registered data brokers; Jan 1 2026 launch; Aug 1 2026 brokers begin processing and must access DROP at least once every 45 days; status updates may take up to 90 days; November 2026 — all brokers should have completed initial download/upload cycle. CPPA / Civ. Code 1798.99.86(c): beginning Aug 1 2026 data brokers must access the accessible deletion mechanism ≥ every 45 days. Literacy only — not legal advice.";

  const DISCLAIMER_SHORT =
    "Not legal advice · official DROP only / not a paid removal service · CA residents only · we never submit on your behalf · never invent broker Deleted/Exempted/Not found status";

  /** Teaching seeds — labeled. Not live DROP scrapes. */
  const SEEDS = [
    {
      id: "ca-mar-aug",
      label: "CA · Mar submit / Aug processing",
      sub: "Teaching · Mar 15 submit · Aug 15 view · inside 45-day",
      caResident: "yes",
      submitStatus: "submitted",
      submitDate: "2026-03-15",
      viewDate: "2026-08-15",
      noteLabel: "Mar submit · Aug processing teaching seed",
    },
    {
      id: "not-submitted",
      label: "Not submitted · eligible to file",
      sub: "Teaching · CA resident · no DROP request yet",
      caResident: "yes",
      submitStatus: "not_submitted",
      submitDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Not-submitted teaching seed",
    },
    {
      id: "non-ca",
      label: "Non-CA · not eligible",
      sub: "Teaching · DROP is CA residents only",
      caResident: "no",
      submitStatus: "not_submitted",
      submitDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Non-CA teaching seed",
    },
    {
      id: "past-90",
      label: "Past 90-day status lag",
      sub: "Teaching · Mar submit · Nov 15 view · past 90",
      caResident: "yes",
      submitStatus: "submitted",
      submitDate: "2026-03-15",
      viewDate: "2026-11-15",
      noteLabel: "Past-90-day-lag teaching seed",
    },
    {
      id: "nov-milestone",
      label: "Nov milestone view",
      sub: "Teaching · Mar submit · Nov 1 view · first full cycle",
      caResident: "yes",
      submitStatus: "submitted",
      submitDate: "2026-03-15",
      viewDate: "2026-11-01",
      noteLabel: "Nov-milestone teaching seed",
    },
    {
      id: "empty-miss",
      label: "Empty / missing dates",
      sub: "Teaching · submitted · blank date → honest miss",
      caResident: "yes",
      submitStatus: "submitted",
      submitDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Honest-miss teaching seed",
    },
  ];

  const $ = (id) => document.getElementById(id);

  function parseISODate(s) {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const parts = s.split("-").map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (
      d.getFullYear() !== parts[0] ||
      d.getMonth() !== parts[1] - 1 ||
      d.getDate() !== parts[2]
    ) {
      return null;
    }
    return d;
  }

  function fmtDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function isoFromDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function todayISO() {
    return isoFromDate(new Date());
  }

  function addDays(date, n) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  /** Whole calendar days from a → b (local). Positive if b is after a. */
  function daysBetween(a, b) {
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((ub - ua) / 86400000);
  }

  function laterDate(a, b) {
    if (!a) return b;
    if (!b) return a;
    return a.getTime() >= b.getTime() ? a : b;
  }

  function novDaysLeft(viewDate) {
    const nov = parseISODate(NOV_ISO);
    if (!viewDate || !nov) return null;
    return daysBetween(viewDate, nov);
  }

  function aug1DaysLeft(viewDate) {
    const aug = parseISODate(AUG1_ISO);
    if (!viewDate || !aug) return null;
    return daysBetween(viewDate, aug);
  }

  /**
   * Phases (text-primary status):
   * not_ca | eligible | waiting_broker | inside_45 | status_lag
   */
  function statusMeta(phase, daysSince, processingStart) {
    if (phase === "not_ca") {
      return {
        phase: "not_ca",
        pill: "not CA-eligible",
        cls: "danger",
        sub: "DROP is for California residents only",
        ringLabel: "N/A",
        daysLabel: "not CA-eligible",
        headline: "Not CA-eligible for DROP",
        flag:
          "NOT CA-ELIGIBLE · California DROP is for CA residents only · we never invent eligibility · see privacy.ca.gov/drop",
      };
    }
    if (phase === "eligible") {
      return {
        phase: "eligible",
        pill: "eligible to file",
        cls: "ok",
        sub: "CA resident · no DROP request submitted yet",
        ringLabel: "FILE",
        daysLabel: "eligible to file",
        headline: "Eligible to file at privacy.ca.gov/drop",
        flag:
          "ELIGIBLE TO FILE · free official DROP at privacy.ca.gov/drop · we never submit on your behalf · not a paid removal service",
      };
    }
    if (phase === "waiting_broker") {
      return {
        phase: "waiting_broker",
        pill: "waiting for broker cycle",
        cls: "warn",
        sub: "Submitted · broker processing starts " + AUG1_LABEL,
        ringLabel: "WAIT",
        daysLabel: "waiting for broker cycle",
        headline: "Waiting for Aug 1 broker processing cycle",
        flag:
          "WAITING FOR BROKER CYCLE · you submitted before " +
          AUG1_LABEL +
          " · brokers begin processing and must access DROP ≥ every 45 days starting that date · we never invent Deleted/Exempted/Not found",
      };
    }
    if (phase === "inside_45") {
      const n = daysSince;
      return {
        phase: "inside_45",
        pill: "inside 45-day processing window",
        cls: "ok",
        sub:
          n +
          " day" +
          (n === 1 ? "" : "s") +
          " since processing start (" +
          fmtDate(processingStart) +
          ")",
        ringLabel: String(n),
        daysLabel: "inside 45-day processing window",
        headline: "Inside the 45-day broker access cycle",
        flag:
          "INSIDE 45-DAY PROCESSING WINDOW · " +
          n +
          " calendar day" +
          (n === 1 ? "" : "s") +
          " since " +
          fmtDate(processingStart) +
          " · brokers must access DROP ≥ every 45 days · status may still take up to 90 days · we never invent a broker’s status",
      };
    }
    // status_lag (daysSince >= 45)
    const n = daysSince;
    const past90 = n >= LAG_90;
    return {
      phase: "status_lag",
      pill: "up-to-90-day status lag",
      cls: past90 ? "danger" : "warn",
      sub:
        n +
        " day" +
        (n === 1 ? "" : "s") +
        " since processing start · status updates may take up to 90 days",
      ringLabel: past90 ? "90+" : String(n),
      daysLabel: "up-to-90-day status lag",
      headline: past90
        ? "Past the up-to-90-day status lag window"
        : "Inside the up-to-90-day status lag",
      flag:
        (past90
          ? "UP-TO-90-DAY STATUS LAG (past 90) · "
          : "UP-TO-90-DAY STATUS LAG · ") +
        n +
        " calendar day" +
        (n === 1 ? "" : "s") +
        " since " +
        fmtDate(processingStart) +
        " · official page: status updates may take up to 90 days · we never invent Deleted / Exempted / Not found for any broker",
    };
  }

  function validate(input) {
    const ca = input.caResident || "";
    if (ca !== "yes" && ca !== "no") {
      return "Pick whether you are a California resident (yes/no). We will not invent CA eligibility.";
    }
    if (!parseISODate(input.viewDate)) {
      return "Pick a view date (the day you’re looking) — the clock needs it. We will not invent days-since.";
    }
    if (ca === "yes" && input.submitStatus === "submitted") {
      if (!parseISODate(input.submitDate)) {
        return "You marked that you submitted a DROP request — paste the submit date. We will not invent a timeline.";
      }
    }
    return null;
  }

  function compute(input) {
    const ca = input.caResident || "";
    const submitStatus = input.submitStatus || "not_submitted";
    const viewDate = parseISODate(input.viewDate);
    const submitDate = parseISODate(input.submitDate);
    const aug1 = parseISODate(AUG1_ISO);
    const novLeft = novDaysLeft(viewDate);
    const augLeft = aug1DaysLeft(viewDate);

    let phase = "eligible";
    let processingStart = null;
    let daysSince = null;
    let daysSinceSubmit = null;

    if (ca === "no") {
      phase = "not_ca";
    } else if (submitStatus === "not_submitted") {
      phase = "eligible";
    } else if (submitStatus === "submitted" && submitDate && viewDate && aug1) {
      daysSinceSubmit = daysBetween(submitDate, viewDate);
      if (viewDate.getTime() < aug1.getTime()) {
        phase = "waiting_broker";
        processingStart = aug1;
      } else {
        processingStart = laterDate(submitDate, aug1);
        daysSince = daysBetween(processingStart, viewDate);
        if (daysSince < CYCLE_45) {
          phase = "inside_45";
        } else {
          phase = "status_lag";
        }
      }
    }

    const clock = statusMeta(phase, daysSince, processingStart);

    // Progress bars vs 45 / 90 when we have daysSince
    let pct45 = 0;
    let pct90 = 0;
    if (daysSince != null && daysSince >= 0) {
      pct45 = Math.max(0, Math.min(100, Math.round((daysSince / CYCLE_45) * 100)));
      pct90 = Math.max(0, Math.min(100, Math.round((daysSince / LAG_90) * 100)));
    }

    // Milestone chips: wire already-computed augLeft/novLeft into text (not color-only)
    let augChip =
      "Aug 1 2026 — brokers must access DROP ≥ every 45 days (processing begins)";
    let augChipCls = "warn";
    if (augLeft != null) {
      if (augLeft > 0) {
        augChip =
          "Aug 1 2026 in " +
          augLeft +
          " day" +
          (augLeft === 1 ? "" : "s") +
          " — brokers must access DROP ≥ every 45 days (processing begins)";
        augChipCls = "warn";
      } else if (augLeft === 0) {
        augChip =
          "Aug 1 2026 today — brokers must access DROP ≥ every 45 days (processing begins)";
        augChipCls = "ok";
      } else {
        const ago = Math.abs(augLeft);
        augChip =
          "Aug 1 2026 in effect (" +
          ago +
          " day" +
          (ago === 1 ? "" : "s") +
          " ago) — brokers must access DROP ≥ every 45 days";
        augChipCls = "ok";
      }
    }

    let novChip =
      "November 2026 — first full download/upload cycle should complete";
    let novChipCls = "ok";
    if (novLeft != null) {
      if (novLeft > 0) {
        novChip =
          "November 2026 in " +
          novLeft +
          " day" +
          (novLeft === 1 ? "" : "s") +
          " — first full download/upload cycle should complete";
        novChipCls = "warn";
      } else if (novLeft === 0) {
        novChip =
          "November 2026 today — first full download/upload cycle should complete";
        novChipCls = "ok";
      } else {
        const ago = Math.abs(novLeft);
        novChip =
          "November 2026 milestone reached/passed (" +
          ago +
          " day" +
          (ago === 1 ? "" : "s") +
          " ago) — first full download/upload cycle should complete";
        novChipCls = "ok";
      }
    }

    let decoder;
    if (phase === "not_ca") {
      decoder =
        "California DROP (Delete Request and Opt-out Platform) is for California residents. Other states have different privacy tools — we will not invent DROP eligibility for non-CA users. Official page: privacy.ca.gov/drop.";
    } else if (phase === "eligible") {
      decoder =
        "You marked CA resident and not yet submitted. File free at privacy.ca.gov/drop (one request to 600+ registered brokers). Brokers begin processing Aug 1 2026 and must access ≥ every 45 days; November 2026 is the first full-cycle milestone. This card never submits on your behalf.";
    } else if (phase === "waiting_broker") {
      decoder =
        "You submitted before Aug 1 2026. Official framing: brokers begin processing on Aug 1 and must access DROP at least once every 45 days thereafter. Your submit date is recorded; the processing clock for broker access starts Aug 1. We never invent a broker’s Deleted / Exempted / Not found status.";
    } else {
      decoder =
        "Processing start = later of your submit date and Aug 1 2026. Days since that start sit against the 45-day broker access cycle and the up-to-90-day status-update lag on privacy.ca.gov/drop. This card uses only dates you pasted — never a DROP-account scrape, never an invented broker status.";
    }

    const action =
      "Calm next step: check or file only at privacy.ca.gov/drop. CPPA data-broker obligations: cppa.ca.gov/data_brokers. Broker process page: privacy.ca.gov/drop-for-data-brokers/process-drop-requests/. This card is not a paid removal service and never submits for you.";

    return {
      caResident: ca,
      submitStatus: submitStatus,
      submitDate: submitDate,
      viewDate: viewDate,
      processingStart: processingStart,
      daysSince: daysSince,
      daysSinceSubmit: daysSinceSubmit,
      phase: phase,
      clock: clock,
      pct45: pct45,
      pct90: pct90,
      novLeft: novLeft,
      augLeft: augLeft,
      augChip: augChip,
      novChip: novChip,
      augChipCls: augChipCls,
      novChipCls: novChipCls,
      decoder: decoder,
      action: action,
      noteLabel: input.noteLabel || "",
    };
  }

  function encodeHash(input) {
    const parts = [
      input.caResident || "",
      input.submitStatus || "not_submitted",
      input.submitDate || "",
      input.viewDate || "",
      input.noteLabel || "",
    ];
    const raw = parts.join("|");
    try {
      return "#p=" + btoa(unescape(encodeURIComponent(raw)));
    } catch (e) {
      return "#p=" + encodeURIComponent(raw);
    }
  }

  function decodeHash() {
    const raw = location.hash || "";
    if (!raw.startsWith("#p=")) return null;
    try {
      let decoded;
      try {
        decoded = decodeURIComponent(escape(atob(raw.slice(3))));
      } catch (e) {
        decoded = decodeURIComponent(raw.slice(3));
      }
      const parts = decoded.split("|");
      if (parts.length < 1) return null;
      return {
        caResident: parts[0] || "",
        submitStatus: parts[1] || "not_submitted",
        submitDate: parts[2] || "",
        viewDate: parts[3] || "",
        noteLabel: parts[4] || "",
      };
    } catch (e) {
      return null;
    }
  }

  function readInputs() {
    return {
      caResident: $("caResident").value || "",
      submitStatus: $("submitStatus").value || "not_submitted",
      submitDate: ($("submitDate").value || "").trim(),
      viewDate: ($("viewDate").value || "").trim(),
      noteLabel: ($("noteLabel").value || "").trim(),
    };
  }

  function applyInputs(p) {
    $("caResident").value = p.caResident || "";
    $("submitStatus").value = p.submitStatus || "not_submitted";
    $("submitDate").value = p.submitDate || "";
    $("viewDate").value = p.viewDate || "";
    $("noteLabel").value = p.noteLabel || "";
    syncSubmitDateField();
  }

  function syncSubmitDateField() {
    const submitted = $("submitStatus").value === "submitted";
    $("submitDate").disabled = !submitted;
    const wrap = $("submitDateWrap");
    if (wrap) wrap.classList.toggle("dimmed", !submitted);
  }

  function renderChips() {
    const box = $("seedChips");
    box.innerHTML = "";
    SEEDS.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "seed-chip";
      btn.setAttribute("role", "listitem");
      btn.innerHTML =
        s.label + '<span class="chip-sub">' + s.sub + "</span>";
      btn.addEventListener("click", () => {
        applyInputs(s);
        $("status").textContent = "Loaded seed: " + s.label;
        renderCard();
      });
      box.appendChild(btn);
    });
  }

  function renderSources() {
    $("sourceLinks").innerHTML =
      'Cites: <a href="' +
      DROP_URL +
      '" target="_blank" rel="noopener noreferrer">privacy.ca.gov/drop</a>' +
      '<a href="' +
      CPPA_BROKERS +
      '" target="_blank" rel="noopener noreferrer">cppa.ca.gov/data_brokers</a>' +
      '<a href="' +
      DROP_BROKER_PROCESS +
      '" target="_blank" rel="noopener noreferrer">DROP broker process page</a>';
  }

  function renderCard() {
    const input = readInputs();
    const err = validate(input);
    if (err) {
      $("cardSection").hidden = true;
      $("status").textContent = err;
      return;
    }

    const c = compute(input);
    $("cardSection").hidden = false;
    $("shareBox").hidden = false;
    $("status").textContent = "Card ready — copy, share, or export PNG.";

    const metaBits = [];
    if (c.caResident === "yes") metaBits.push("CA resident");
    else metaBits.push("Not CA resident");
    if (c.submitStatus === "submitted" && c.submitDate) {
      metaBits.push("Submitted " + fmtDate(c.submitDate));
    } else if (c.submitStatus === "not_submitted") {
      metaBits.push("Not submitted");
    }
    if (input.noteLabel) metaBits.push(input.noteLabel);
    $("cardMeta").textContent = metaBits.join(" · ");

    $("dlHeadline").textContent = c.clock.headline;
    $("statusPill").textContent = c.clock.pill;
    $("statusPill").className = "verdict-k " + c.clock.cls;
    $("statusSub").textContent = c.clock.sub;

    $("viewDateDisp").textContent = fmtDate(c.viewDate);
    $("daysDisp").textContent = c.clock.daysLabel;
    $("deadlineLine").textContent =
      c.phase === "eligible"
        ? "File at privacy.ca.gov/drop — free official DROP"
        : c.phase === "waiting_broker"
          ? "Broker processing starts " + AUG1_LABEL
          : c.processingStart
            ? "Processing start: " +
              fmtDate(c.processingStart) +
              " (later of submit / Aug 1)"
            : "—";

    $("daysRingDisp").textContent = c.clock.ringLabel;
    const ringPct =
      c.daysSince != null
        ? Math.max(2, Math.min(100, Math.round((Math.min(c.daysSince, LAG_90) / LAG_90) * 100)))
        : c.phase === "eligible"
          ? 100
          : 0;
    $("daysRing").style.setProperty("--pct", String(ringPct));
    if (c.phase === "not_ca" || (c.phase === "status_lag" && c.daysSince >= LAG_90)) {
      $("daysRing").className = "fee-ring danger";
    } else if (c.phase === "inside_45" || c.phase === "eligible") {
      $("daysRing").className = "fee-ring ok";
    } else if (c.phase === "waiting_broker" || c.phase === "status_lag") {
      $("daysRing").className = "fee-ring";
    } else {
      $("daysRing").className = "fee-ring empty";
    }

    const windowEl = $("windowLine");
    if (c.daysSince != null) {
      windowEl.className =
        "hero-sub " +
        (c.daysSince >= LAG_90 ? "danger" : c.daysSince >= CYCLE_45 ? "warn" : "ok");
      windowEl.textContent =
        c.daysSince +
        " day" +
        (c.daysSince === 1 ? "" : "s") +
        " since processing start · vs 45-day cycle / 90-day lag";
    } else if (c.phase === "waiting_broker") {
      windowEl.className = "hero-sub warn";
      windowEl.textContent =
        "View is before " + AUG1_LABEL + " · waiting for broker cycle";
    } else if (c.phase === "eligible") {
      windowEl.className = "hero-sub ok";
      windowEl.textContent = "Ready to file · Aug / Nov milestone chips for context";
    } else {
      windowEl.className = "hero-sub";
      windowEl.textContent = "DROP is CA residents only";
    }

    const flag = $("actionFlag");
    flag.textContent = c.clock.flag;
    flag.className = "look-enroll-flag " + c.clock.cls;

    $("augChip").textContent = c.augChip;
    $("augChip").className = "look-enroll-flag " + (c.augChipCls || "warn");
    $("novChip").textContent = c.novChip;
    $("novChip").className = "look-enroll-flag " + (c.novChipCls || "ok");

    // Bars
    const bar45 = $("bar45Fill");
    const bar90 = $("bar90Fill");
    const bar45Lab = $("bar45Label");
    const bar90Lab = $("bar90Label");
    const barsWrap = $("barsWrap");
    if (c.daysSince != null) {
      barsWrap.hidden = false;
      bar45.style.width = c.pct45 + "%";
      bar90.style.width = c.pct90 + "%";
      bar45Lab.textContent =
        "45-day access cycle: " +
        Math.min(c.daysSince, CYCLE_45) +
        " / " +
        CYCLE_45 +
        " days" +
        (c.daysSince >= CYCLE_45 ? " (cycle window passed)" : "");
      bar90Lab.textContent =
        "Up-to-90-day status lag: " +
        Math.min(c.daysSince, LAG_90) +
        " / " +
        LAG_90 +
        " days" +
        (c.daysSince >= LAG_90 ? " (past 90-day lag)" : "");
    } else {
      barsWrap.hidden = true;
    }

    $("rCa").textContent = c.caResident === "yes" ? "Yes" : "No";
    $("rSubmit").textContent =
      c.submitStatus === "submitted"
        ? "Yes · " + (c.submitDate ? fmtDate(c.submitDate) : "—")
        : "Not submitted";
    $("rProcess").textContent = c.processingStart
      ? fmtDate(c.processingStart)
      : c.phase === "waiting_broker"
        ? AUG1_LABEL + " (upcoming)"
        : "—";
    $("rView").textContent = fmtDate(c.viewDate);

    const novBit =
      c.novLeft == null
        ? ""
        : c.novLeft > 0
          ? " November 2026 first full-cycle milestone is " +
            c.novLeft +
            " day" +
            (c.novLeft === 1 ? "" : "s") +
            " from your view date."
          : c.novLeft === 0
            ? " November 2026 first full-cycle milestone is today."
            : " November 2026 first full-cycle milestone has arrived/passed relative to your view date.";

    $("decoderLine").textContent = c.decoder + novBit;
    $("actionLine").textContent = c.action;
    $("citeLine").textContent = CITE_ONE_LINER + " " + DISCLAIMER_SHORT + ".";

    const hash = encodeHash(input);
    if (location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
    $("shareUrl").value = location.href.split("#")[0] + hash;
  }

  function clearAll() {
    applyInputs({
      caResident: "",
      submitStatus: "not_submitted",
      submitDate: "",
      viewDate: todayISO(),
      noteLabel: "",
    });
    $("cardSection").hidden = true;
    $("shareBox").hidden = true;
    $("status").textContent = "Cleared.";
    history.replaceState(null, "", location.pathname + location.search);
  }

  function summaryText() {
    const input = readInputs();
    const err = validate(input);
    if (err) return err;
    const c = compute(input);
    const lines = [
      "CA DROP Delete Clock",
      "CA resident: " + c.caResident,
      "Submit status: " + c.submitStatus,
      c.submitDate ? "Submit date: " + fmtDate(c.submitDate) : null,
      "View date: " + fmtDate(c.viewDate),
      c.processingStart
        ? "Processing start: " + fmtDate(c.processingStart)
        : null,
      c.daysSince != null ? "Days since processing start: " + c.daysSince : null,
      "Status: " + c.clock.pill + " · " + c.clock.sub,
      c.augChip,
      c.novChip,
      "",
      c.decoder,
      c.action,
      "",
      "File/check only at: " + DROP_URL,
      CITE_ONE_LINER,
      DISCLAIMER_SHORT,
    ];
    return lines.filter((x) => x != null).join("\n");
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText());
      $("status").textContent = "Summary copied.";
    } catch (e) {
      $("status").textContent = "Copy failed — select share URL instead.";
    }
  }

  async function shareLink() {
    renderCard();
    const url = $("shareUrl").value;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "CA DROP Delete Clock",
          text: "Paste your DROP submit date — inside the 45/90-day window?",
          url: url,
        });
        $("status").textContent = "Share sheet opened.";
      } else {
        await navigator.clipboard.writeText(url);
        $("status").textContent = "Share link copied.";
      }
    } catch (e) {
      $("status").textContent = "Share cancelled or unavailable.";
    }
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText($("shareUrl").value);
      $("status").textContent = "Share URL copied.";
    } catch (e) {
      $("status").textContent = "Copy failed.";
    }
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text || "").split(/\s+/);
    let line = "";
    let yy = y;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, yy);
        line = words[i];
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, yy);
      yy += lineHeight;
    }
    return yy;
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function exportPng() {
    const input = readInputs();
    const err = validate(input);
    if (err) {
      $("status").textContent = err;
      return;
    }
    const c = compute(input);
    const canvas = $("pngCanvas");
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "rgba(62,207,142,0.14)");
    g.addColorStop(0.55, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(126,184,232,0.10)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#121820";
    roundRect(ctx, 36, 36, W - 72, H - 72, 18);
    ctx.fill();
    ctx.strokeStyle = "#2e3a48";
    ctx.lineWidth = 2;
    ctx.stroke();

    let y = 78;
    ctx.fillStyle = "#8b9aab";
    ctx.font = "600 18px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText("CA DROP Delete Clock", 64, y);
    y += 36;

    ctx.fillStyle = "#e8eef5";
    ctx.font = "700 32px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, c.clock.headline, 64, y, W - 128, 38);
    y += 16;

    // Giant status badge (text-primary)
    ctx.fillStyle = "#1a2330";
    roundRect(ctx, 64, y, W - 128, 130, 14);
    ctx.fill();
    ctx.fillStyle =
      c.clock.cls === "danger"
        ? "#ff6b6b"
        : c.clock.cls === "ok"
          ? "#3ecf8e"
          : "#f0b429";
    ctx.font = "700 36px IBM Plex Mono, monospace";
    y = wrapText(ctx, c.clock.daysLabel, 88, y + 48, W - 176, 40);
    ctx.fillStyle = "#8b9aab";
    ctx.font = "500 16px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText(c.clock.sub, 88, y + 18);
    y += 48;

    ctx.fillStyle = "#e8eef5";
    ctx.font = "600 18px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText("Status: " + c.clock.pill, 64, y);
    y += 28;

    ctx.fillStyle = "#b8c4d0";
    ctx.font = "400 16px IBM Plex Sans, system-ui, sans-serif";
    const meta =
      "View " +
      fmtDate(c.viewDate) +
      (c.submitDate ? " · Submitted " + fmtDate(c.submitDate) : " · Not submitted") +
      (c.processingStart
        ? " · Processing start " + fmtDate(c.processingStart)
        : "") +
      (c.daysSince != null ? " · " + c.daysSince + "d since start" : "");
    y = wrapText(ctx, meta, 64, y, W - 128, 24);
    y += 14;

    // Aug + Nov chips (day literacy — wrap so share PNG still reads)
    const chipBoxTop = y;
    ctx.fillStyle = "#1a2330";
    roundRect(ctx, 64, chipBoxTop, W - 128, 128, 12);
    ctx.fill();
    ctx.fillStyle =
      c.augChipCls === "ok" ? "#3ecf8e" : "#f0b429";
    ctx.font = "600 15px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, c.augChip, 88, chipBoxTop + 28, W - 176, 20);
    y += 8;
    ctx.fillStyle =
      c.novChipCls === "warn" ? "#f0b429" : "#3ecf8e";
    y = wrapText(ctx, c.novChip, 88, y, W - 176, 20);
    y = Math.max(y + 16, chipBoxTop + 140);

    if (c.daysSince != null) {
      ctx.fillStyle = "#b8c4d0";
      ctx.font = "400 15px IBM Plex Sans, system-ui, sans-serif";
      ctx.fillText(
        "45-day cycle: " + Math.min(c.daysSince, CYCLE_45) + "/" + CYCLE_45 +
          " · 90-day lag: " + Math.min(c.daysSince, LAG_90) + "/" + LAG_90,
        64,
        y
      );
      y += 28;
    }

    ctx.fillStyle = "#b8c4d0";
    ctx.font = "400 15px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, c.clock.flag, 64, y, W - 128, 20);
    y += 10;
    y = wrapText(ctx, "Pointer: privacy.ca.gov/drop only", 64, y, W - 128, 20);
    y += 16;

    ctx.fillStyle = "#8b9aab";
    ctx.font = "400 13px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, CITE_ONE_LINER, 64, y, W - 128, 18);
    y += 20;

    ctx.fillStyle = "#ff6b6b";
    ctx.font = "600 14px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, DISCLAIMER_SHORT, 64, y, W - 128, 18);

    ctx.fillStyle = "#5a6a7a";
    ctx.font = "400 13px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText(
      "User-pasted dates · no DROP scrape · never ask SSN · privacy.ca.gov/drop",
      64,
      H - 56
    );

    canvas.toBlob(function (blob) {
      if (!blob) {
        $("status").textContent = "PNG export failed.";
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download =
        "ca-drop-delete-clock-" +
        (input.caResident || "ca") +
        "-" +
        (input.viewDate || "view") +
        ".png";
      a.click();
      URL.revokeObjectURL(a.href);
      $("status").textContent = "PNG downloaded.";
    });
  }

  function bind() {
    if (!$("viewDate").value) $("viewDate").value = todayISO();
    syncSubmitDateField();
    renderChips();
    renderSources();

    $("submitStatus").addEventListener("change", syncSubmitDateField);
    $("cardBtn").addEventListener("click", renderCard);
    $("clearBtn").addEventListener("click", clearAll);
    $("copySummary").addEventListener("click", copySummary);
    $("shareBtn").addEventListener("click", shareLink);
    $("copyShare").addEventListener("click", copyShare);
    $("pngBtn").addEventListener("click", exportPng);

    window.addEventListener("hashchange", () => {
      const p = decodeHash();
      if (p) {
        applyInputs(p);
        renderCard();
      }
    });

    const fromHash = decodeHash();
    if (fromHash) {
      applyInputs(fromHash);
      renderCard();
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bind);
    } else {
      bind();
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      SEEDS: SEEDS,
      AUG1_ISO: AUG1_ISO,
      AUG1_LABEL: AUG1_LABEL,
      NOV_ISO: NOV_ISO,
      NOV_LABEL: NOV_LABEL,
      CYCLE_45: CYCLE_45,
      LAG_90: LAG_90,
      DROP_URL: DROP_URL,
      parseISODate: parseISODate,
      addDays: addDays,
      daysBetween: daysBetween,
      laterDate: laterDate,
      novDaysLeft: novDaysLeft,
      aug1DaysLeft: aug1DaysLeft,
      statusMeta: statusMeta,
      validate: validate,
      compute: compute,
      fmtDate: fmtDate,
      DISCLAIMER_SHORT: DISCLAIMER_SHORT,
      CITE_ONE_LINER: CITE_ONE_LINER,
    };
  }
})();
