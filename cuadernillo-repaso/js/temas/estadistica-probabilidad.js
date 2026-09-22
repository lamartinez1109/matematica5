/**
 * Actividades del tema "Estadística y Probabilidad".
 * Para sumar una actividad: agregá un objeto más a ACTIVITIES.
 * El campo opcional "chart" dibuja un gráfico de barras arriba del enunciado.
 */

const ACTIVITIES = [
  {
    id: "ep-1-lectura-grafico",
    type: "multiple-choice",
    title: "Leemos el gráfico de votos",
    prompt: "Un grupo de 5° encuestó qué disciplina artística prefieren para el acto de fin de año. Observá el gráfico y respondé:",
    chart: {
      series: [
        { label: "Música", value: 40 },
        { label: "Pintura", value: 25 },
        { label: "Teatro", value: 10 },
        { label: "Danza", value: 25 },
      ],
    },
    data: {
      options: ["Música", "Pintura", "Teatro", "Danza"],
      correctIndex: 0,
    },
    explain: "Música obtuvo 40 votos, más que cualquier otra disciplina: es la más votada.",
  },
  {
    id: "ep-2-porcentajes",
    type: "numeric",
    title: "Votos en porcentaje",
    prompt: "Con los mismos datos (40 votos en total sobre 100 encuestados), calculá qué porcentaje representan <strong>Pintura y Danza juntas</strong> (25 + 25 votos).",
    data: {
      items: [{ label: "Porcentaje de Pintura + Danza", answer: 50, unit: "%" }],
    },
    explain: "Pintura es 25% y Danza es 25%. Juntas: 25% + 25% = 50%.",
  },
  {
    id: "ep-3-sorteo-astronautas",
    type: "numeric",
    title: "Sorteo de astronautas",
    prompt: "En la bolsa del sorteo hay 20 tarjetas: 5 de Rusia, 2 de Brasil, 8 de Argentina y 5 de Estados Unidos. Calculá cada probabilidad como porcentaje.",
    data: {
      items: [
        { label: "Probabilidad de que salga Brasil (2 de 20)", answer: 10, unit: "%" },
        { label: "Probabilidad de que salga Argentina (8 de 20)", answer: 40, unit: "%" },
      ],
    },
    explain: "Probabilidad = casos favorables ÷ casos posibles × 100. Brasil: 2÷20×100 = 10%. Argentina: 8÷20×100 = 40%.",
  },
  {
    id: "ep-4-mas-probable",
    type: "multiple-choice",
    title: "¿Qué es más probable?",
    prompt: "Al tirar un dado común (números del 1 al 6), ¿qué es más probable?",
    data: {
      options: [
        "Sacar un número par (2, 4 o 6)",
        "Sacar justo un 5",
        "Sacar un 7",
        "Son igual de probables",
      ],
      correctIndex: 0,
    },
    explain: "Hay 3 caras pares (2, 4 y 6) contra una sola cara con el 5, así que sacar un número par es más probable.",
  },
  {
    id: "ep-5-promedio",
    type: "numeric",
    title: "Promedio de ventas",
    prompt: "Las ventas de petunias en las últimas tres temporadas fueron 350, 250 y 300 plantas. Calculá el promedio.",
    data: {
      items: [{ label: "Promedio de ventas", answer: 300 }],
    },
    explain: "Se suman los tres valores y se divide entre 3: (350 + 250 + 300) = 900; 900 ÷ 3 = 300.",
  },
  {
    id: "ep-6-moda",
    type: "numeric",
    title: "La moda de las edades",
    prompt: "Estas son las edades de 10 chicos inscriptos para la jornada del barrio: 7, 9, 10, 9, 8, 10, 9, 7, 10, 9.",
    data: {
      items: [
        { label: "¿Cuál es la moda (el valor que más se repite)?", answer: 9 },
        { label: "¿Cuántas veces aparece el número 10 en la lista?", answer: 3 },
      ],
    },
    explain: "El 9 aparece 4 veces, más que cualquier otro valor: esa es la moda. El 10 aparece 3 veces.",
  },
];

Av5Engine.initActivityPage({
  topicId: "estadistica",
  topicTitle: "Estadística y Probabilidad",
  topicIcon: "🚀",
  topicDesc: "Gráficos de barras, promedio, moda y probabilidad.",
  activities: ACTIVITIES,
});
