import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export const tentantDtoSchema = {
  $id: 'tenant',
  type: 'object',
  properties: {
    id: { type: 'string' },
  },
  additionalProperties: false,
  required: ['id'],
} as const satisfies JSONSchema;

export type TenantDTO = FromSchema<typeof tentantDtoSchema>;
