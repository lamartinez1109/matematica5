/**
 * Actividades del tema "Geometría y Medida".
 * Para sumar una actividad: agregá un objeto más a ACTIVITIES.
 */

const ACTIVITIES = [
  {
    id: "gm-1-prismas-piramides",
    type: "classify",
    title: "Prismas y pirámides del laberinto flúor",
    prompt: "Para el laberinto flúor hay que separar los cuerpos en dos grupos. Elegí un cuerpo y después tocá la caja donde va.",
    data: {
      bins: ["Prisma", "Pirámide"],
      items: [
        { label: "Cubo", bin: "Prisma" },
        { label: "Prisma triangular", bin: "Prisma" },
        { label: "Pirámide cuadrangular", bin: "Pirámide" },
        { label: "Prisma pentagonal", bin: "Prisma" },
        { label: "Pirámide triangular", bin: "Pirámide" },
        { label: "Prisma hexagonal", bin: "Prisma" },
      ],
    },
    explain: "Un prisma tiene dos bases iguales y paralelas, unidas por caras laterales rectangulares. Una pirámide tiene una única base y caras laterales triangulares que se juntan en un vértice.",
  },
  {
    id: "gm-2-caras",
    type: "numeric",
    title: "Caras de los cuerpos",
    prompt: "Contá cuántas caras en total tiene cada cuerpo geométrico.",
    data: {
      items: [
        { label: "¿Cuántas caras tiene un prisma de base pentagonal?", answer: 7 },
        { label: "¿Cuántas caras tiene una pirámide de base cuadrada?", answer: 5 },
      ],
    },
    explain: "El prisma pentagonal tiene 2 bases + 5 caras laterales = 7 caras. La pirámide de base cuadrada tiene 1 base + 4 caras triangulares = 5 caras.",
  },
  {
    id: "gm-3-desarrollo-plano",
    type: "multiple-choice",
    title: "Desarrollo plano (molde)",
    prompt: "Tomás diseña un molde de cartón formado por <strong>2 triángulos y 3 rectángulos</strong>. ¿Qué cuerpo se arma con ese molde?",
    data: {
      options: ["Prisma triangular", "Pirámide triangular", "Cubo", "Prisma pentagonal"],
      correctIndex: 0,
    },
    explain: "Un prisma triangular tiene 2 bases triangulares y 3 caras laterales rectangulares: exactamente ese molde.",
  },
  {
    id: "gm-4-capacidad",
    type: "numeric",
    title: "Unidades de capacidad en el vivero",
    prompt: "Completá las equivalencias de capacidad que Alberto usa para preparar el riego.",
    data: {
      items: [
        { label: "3 litros = ____ decilitros", answer: 30 },
        { label: "250 mililitros = ____ litros", answer: 0.25, unit: "l" },
        { label: "1,5 litros = ____ centilitros", answer: 150 },
      ],
    },
    explain: "1 litro = 10 decilitros = 100 centilitros = 1000 mililitros.",
  },
  {
    id: "gm-5-perimetro-area",
    type: "numeric",
    title: "Cartel del vivero",
    prompt: "Un cartel rectangular mide 6 m de largo por 4 m de ancho. Calculá:",
    data: {
      items: [
        { label: "Perímetro (en metros)", answer: 20 },
        { label: "Área (en metros cuadrados)", answer: 24, unit: "m²" },
      ],
    },
    explain: "Perímetro = 2 × (largo + ancho) = 2 × (6+4) = 20 m. Área = largo × ancho = 6 × 4 = 24 m².",
  },
  {
    id: "gm-6-vistas",
    type: "multiple-choice",
    title: "Vistas del rover",
    prompt: "Un cuerpo se ve como un triángulo desde un costado, y como un cuadrado tanto desde arriba como desde abajo. ¿Qué cuerpo es?",
    data: {
      options: ["Pirámide de base cuadrada", "Cubo", "Prisma cuadrangular", "Cono"],
      correctIndex: 0,
    },
    explain: "La base cuadrada se ve igual desde arriba y desde abajo, y la vista lateral triangular corresponde a las caras que suben hasta el vértice: es una pirámide de base cuadrada.",
  },
];

Av5Engine.initActivityPage({
  topicId: "geometria",
  topicTitle: "Geometría y Medida",
  topicIcon: "📐",
  topicDesc: "Cuerpos geométricos, unidades de capacidad, perímetro y área.",
  activities: ACTIVITIES,
});
