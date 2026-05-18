import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionCard } from "./QuestionCard";

const CHOICES = [
  { value: 0, label: "Jamais" },
  { value: 4, label: "Très souvent" },
];

describe("QuestionCard", () => {
  it("affiche le texte de la question et toutes les choix", () => {
    render(
      <QuestionCard
        text="Êtes-vous concentré(e) ?"
        value={undefined}
        onChange={() => {}}
        choices={CHOICES}
      />,
    );
    expect(screen.getByText("Êtes-vous concentré(e) ?")).toBeInTheDocument();
    expect(screen.getByText("Jamais")).toBeInTheDocument();
    expect(screen.getByText("Très souvent")).toBeInTheDocument();
  });

  it("appelle onChange avec la valeur sélectionnée au clic", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <QuestionCard
        text="Q"
        value={undefined}
        onChange={onChange}
        choices={CHOICES}
      />,
    );
    await user.click(screen.getByText("Très souvent"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("surligne le choix actif", () => {
    render(
      <QuestionCard text="Q" value={4} onChange={() => {}} choices={CHOICES} />,
    );
    // `text-brand-900` n'est appliqué qu'au bouton sélectionné
    // (l'inactif a `text-brand-500` via hover seulement)
    const activeButton = screen.getByText("Très souvent").closest("button");
    expect(activeButton?.className).toMatch(/text-brand-900/);
    const inactiveButton = screen.getByText("Jamais").closest("button");
    expect(inactiveButton?.className).not.toMatch(/text-brand-900/);
  });
});
