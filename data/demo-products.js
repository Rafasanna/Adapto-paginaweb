// Productos de EJEMPLO para ver el diseño mientras la base no está conectada.
// Apenas se configura DATABASE_URL dejan de mostrarse (ver lib/server/catalog.js).

const pages = (slug, count) =>
  Array.from({ length: count }, (_, index) => ({ url: `/demo/${slug}-${index + 1}.svg`, alt: `Página ${index + 1}` }));

const day = (n) => new Date(Date.UTC(2026, 9, n)).toISOString();

export const demoProducts = [
  {
    id: "demo-1",
    slug: "trazos-y-grafismos",
    name: "Trazos y grafismos: del punto a la letra",
    shortDescription: "Fichas para preparar la mano antes de escribir: zigzag, ondas, bucles y almenas.",
    description:
      "Una propuesta para trabajar el control del trazo de forma progresiva, desde líneas simples hasta los primeros grafismos que preparan la escritura.\n\nCada ficha marca el punto de inicio y la dirección, para que el niño pueda hacerlo con la mayor autonomía posible. Se pueden usar con lápiz, crayón o plastificadas con fibra al agua.",
    price: 4500,
    compareAtPrice: null,
    category: "actividades",
    subcategory: "escritura",
    previews: pages("trazos-y-grafismos", 3),
    pageCount: 18,
    format: "PDF",
    audiences: ["ninos"],
    featured: true,
    createdAt: day(28)
  },
  {
    id: "demo-2",
    slug: "abecedario-para-repasar",
    name: "Abecedario para repasar en imprenta mayúscula",
    shortDescription: "Todas las letras con modelo y renglones para repasar.",
    description:
      "Abecedario completo en imprenta mayúscula con una letra modelo grande y espacios para repasar con línea punteada.\n\nIdeal para acompañar el aprendizaje de la escritura en casa, en el consultorio o en la escuela.",
    price: 3800,
    compareAtPrice: null,
    category: "actividades",
    subcategory: "escritura",
    previews: pages("abecedario-para-repasar", 3),
    pageCount: 27,
    format: "PDF",
    audiences: ["ninos"],
    featured: false,
    createdAt: day(12)
  },
  {
    id: "demo-3",
    slug: "recortar-pegar-y-enhebrar",
    name: "Recortar, pegar y enhebrar: 20 fichas",
    shortDescription: "Figuras para recortar por la línea punteada y armar composiciones.",
    description:
      "Veinte fichas con figuras de distinta dificultad para trabajar el uso de la tijera, la coordinación bimanual y la precisión.\n\nIncluye una guía corta con sugerencias para graduar la actividad.",
    price: 5200,
    compareAtPrice: 6000,
    category: "actividades",
    subcategory: "motricidad-fina",
    previews: pages("recortar-pegar-y-enhebrar", 3),
    pageCount: 20,
    format: "PDF",
    audiences: ["ninos"],
    featured: true,
    createdAt: day(25)
  },
  {
    id: "demo-4",
    slug: "secuencia-lavado-de-manos",
    name: "Secuencia de lavado de manos con pictogramas",
    shortDescription: "Paso a paso visual para pegar cerca del lavamanos.",
    description:
      "Secuencia de 6 pasos con pictogramas para anticipar y ordenar el lavado de manos.\n\nViene en versión para recortar y en versión lámina, para pegar en el baño.",
    price: 2900,
    compareAtPrice: null,
    category: "actividades",
    subcategory: "avd",
    previews: pages("secuencia-lavado-de-manos", 2),
    pageCount: 6,
    format: "PDF",
    audiences: ["ninos", "adolescentes", "adultos"],
    featured: false,
    createdAt: day(20)
  },
  {
    id: "demo-5",
    slug: "mi-rutina-manana-y-noche",
    name: "Mi rutina de la mañana y la noche",
    shortDescription: "Tablero semanal para marcar lo que ya hiciste.",
    description:
      "Dos tableros semanales (mañana y noche) con tareas cotidianas y casilleros para marcar.\n\nAyuda a anticipar lo que viene, a sostener hábitos y a ganar autonomía.",
    price: 3500,
    compareAtPrice: null,
    category: "actividades",
    subcategory: "rutinas",
    previews: pages("mi-rutina-manana-y-noche", 3),
    pageCount: 8,
    format: "PDF",
    audiences: ["ninos"],
    featured: true,
    createdAt: day(30)
  },
  {
    id: "demo-6",
    slug: "aprendo-a-usar-el-dinero",
    name: "Aprendo a usar el dinero: billetes y compras",
    shortDescription: "Billetes para recortar y situaciones de compra para practicar.",
    description:
      "Material para trabajar el reconocimiento de billetes, el armado de montos y la resolución de situaciones de compra simples.\n\nPensado para adolescentes y adultos que están ganando autonomía en la comunidad.",
    price: 4800,
    compareAtPrice: null,
    category: "actividades",
    subcategory: "avdi",
    previews: pages("aprendo-a-usar-el-dinero", 2),
    pageCount: 14,
    format: "PDF",
    audiences: ["adolescentes", "adultos"],
    featured: true,
    createdAt: day(18)
  },
  {
    id: "demo-7",
    slug: "termometro-de-las-emociones",
    name: "El termómetro de las emociones",
    shortDescription: "Para ponerle nombre a lo que siento y elegir qué hacer.",
    description:
      "Un termómetro visual con cinco estados y tarjetas de estrategias para acompañar la autorregulación.\n\nSe puede usar en sesión, en el aula o en casa.",
    price: 3900,
    compareAtPrice: null,
    category: "actividades",
    subcategory: "autorregulacion",
    previews: pages("termometro-de-las-emociones", 2),
    pageCount: 10,
    format: "PDF",
    audiences: ["ninos", "adolescentes"],
    featured: false,
    createdAt: day(22)
  },
  {
    id: "demo-8",
    slug: "memoria-y-atencion-adultos",
    name: "Memoria, atención y secuencias para adultos",
    shortDescription: "Juegos de pares y secuencias con estética adulta.",
    description:
      "Cuadernillo de estimulación cognitiva con juegos de memoria, atención sostenida y secuencias, con una estética pensada para adultos y adultos mayores.",
    price: 5500,
    compareAtPrice: null,
    category: "actividades",
    subcategory: "estimulacion-cognitiva",
    previews: pages("memoria-y-atencion-adultos", 3),
    pageCount: 24,
    format: "PDF",
    audiences: ["adultos"],
    featured: false,
    createdAt: day(15)
  },
  {
    id: "demo-9",
    slug: "registro-de-seguimiento",
    name: "Registro de seguimiento terapéutico",
    shortDescription: "Planillas para ordenar objetivos, sesiones y avances.",
    description:
      "Guía con planillas editables e imprimibles para registrar objetivos, actividades y observaciones de cada sesión.\n\nPensada para profesionales que quieren tener el seguimiento ordenado y a mano.",
    price: 6000,
    compareAtPrice: null,
    category: "guias",
    subcategory: "seguimiento-terapeutico",
    previews: pages("registro-de-seguimiento", 2),
    pageCount: 12,
    format: "PDF",
    audiences: ["ninos", "adolescentes", "adultos"],
    featured: false,
    createdAt: day(10)
  }
];
