import { describe, expect, it } from 'vitest';
import {
  ACTIVE_MODULES,
  CREDIT_COSTS,
  createGenerationSchema,
  PHASE7_MODULES,
} from '../src/index';

describe('plans and modules', () => {
  it('charges 5 credits for image modules', () => {
    expect(CREDIT_COSTS.THUMBNAIL).toBe(5);
    expect(CREDIT_COSTS.LOGO).toBe(5);
    expect(CREDIT_COSTS.CV).toBe(1);
  });

  it('includes all nine active modules', () => {
    expect(ACTIVE_MODULES).toHaveLength(9);
    expect(ACTIVE_MODULES).toEqual(
      expect.arrayContaining([...PHASE7_MODULES, 'SOCIAL', 'SEO'])
    );
  });

  it('accepts thumbnail generation payload', () => {
    const parsed = createGenerationSchema.parse({
      module: 'THUMBNAIL',
      input: { topic: 'launch video' },
    });
    expect(parsed.module).toBe('THUMBNAIL');
  });

  it('rejects unknown modules', () => {
    expect(() =>
      createGenerationSchema.parse({ module: 'UNKNOWN', input: {} })
    ).toThrow();
  });
});
