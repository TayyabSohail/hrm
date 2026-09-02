import { z } from 'zod';

export const policyCategorySchema = z.enum([
  'leave',
  'medical',
  'overtime',
  'general',
]);

export type PolicyCategoryInput = z.infer<typeof policyCategorySchema>;

export const DUPLICATE_CATEGORY_MESSAGE =
  'A policy document already exists for this category.';

export const createPolicySchema = z.object({
  title: z.string().trim().min(2, 'Enter a policy title').max(200),
  category: policyCategorySchema,
  contentHtml: z.string().trim().min(1, 'Add some content'),
});
export type CreatePolicyInput = z.infer<typeof createPolicySchema>;

export const publishPolicyVersionSchema = z.object({
  policyId: z.string().uuid(),
  bodyHtml: z.string().trim().min(1, 'Policy body cannot be empty'),
});
export type PublishPolicyVersionInput = z.infer<
  typeof publishPolicyVersionSchema
>;

export const deletePolicySchema = z.object({
  policyId: z.string().uuid(),
});
export type DeletePolicyInput = z.infer<typeof deletePolicySchema>;

export const acknowledgePolicySchema = z.object({
  policyVersionId: z.string().uuid(),
});
export type AcknowledgePolicyInput = z.infer<typeof acknowledgePolicySchema>;
