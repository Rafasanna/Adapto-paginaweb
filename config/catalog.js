// Categorías y subcategorías de ADAPTO.
// Es la misma estructura que se carga en la base (docs/neon-schema.sql).
// Si la base no está conectada, el sitio usa esta lista.
//
// color: uno de los 5 colores del logo (purple · pink · green · yellow · teal)
// icon: nombre del ícono en components/site/TopicIcon.jsx

export const categories = [
  { slug: "actividades", name: "Actividades", color: "pink", sortOrder: 1 },
  { slug: "guias", name: "Guías", color: "teal", sortOrder: 2 }
];

export const subcategories = [
  { slug: "escritura", category: "actividades", name: "Escritura", color: "purple", icon: "escritura", sortOrder: 1 },
  { slug: "motricidad-fina", category: "actividades", name: "Motricidad fina", color: "pink", icon: "motricidad", sortOrder: 2 },
  {
    slug: "avd",
    category: "actividades",
    name: "AVD",
    longName: "Actividades de la vida diaria",
    detail: "Alimentación, higiene y cuidado personal, descanso y sueño",
    color: "green",
    icon: "avd",
    sortOrder: 3
  },
  {
    slug: "avdi",
    category: "actividades",
    name: "AVDI",
    longName: "Actividades instrumentales",
    detail: "Manejo del dinero",
    color: "yellow",
    icon: "dinero",
    sortOrder: 4
  },
  {
    slug: "autorregulacion",
    category: "actividades",
    name: "Autorregulación y emociones",
    longName: "Autorregulación y gestión de emociones",
    color: "teal",
    icon: "emociones",
    sortOrder: 5
  },
  { slug: "estimulacion-cognitiva", category: "actividades", name: "Estimulación cognitiva", color: "purple", icon: "cognitiva", sortOrder: 6 },
  { slug: "rutinas", category: "actividades", name: "Rutinas", color: "pink", icon: "rutinas", sortOrder: 7 },
  { slug: "seguimiento-terapeutico", category: "guias", name: "Seguimiento terapéutico", color: "green", icon: "seguimiento", sortOrder: 8 }
];

// Para quién es cada recurso (filtro "Para")
export const audiences = [
  { slug: "ninos", name: "Niños" },
  { slug: "adolescentes", name: "Adolescentes" },
  { slug: "adultos", name: "Adultos" }
];

export const sortOptions = [
  { value: "destacados", label: "Destacados" },
  { value: "nuevos", label: "Más nuevos" },
  { value: "menor-precio", label: "Menor precio" },
  { value: "mayor-precio", label: "Mayor precio" }
];
