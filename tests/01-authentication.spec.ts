import { expect, test } from '@playwright/test';
import { loginAs, resetDatabase } from './helpers';

test.beforeEach(() => {
  resetDatabase();
});

test('login page loads for unauthenticated user', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Passkey Sign In')).toBeVisible();
});

test('protected root redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});

test('authenticated user visiting login is redirected home', async ({ page }) => {
  await loginAs(page, 'copilot-test-user');
  await page.goto('/login');
  await expect(page).toHaveURL(/\/$/);
});
