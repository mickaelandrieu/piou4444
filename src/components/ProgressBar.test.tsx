import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("affiche le label, le current/total et le pourcentage", () => {
    const { container } = render(
      <ProgressBar current={3} total={10} label="Screening" />,
    );
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("3 / 10")).toBeInTheDocument();
    const fill = container.querySelector('[style*="width"]');
    expect(fill?.getAttribute("style")).toContain("30%");
  });

  it("utilise 'Progression' comme label par défaut", () => {
    render(<ProgressBar current={1} total={5} />);
    expect(screen.getByText("Progression")).toBeInTheDocument();
  });

  it("ne plante pas avec total=0", () => {
    const { container } = render(<ProgressBar current={0} total={0} />);
    const fill = container.querySelector('[style*="width"]');
    expect(fill?.getAttribute("style")).toContain("0%");
  });
});
