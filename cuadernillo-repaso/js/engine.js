/**
 * engine.js
 * Motor genérico de actividades interactivas para "Aventureros de la Matemática 5°".
 *
 * Para sumar una actividad nueva NO hace falta tocar este archivo:
 * alcanza con agregar un objeto al arreglo ACTIVITIES del tema correspondiente
 * (js/temas/<tema>.js), siguiendo alguno de los tipos ya soportados:
 *   "multiple-choice" | "true-false" | "numeric" | "match" | "classify" | "sort"
 *
 * Ver README.md para el detalle de cada forma de datos.
 */

const STORAGE_PREFIX = "av5";

/* ---------------- Utilidades ---------------- */

function storageKey(topicId) {
  return `${STORAGE_PREFIX}:progress:${topicId}`;
}

function loadProgress(topicId) {
  try {
    const raw = localStorage.getItem(storageKey(topicId));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveProgress(topicId, progress) {
  try {
    localStorage.setItem(storageKey(topicId), JSON.stringify(progress));
  } catch (e) {
    /* localStorage no disponible: la app sigue funcionando sin persistencia */
  }
}

function markActivityResult(topicId, activityId, correct) {
  const progress = loadProgress(topicId);
  progress[activityId] = { completed: true, correct: !!correct };
  saveProgress(topicId, progress);
  return progress;
}

function getTopicStats(topicId, totalActivities) {
  const progress = loadProgress(topicId);
  const ids = Object.keys(progress);
  const completed = ids.length;
  const correct = ids.filter((id) => progress[id].correct).length;
  const pct = totalActivities > 0 ? Math.round((completed / totalActivities) * 100) : 0;
  return { completed, correct, total: totalActivities, pct, progress };
}

function normalizeNumber(str) {
  if (str === null || str === undefined) return NaN;
  const cleaned = String(str).trim().replace(",", ".").replace(/\s/g, "");
  if (cleaned === "") return NaN;
  return Number(cleaned);
}

function numbersMatch(a, b, tolerance) {
  const tol = tolerance === undefined ? 0.01 : tolerance;
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol;
}

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach((key) => {
      if (key === "class") node.className = attrs[key];
      else if (key === "text") node.textContent = attrs[key];
      else if (key === "html") node.innerHTML = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
  }
  (children || []).forEach((child) => {
    if (child) node.appendChild(child);
  });
  return node;
}

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ---------------- Renderizadores por tipo ---------------- */
/* Cada renderer recibe (activity, host) y devuelve un objeto:
 *   { checkAnswer(): boolean, disable(): void }
 * host.body    -> donde se monta la interacción
 * host.feedback(ok, message) -> muestra el cartel de resultado
 */

function renderMultipleChoice(activity, body) {
  const options = el("div", { class: "mc-options", role: "listbox" });
  let selected = null;
  const letters = ["A", "B", "C", "D", "E"];

  const buttons = activity.data.options.map((optionText, index) => {
    const btn = el("button", {
      class: "mc-option",
      type: "button",
      "aria-pressed": "false",
    }, [
      el("span", { class: "mc-option__bullet", text: letters[index] || String(index + 1) }),
      el("span", { text: optionText }),
    ]);
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      selected = index;
      buttons.forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
    });
    options.appendChild(btn);
    return btn;
  });

  body.appendChild(options);

  return {
    hasAnswer: () => selected !== null,
    checkAnswer: () => {
      const correctIndex = activity.data.correctIndex;
      buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === correctIndex) btn.dataset.state = "correct";
        else if (index === selected) btn.dataset.state = "incorrect";
      });
      return selected === correctIndex;
    },
  };
}

function renderTrueFalse(activity, body) {
  const wrap = el("div", { class: "tf-options" });
  let selected = null;

  const trueBtn = el("button", { class: "tf-option", type: "button", "aria-pressed": "false", text: "Verdadero" });
  const falseBtn = el("button", { class: "tf-option", type: "button", "aria-pressed": "false", text: "Falso" });

  [trueBtn, falseBtn].forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      selected = i === 0;
      trueBtn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      falseBtn.setAttribute("aria-pressed", i === 1 ? "true" : "false");
    });
  });

  wrap.appendChild(trueBtn);
  wrap.appendChild(falseBtn);
  body.appendChild(wrap);

  return {
    hasAnswer: () => selected !== null,
    checkAnswer: () => {
      const correct = activity.data.correct;
      trueBtn.disabled = true;
      falseBtn.disabled = true;
      const map = { true: trueBtn, false: falseBtn };
      map[String(correct)].dataset.state = "correct";
      if (selected !== correct) map[String(selected)].dataset.state = "incorrect";
      return selected === correct;
    },
  };
}

