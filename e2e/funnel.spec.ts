import { test, expect } from "@playwright/test";

test.describe("Funnel ASRS", () => {
  test("low-signal path : intro → 6 'Jamais' → résultat faible → arrêt", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Comprendre votre fonctionnement attentionnel/i,
      }),
    ).toBeVisible();

    await page.getByRole("button", { name: /Commencer le screening/i }).click();

    // 6 questions de l'ASRS Partie A — toujours répondre "Jamais"
    for (let i = 0; i < 6; i++) {
      await expect(page.getByText(`${i + 1} / 6`)).toBeVisible();
      await page.getByRole("button", { name: "Jamais", exact: true }).click();
      const nextLabel = i === 5 ? /Voir mon résultat/i : /Suivant/i;
      await page.getByRole("button", { name: nextLabel }).click();
    }

    await expect(page.getByText(/Signal faible/i)).toBeVisible();

    // Avec un signal faible, le CTA principal reste possible mais reformulé
    await expect(
      page.getByRole("button", { name: /S'arrêter ici/i }),
    ).toBeVisible();
  });

  test("high-signal path : flow complet jusqu'au résultat détaillé par axe", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Commencer le screening/i }).click();

    // 6 questions — toujours répondre "Très souvent" pour déclencher un signal élevé
    for (let i = 0; i < 6; i++) {
      await page
        .getByRole("button", { name: "Très souvent", exact: true })
        .click();
      const nextLabel = i === 5 ? /Voir mon résultat/i : /Suivant/i;
      await page.getByRole("button", { name: nextLabel }).click();
    }

    await expect(page.getByText(/Signal élevé/i)).toBeVisible();
    await page
      .getByRole("button", { name: /Compléter le questionnaire/i })
      .click();

    // Partie B — 12 questions supplémentaires
    for (let i = 0; i < 12; i++) {
      await page
        .getByRole("button", { name: "Très souvent", exact: true })
        .click();
      const nextLabel = i === 11 ? /Continuer/i : /Suivant/i;
      await page.getByRole("button", { name: nextLabel }).click();
    }

    // 5 questions contextuelles — "Énormément"
    for (let i = 0; i < 5; i++) {
      await page
        .getByRole("button", { name: "Énormément", exact: true })
        .click();
      const nextLabel = i === 4 ? /Voir mon profil/i : /Suivant/i;
      await page.getByRole("button", { name: nextLabel }).click();
    }

    // Page de résultat complète
    await expect(
      page.getByRole("heading", { name: /Profil attentionnel/i }),
    ).toBeVisible();
    await expect(page.getByText("Attention")).toBeVisible();
    await expect(page.getByText("Organisation / exécution")).toBeVisible();
    await expect(page.getByText("Impulsivité / agitation")).toBeVisible();
    await expect(page.getByText("Impact fonctionnel global")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Recommandations/i })).toBeVisible();

    // Rappel non-diagnostic doit être visible sur la page finale
    await expect(page.getByText(/ne constitue pas un diagnostic/i)).toBeVisible();
  });

  test("navigation 'Retour' fonctionne dans le flow du screener", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Commencer le screening/i }).click();

    await page.getByRole("button", { name: "Parfois", exact: true }).click();
    await page.getByRole("button", { name: /Suivant/i }).click();
    await expect(page.getByText("2 / 6")).toBeVisible();

    await page.getByRole("button", { name: /← Retour/ }).click();
    await expect(page.getByText("1 / 6")).toBeVisible();
  });
});
