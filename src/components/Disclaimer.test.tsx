import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Disclaimer } from "./Disclaimer";

describe("Disclaimer", () => {
  it("affiche le texte d'avertissement médical complet", () => {
    render(<Disclaimer />);
    expect(screen.getByText(/Avertissement/i)).toBeInTheDocument();
    expect(
      screen.getByText(/auto-évaluation basé sur l'ASRS v1.1, non médical/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Ne constitue ni un diagnostic/i),
    ).toBeInTheDocument();
  });

  it("rend une version compacte quand compact=true", () => {
    const { container } = render(<Disclaimer compact />);
    expect(container.querySelector(".text-xs")).toBeTruthy();
  });

  it("rend la version normale par défaut", () => {
    const { container } = render(<Disclaimer />);
    expect(container.querySelector(".text-sm")).toBeTruthy();
  });
});