function renderNumeric(activity, body) {
  const wrap = el("div", { class: "numeric-items" });
  const inputs = activity.data.items.map((item) => {
    const row = el("div", { class: "numeric-item" }, [
      el("label", { text: item.label }),
    ]);
    const inner = el("div", { class: "numeric-item__row" });
    const input = el("input", {
      type: "text",
      inputmode: "decimal",
      autocomplete: "off",
      "aria-label": item.label,
    });
    inner.appendChild(input);
    if (item.unit) inner.appendChild(el("span", { class: "numeric-item__unit", text: item.unit }));
    const mark = el("span", { class: "numeric-item__mark", "aria-hidden": "true" });
    inner.appendChild(mark);
    row.appendChild(inner);
    wrap.appendChild(row);
    return { item, input, row, mark };
  });

  body.appendChild(wrap);

  return {
    hasAnswer: () => inputs.every((i) => i.input.value.trim() !== ""),
    checkAnswer: () => {
      let allCorrect = true;
      inputs.forEach(({ item, input, row, mark }) => {
        const value = normalizeNumber(input.value);
        const ok = numbersMatch(value, item.answer, item.tolerance);
        input.disabled = true;
        row.dataset.state = ok ? "correct" : "incorrect";
        mark.textContent = ok ? "✓" : "✗";
        if (!ok) allCorrect = false;
      });
      return allCorrect;
    },
  };
}

function renderMatch(activity, body) {
  const board = el("div", { class: "match-board" });
  const leftCol = el("div", { class: "match-col" });
  const rightCol = el("div", { class: "match-col" });

  const pairs = activity.data.pairs; // [{left, right}]
  const leftItems = pairs.map((p, i) => ({ id: `L${i}`, text: p.left, pairIndex: i }));
  const rightItems = shuffle(pairs.map((p, i) => ({ id: `R${i}`, text: p.right, pairIndex: i })));

  let selectedLeft = null;
  const matched = new Set();
  let wrongAttempts = 0;

  const leftButtons = {};
  const rightButtons = {};

  leftItems.forEach((item) => {
    const btn = el("button", { class: "match-chip", type: "button", "aria-pressed": "false", text: item.text });
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      selectedLeft = item;
      Object.values(leftButtons).forEach((b) => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
    });
    leftButtons[item.id] = btn;
    leftCol.appendChild(btn);
  });

  rightItems.forEach((item) => {
    const btn = el("button", { class: "match-chip", type: "button", text: item.text });
    btn.addEventListener("click", () => {
      if (btn.disabled || !selectedLeft) return;
      if (selectedLeft.pairIndex === item.pairIndex) {
        btn.dataset.state = "matched";
        btn.disabled = true;
        const leftBtn = leftButtons[selectedLeft.id];
        leftBtn.dataset.state = "matched";
        leftBtn.disabled = true;
        matched.add(selectedLeft.pairIndex);
      } else {
        wrongAttempts += 1;
        btn.dataset.state = "wrong";
        setTimeout(() => { delete btn.dataset.state; }, 500);
      }
      selectedLeft = null;
      Object.values(leftButtons).forEach((b) => b.setAttribute("aria-pressed", "false"));
    });
    rightButtons[item.id] = btn;
    rightCol.appendChild(btn);
  });

  board.appendChild(leftCol);
  board.appendChild(rightCol);
  body.appendChild(board);

  return {
    hasAnswer: () => matched.size === pairs.length,
    checkAnswer: () => {
      Object.values(leftButtons).forEach((b) => { b.disabled = true; });
      Object.values(rightButtons).forEach((b) => { b.disabled = true; });
      return matched.size === pairs.length && wrongAttempts === 0;
    },
  };
}

