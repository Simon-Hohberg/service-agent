import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { tentantDtoSchema } from './tenant-dto.js';

const userProperties = {
  id: { type: 'string' },
} as const satisfies Record<string, JSONSchema>;

export const userDtoSchema = {
  $id: 'user',
  type: 'object',
  properties: userProperties,
  additionalProperties: false,
  required: ['id'],
} as const satisfies JSONSchema;

export type UserDTO = FromSchema<typeof userDtoSchema>;

export const userWithTenantsDtoSchema = {
  $id: 'user',
  type: 'object',
  properties: {
    ...userProperties,
    tenants: {
      type: 'array',
      items: tentantDtoSchema,
    },
  },
  additionalProperties: false,
  required: ['id', 'tenants'],
} as const satisfies JSONSchema;

export type UserWithTenantsDTO = FromSchema<typeof userWithTenantsDtoSchema>;

export const createUserDtoSchema = {
  $id: 'user',
  type: 'object',
  properties: {
    ...userProperties,
    tenantId: {
      type: 'string',
    },
  },
  additionalProperties: false,
  required: ['id', 'tenantId'],
} as const satisfies JSONSchema;

export type CreateUserDTO = FromSchema<typeof createUserDtoSchema>;
