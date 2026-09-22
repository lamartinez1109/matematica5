/**
 * home.js
 * Arma la grilla de temas de la landing a partir de TOPICS.
 *
 * Para agregar un tema nuevo a la app:
 *   1) Agregá un objeto a TOPICS con un href a temas/tu-tema.html
 *   2) Creá temas/tu-tema.html (copiá uno existente como plantilla)
 *   3) Creá js/temas/tu-tema.js con un arreglo ACTIVITIES y llamá a
 *      Av5Engine.initActivityPage({...}) al final del archivo.
 * No hace falta tocar engine.js.
 */

const TOPICS = [
  {
    id: "numero",
    title: "Número y Operaciones",
    icon: "🔢",
    className: "topic-card--numero",
    desc: "Fracciones y duraciones musicales, números grandes del vivero, multiplicar por 10/100/1000 y sistemas de numeración.",
    href: "temas/numero-operaciones.html",
    total: 6,
  },
  {
    id: "geometria",
    title: "Geometría y Medida",
    icon: "📐",
    className: "topic-card--geometria",
    desc: "Prismas y pirámides para el laberinto flúor, unidades de capacidad del vivero, perímetro y área.",
    href: "temas/geometria-medida.html",
    total: 6,
  },
  {
    id: "estadistica",
    title: "Estadística y Probabilidad",
    icon: "🚀",
    className: "topic-card--estadistica",
    desc: "Gráficos de barras, promedio y moda, y la probabilidad del sorteo de astronautas rumbo a la Luna.",
    href: "temas/estadistica-probabilidad.html",
    total: 6,
  },
];

function renderTopicGrid() {
  const grid = document.getElementById("topic-grid");
  if (!grid) return;

  TOPICS.forEach((topic) => {
    const stats = Av5Engine.getTopicStats(topic.id, topic.total);

    const card = Av5Engine.el("a", {
      class: `topic-card ${topic.className || ""}`.trim(),
      href: topic.href,
    });

    const top = Av5Engine.el("div", { class: "topic-card__top" }, [
      Av5Engine.el("span", { class: "topic-card__icon", "aria-hidden": "true", text: topic.icon }),
    ]);

    const ring = Av5Engine.el("div", { class: "ring" }, [
      Av5Engine.el("div", { class: "ring__hole", text: `${stats.pct}%` }),
    ]);
    ring.style.setProperty("--pct", stats.pct);
    top.appendChild(ring);

    card.appendChild(top);
    card.appendChild(Av5Engine.el("h2", { text: topic.title }));
    card.appendChild(Av5Engine.el("p", { class: "topic-card__desc", text: topic.desc }));

    const foot = Av5Engine.el("div", { class: "topic-card__foot" }, [
      Av5Engine.el("span", { class: "topic-card__cta", text: stats.completed > 0 ? "Seguir practicando →" : "Empezar →" }),
      Av5Engine.el("span", { class: "topic-card__cta", text: `${stats.completed}/${stats.total}` }),
    ]);
    card.appendChild(foot);

    grid.appendChild(card);
  });
}

renderTopicGrid();
