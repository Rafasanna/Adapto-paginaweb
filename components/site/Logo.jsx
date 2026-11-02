import Image from "next/image";
import { site } from "@/config/site";

// Logo oficial (vector extraído del PDF de marca).
// variant="full" → letras + "Recursos digitales" · variant="letters" → solo letras
export function Logo({ variant = "full", className, priority = false, alt = "ADAPTO · Recursos digitales" }) {
  const src = variant === "letters" ? site.logo.letters : site.logo.full;
  const [width, height] = variant === "letters" ? [650, 120] : [650, 180];
  return <Image src={src} alt={alt} width={width} height={height} priority={priority} unoptimized className={className} />;
}
