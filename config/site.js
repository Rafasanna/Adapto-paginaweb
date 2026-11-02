// Datos fijos del sitio: nombre, textos de bienvenida, contacto y menú.

export const site = {
  name: "ADAPTO",
  descriptor: "Recursos digitales",
  tagline: "Recursos terapéuticos listos para imprimir",
  description:
    "ADAPTO es un espacio de recursos terapéuticos digitales listos para imprimir, creados por Azu y Jaz, Licenciadas en Terapia Ocupacional. Para niños, adolescentes y adultos.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  logo: {
    full: "/brand/adapto-logo.svg", // letras + "Recursos digitales"
    letters: "/brand/adapto-letters.svg" // solo letras (header)
  },

  // Inicio: debajo del logo va primero "closing" (la bienvenida) y después "who".
  welcome: {
    who: "Somos Azu y Jaz, Licenciadas en Terapia Ocupacional.",
    hello: "¡Hola! Somos Azu y Jaz, Licenciadas en Terapia Ocupacional.",
    paragraphs: [
      "Creamos este espacio para compartir herramientas, ideas y recursos digitales que puedan acompañar y enriquecer las intervenciones con niños, adolescentes y adultos.",
      "Si sos mamá, papá, familiar o acompañante, ¡también vas a encontrar propuestas que pueden serte útiles!"
    ],
    closing: "¡Bienvenidos a ADAPTO! Un espacio para aprender, crear y encontrar recursos que acompañen cada etapa de la vida."
  },

  // Equipo. Las descripciones van cuando las tengan (vacío = no se muestra).
  team: [
    { name: "Azu", role: "Lic. en Terapia Ocupacional", photo: "/equipo/integrante-1.webp", bio: "" },
    { name: "Jaz", role: "Lic. en Terapia Ocupacional", photo: "/equipo/integrante-2.webp", bio: "" }
  ],

  contact: {
    // Formato internacional sin "+" ni espacios. Los pedidos llegan acá.
    whatsapp: "5493446525525",
    whatsappLabel: "+54 9 3446 52-5525",
    // Mensaje que se precarga al tocar el botón fijo de WhatsApp (y los "Escribinos")
    whatsappMessage: "Hola, ADAPTO. Vi la página y quería hacerles una consulta.",
    email: "",
    // Instagram profesionales de Azu y Jaz (se muestran al final del footer)
    instagrams: [
      { handle: "@lic.mazulsanna", url: "https://www.instagram.com/lic.mazulsanna/" },
      { handle: "@lic.jazminrodriguez", url: "https://www.instagram.com/lic.jazminrodriguez/" }
    ]
  },

  nav: [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/productos" },
    { label: "Nosotras", href: "/nosotras" },
    { label: "Cómo comprar", href: "/#como-comprar" }
  ]
};