function renderClassify(activity, body) {
  const pool = el("div", { class: "classify-pool" });
  const bins = el("div", { class: "classify-bins" });

  const binMap = {};
  activity.data.bins.forEach((binLabel) => {
    const binEl = el("div", { class: "classify-bin" }, [
      el("h4", { text: binLabel }),
      el("div", { class: "classify-bin__items" }),
    ]);
    binMap[binLabel] = binEl.querySelector(".classify-bin__items");
    bins.appendChild(binEl);
  });

  let activeChip = null;
  const placements = {}; // itemText -> binLabel chosen

  const chips = activity.data.items.map((item) => {
    const chip = el("button", { class: "classify-chip", type: "button", "aria-pressed": "false", text: item.label });
    chip.addEventListener("click", () => {
      if (chip.dataset.placed === "true") return;
      activeChip = { chip, item };
      chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
    });
    pool.appendChild(chip);
    return chip;
  });

  Object.keys(binMap).forEach((binLabel) => {
    binMap[binLabel].parentElement.addEventListener("click", () => {
      if (!activeChip) return;
      placements[activeChip.item.label] = binLabel;
      const clone = el("span", { class: "classify-chip", text: activeChip.item.label });
      binMap[binLabel].appendChild(clone);
      activeChip.chip.dataset.placed = "true";
      activeChip.chip.style.display = "none";
      activeChip = null;
    });
  });

  body.appendChild(pool);
  body.appendChild(bins);

  return {
    hasAnswer: () => Object.keys(placements).length === activity.data.items.length,
    checkAnswer: () => {
      let allCorrect = true;
      activity.data.items.forEach((item) => {
        const chosen = placements[item.label];
        const ok = chosen === item.bin;
        if (!ok) allCorrect = false;
        // marcar el chip clonado correspondiente
        Object.values(binMap).forEach((binItemsEl) => {
          Array.from(binItemsEl.children).forEach((clone) => {
            if (clone.textContent === item.label) {
              clone.dataset.correct = ok ? "true" : "false";
            }
          });
        });
      });
      return allCorrect;
    },
  };
}

function renderSort(activity, body) {
  const list = el("ul", { class: "sort-list" });
  let order = shuffle(activity.data.items.map((text, i) => ({ text, originalIndex: i })));

  function draw() {
    list.innerHTML = "";
    order.forEach((entry, position) => {
      const li = el("li", { class: "sort-item" }, [
        el("span", { class: "sort-item__num", text: String(position + 1) }),
        el("span", { class: "sort-item__label", text: entry.text }),
      ]);
      const controls = el("div", { class: "sort-item__controls" });
      const upBtn = el("button", { class: "sort-btn", type: "button", "aria-label": "Subir" , text: "↑"});
      const downBtn = el("button", { class: "sort-btn", type: "button", "aria-label": "Bajar", text: "↓" });
      if (position === 0) upBtn.disabled = true;
      if (position === order.length - 1) downBtn.disabled = true;
      upBtn.addEventListener("click", () => {
        [order[position - 1], order[position]] = [order[position], order[position - 1]];
        draw();
      });
      downBtn.addEventListener("click", () => {
        [order[position], order[position + 1]] = [order[position + 1], order[position]];
        draw();
      });
      controls.appendChild(upBtn);
      controls.appendChild(downBtn);
      li.appendChild(controls);
      list.appendChild(li);
    });
  }

  draw();
  body.appendChild(list);

  return {
    hasAnswer: () => true,
    checkAnswer: () => {
      let allCorrect = true;
      Array.from(list.children).forEach((li, position) => {
        const isCorrect = order[position].originalIndex === activity.data.correctOrder[position];
        li.dataset.state = isCorrect ? "correct" : "incorrect";
        if (!isCorrect) allCorrect = false;
      });
      Array.from(list.querySelectorAll(".sort-btn")).forEach((btn) => { btn.disabled = true; });
      return allCorrect;
    },
  };
}

function renderBarChart(container, chart) {
  const max = Math.max(...chart.series.map((s) => s.value));
  const wrap = el("div", { class: "bar-chart" });
  chart.series.forEach((s) => {
    const heightPct = Math.max(6, Math.round((s.value / max) * 100));
    const bar = el("div", { class: "bar-chart__bar", style: `height:${heightPct}%` }, [
      el("span", { class: "bar-chart__value", text: String(s.value) }),
    ]);
    const col = el("div", { class: "bar-chart__col" }, [bar, el("span", { class: "bar-chart__label", text: s.label })]);
    wrap.appendChild(col);
  });
  container.appendChild(wrap);
}

const RENDERERS = {
  "multiple-choice": renderMultipleChoice,
  "true-false": renderTrueFalse,
  numeric: renderNumeric,
  match: renderMatch,
  classify: renderClassify,
  sort: renderSort,
};

/* ---------------- Controlador de la página de tema ---------------- */

