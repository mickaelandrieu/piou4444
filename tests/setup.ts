import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Nettoyage du DOM entre chaque test — auto-cleanup n'est pas activé
// avec Vitest comme il l'est avec Jest, il faut l'enregistrer ici.
afterEach(() => {
  cleanup();
});
