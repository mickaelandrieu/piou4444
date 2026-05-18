import { test, expect } from "@playwright/test";

test.describe("Disclaimer médical permanent (CLAUDE.md §5)", () => {
  test("affiché sur la landing et dans le footer", async ({ page }) => {
    await page.goto("/");
    // Texte canonique du composant Disclaimer
    await expect(
      page.getByText(/auto-évaluation basé sur l'ASRS v1.1, non médical/i),
    ).toBeVisible();
    // Footer
    await expect(
      page.getByText(/ne remplace pas l'évaluation d'un professionnel/i),
    ).toBeVisible();
  });

  test("présent à chaque étape du screener", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Commencer le screening/i }).click();

    // Le disclaimer compact doit être visible au-dessus de la question
    await expect(page.getByText(/Avertissement/i).first()).toBeVisible();

    // Avance d'une question pour vérifier que le disclaimer reste
    await page.getByRole("button", { name: "Parfois", exact: true }).click();
    await page.getByRole("button", { name: /Suivant/i }).click();
    await expect(page.getByText(/Avertissement/i).first()).toBeVisible();
  });

  test("présent sur l'écran de résultat du screener", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Commencer le screening/i }).click();

    for (let i = 0; i < 6; i++) {
      await page.getByRole("button", { name: "Jamais", exact: true }).click();
      const nextLabel = i === 5 ? /Voir mon résultat/i : /Suivant/i;
      await page.getByRole("button", { name: nextLabel }).click();
    }

    // Sur l'écran de résultat le composant Disclaimer (version pleine)
    // est rendu en bas — le mot "Avertissement" doit apparaître au moins une fois
    await expect(page.getByText(/Avertissement/i).first()).toBeVisible();
  });
});
