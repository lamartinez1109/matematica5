/**
 * Actividades del tema "Número y Operaciones".
 * Para sumar una actividad: agregá un objeto más a ACTIVITIES.
 * Tipos disponibles: multiple-choice | true-false | numeric | match | classify | sort
 */

const ACTIVITIES = [
  {
    id: "no-1-duraciones",
    type: "match",
    title: "Duraciones musicales",
    prompt: "Para armar la percusión del acto de fin de año, unan cada figura musical con la fracción de la redonda que representa su duración. Mirá el cuadro de referencia:",
    image: {
      src: "../img/duracion-notas.jpg",
      alt: "Cuadro con las figuras musicales redonda, blanca, negra, corchea y semicorchea, mostrando cuántas de cada una entran en una redonda completa.",
      caption: "Cuadro de duraciones que usó el profe Francisco.",
    },
    data: {
      pairs: [
        { left: "Redonda", right: "1" },
        { left: "Blanca", right: "1/2" },
        { left: "Negra", right: "1/4" },
        { left: "Corchea", right: "1/8" },
        { left: "Semicorchea", right: "1/16" },
      ],
    },
    explain: "Cada figura dura la mitad que la anterior: la redonda se parte al medio y da la blanca, la blanca al medio da la negra, y así siguiendo hasta la semicorchea.",
  },
  {
    id: "no-2-completar-ritmo",
    type: "true-false",
    title: "Completar el ritmo",
    prompt: "Un ritmo lleva una <strong>blanca</strong> (1/2) y una <strong>corchea</strong> (1/8). ¿Es correcto decir que, para llegar a una redonda completa, faltan <strong>3/8</strong>?",
    data: { correct: true },
    explain: "La blanca equivale a 4/8 y la corchea a 1/8: juntas suman 5/8. Como la redonda completa son 8/8, faltan 8/8 − 5/8 = 3/8.",
  },
  {
    id: "no-3-orden-semillas",
    type: "sort",
    title: "Semillas del vivero",
    prompt: "En el vivero registraron estas cantidades de semillas. Ordenalas de <strong>menor a mayor</strong> usando las flechas.",
    data: {
      items: ["89.940", "356.099", "356.210", "402.115"],
      correctOrder: [0, 1, 2, 3],
    },
    explain: "Primero se compara la cantidad de cifras y, si empatan, se compara cifra por cifra de izquierda a derecha: 89.940 < 356.099 < 356.210 < 402.115.",
  },
  {
    id: "no-4-leer-numero",
    type: "multiple-choice",
    title: "Leer números grandes",
    prompt: "¿Cómo se lee el número <strong>402.115</strong>, la cantidad de semillas de petunia que quedan en stock?",
    data: {
      options: [
        "Cuarenta mil doscientos once",
        "Cuatrocientos dos mil ciento quince",
        "Cuatro mil veintiún mil quince",
        "Cuatrocientos veinte mil ciento cinco",
      ],
      correctIndex: 1,
    },
    explain: "402.115 se separa en 402 mil + 115: cuatrocientos dos mil ciento quince.",
  },
  {
    id: "no-5-multiplicar-potencias",
    type: "numeric",
    title: "Multiplicar por 10, 100 y 1000",
    prompt: "Alberto prepara dosis de fertilizante. Resolvé cada multiplicación (podés usar coma para los decimales).",
    data: {
      items: [
        { label: "0,45 × 10 =", answer: 4.5 },
        { label: "0,08 × 100 =", answer: 8 },
        { label: "1,5 × 1000 =", answer: 1500 },
      ],
    },
    explain: "Al multiplicar por 10, 100 o 1000, la coma se corre uno, dos o tres lugares hacia la derecha.",
  },
  {
    id: "no-6-numeros-romanos",
    type: "multiple-choice",
    title: "Macetas con símbolos romanos",
    prompt: "Alberto quiere pintar el número <strong>123</strong> en una maceta usando números romanos. ¿Cuál es la forma correcta?",
    data: {
      options: ["CXXIII", "IIIXXC", "CXIII", "CCXIII"],
      correctIndex: 0,
    },
    explain: "123 = 100 + 20 + 3. En números romanos: 100 = C, 20 = XX, 3 = III. Se escriben de mayor a menor valor: C X X I I I.",
  },
];

Av5Engine.initActivityPage({
  topicId: "numero",
  topicTitle: "Número y Operaciones",
  topicIcon: "🔢",
  topicDesc: "Fracciones musicales, números grandes, potencias de 10 y sistemas de numeración.",
  activities: ACTIVITIES,
});