function initActivityPage(config) {
  const { topicId, topicTitle, topicIcon, topicDesc, activities } = config;

  const header = document.getElementById("topic-header");
  if (header) {
    header.innerHTML = "";
    header.appendChild(el("div", { class: "topic-header__icon", "aria-hidden": "true", text: topicIcon }));
    const textWrap = el("div", { class: "topic-header__text" }, [
      el("h1", { text: topicTitle }),
      el("p", { text: topicDesc }),
    ]);
    header.appendChild(textWrap);

    const statsWrap = el("div", { class: "topic-header__stats" });
    const ring = el("div", { class: "ring" }, [el("div", { class: "ring__hole" })]);
    const scoreText = el("div", { class: "topic-header__score" });
    statsWrap.appendChild(ring);
    statsWrap.appendChild(scoreText);
    header.appendChild(statsWrap);

    header._ring = ring;
    header._ringHole = ring.querySelector(".ring__hole");
    header._scoreText = scoreText;
  }

  const nav = document.getElementById("activity-nav");
  const panelHost = document.getElementById("activity-panel");

  let currentIndex = 0;

  function updateHeaderStats() {
    if (!header) return;
    const stats = getTopicStats(topicId, activities.length);
    header._ring.style.setProperty("--pct", stats.pct);
    header._ringHole.textContent = `${stats.pct}%`;
    header._scoreText.innerHTML = `<strong>${stats.correct}/${stats.total}</strong> actividades correctas`;
  }

  function renderNav() {
    if (!nav) return;
    nav.innerHTML = "";
    const progress = loadProgress(topicId);
    activities.forEach((activity, index) => {
      const done = progress[activity.id] && progress[activity.id].completed;
      const pill = el("button", {
        class: "activity-pill" + (done ? " activity-pill--done" : ""),
        type: "button",
        "aria-current": index === currentIndex ? "true" : "false",
        text: activity.title,
      });
      pill.addEventListener("click", () => {
        currentIndex = index;
        renderNav();
        renderActivity();
      });
      nav.appendChild(pill);
    });
  }

  function renderActivity() {
    if (!panelHost) return;
    panelHost.innerHTML = "";
    const activity = activities[currentIndex];

    const panel = el("div", { class: "activity-panel" });
    panel.appendChild(el("h2", { text: activity.title }));
    panel.appendChild(el("div", { class: "activity-panel__prompt", html: activity.prompt }));

    if (activity.chart) renderBarChart(panel, activity.chart);

    const body = el("div", { class: "activity-body" });
    panel.appendChild(body);

    const renderer = RENDERERS[activity.type];
    if (!renderer) {
      body.appendChild(el("p", { text: "Tipo de actividad no soportado." }));
      panelHost.appendChild(panel);
      return;
    }

    const controller = renderer(activity, body);

    const controls = el("div", { class: "activity-controls" });
    const checkBtn = el("button", { class: "btn btn-primary", type: "button", text: "Comprobar" });
    const nextBtn = el("button", { class: "btn btn-ghost", type: "button", text: "Siguiente actividad →" });
    nextBtn.style.display = "none";

    const feedback = el("div", { class: "feedback" });
    const feedbackIcon = el("strong", {});
    const feedbackBody = el("span", { class: "feedback__body" });
    feedback.appendChild(feedbackIcon);
    feedback.appendChild(feedbackBody);

    checkBtn.addEventListener("click", () => {
      const ok = controller.checkAnswer();
      checkBtn.disabled = true;
      feedback.classList.add("is-visible");
      feedback.classList.toggle("feedback--ok", ok);
      feedback.classList.toggle("feedback--err", !ok);
      feedbackIcon.textContent = ok ? "¡Muy bien!" : "Casi.";
      feedbackBody.innerHTML = ok
        ? (activity.explain || "Respuesta correcta.")
        : (activity.explain || "Revisá el ejercicio y volvé a intentar la próxima vez.");
      markActivityResult(topicId, activity.id, ok);
      updateHeaderStats();
      renderNav();
      nextBtn.style.display = currentIndex < activities.length - 1 ? "inline-flex" : "none";
    });

    nextBtn.addEventListener("click", () => {
      currentIndex = Math.min(currentIndex + 1, activities.length - 1);
      renderNav();
      renderActivity();
      panelHost.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    controls.appendChild(checkBtn);
    controls.appendChild(nextBtn);
    controls.appendChild(feedback);
    panel.appendChild(controls);

    panelHost.appendChild(panel);
  }

  updateHeaderStats();
  renderNav();
  renderActivity();
}

window.Av5Engine = {
  el,
  shuffle,
  loadProgress,
  saveProgress,
  getTopicStats,
  initActivityPage,
};
