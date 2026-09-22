# Aventureros de la Matemática — 5° grado (app interactiva)

App web de repaso de Matemática para 5° grado, basada en el cuadernillo
*"Aventureros de la Matemática — Educación Primaria, Quinto grado"* (PEAMM,
Dirección General de Escuelas, Mendoza). Construida en **HTML, CSS y
JavaScript puro**, sin frameworks ni dependencias externas (solo Google
Fonts vía CDN).

## Estructura

```
index.html                      → landing / índice para elegir el tema
css/styles.css                  → sistema de diseño compartido por toda la app
js/engine.js                    → motor genérico de actividades (no tocar para agregar contenido)
js/home.js                      → arreglo TOPICS que arma la landing
temas/
  numero-operaciones.html
  geometria-medida.html
  estadistica-probabilidad.html
js/temas/
  numero-operaciones.js         → arreglo ACTIVITIES del tema
  geometria-medida.js
  estadistica-probabilidad.js
```

Los tres temas replican los ejes que ya usa el propio cuadernillo:
**Número y Operaciones**, **Geometría y Medida** y **Estadística y
Probabilidad**. Cada uno tiene 6 actividades inspiradas en las historias del
cuadernillo (el acto de fin de año, el vivero escolar, la misión a la Luna).

El progreso de cada alumno/a se guarda en el `localStorage` del navegador
(no requiere backend ni login), por tema y por actividad.

## Cómo agregar una actividad nueva

No hace falta tocar `engine.js`. Alcanza con sumar un objeto al arreglo
`ACTIVITIES` del archivo del tema correspondiente (`js/temas/*.js`).

Tipos de actividad disponibles:

| type              | Qué genera                                   | Datos (`data`) que necesita |
|-------------------|-----------------------------------------------|------------------------------|
| `multiple-choice` | Opciones para elegir una                       | `options: string[]`, `correctIndex: number` |
| `true-false`      | Verdadero / Falso                              | `correct: boolean` |
| `numeric`         | Uno o más campos numéricos                     | `items: [{ label, answer, tolerance?, unit? }]` |
| `match`           | Unir columna izquierda con derecha (clic + clic)| `pairs: [{ left, right }]` |
| `classify`        | Clasificar ítems en categorías (clic + clic)   | `bins: string[]`, `items: [{ label, bin }]` |
| `sort`            | Ordenar una lista con flechas ↑ / ↓            | `items: string[]`, `correctOrder: number[]` (índices originales en el orden correcto) |

Ejemplo mínimo:

```js
{
  id: "no-7-nueva-actividad",
  type: "multiple-choice",
  title: "Título corto",
  prompt: "Enunciado de la consigna (podés usar <strong>HTML simple</strong>).",
  data: {
    options: ["Opción A", "Opción B", "Opción C"],
    correctIndex: 1,
  },
  explain: "Texto que se muestra como devolución, acierte o no.",
}
```

Opcionalmente, cualquier actividad puede incluir `chart: { series: [{label, value}, ...] }`
para dibujar un gráfico de barras arriba de la consigna (se usa en
Estadística y Probabilidad).

`id` debe ser único dentro del tema: es la clave que se usa para guardar el
progreso en `localStorage`.

## Cómo agregar un tema nuevo

1. Sumá un objeto al arreglo `TOPICS` en `js/home.js` (título, ícono, texto,
   `href` al HTML del tema y `total` = cantidad de actividades).
2. Copiá `temas/numero-operaciones.html` como plantilla para el HTML del
   tema nuevo (cambiá el `<title>`, el ícono del favicon y el `<script>` que
   carga el archivo de actividades).
3. Creá `js/temas/tu-tema.js` con su propio arreglo `ACTIVITIES` y la
   llamada final a `Av5Engine.initActivityPage({ topicId, topicTitle,
   topicIcon, topicDesc, activities })`.

Con eso alcanza: el motor, el sistema de progreso y los estilos se
reutilizan automáticamente.
