import { test, expect } from 'vitest';
import { run } from '../process';
test('shell', () => {
  expect(run('')).toBe(true);
});
