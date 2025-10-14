import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export const protocols = ['HTTP'] as const;
export type Protocol = (typeof protocols)[number];

export const serviceCallProperties = {
  id: { type: 'number' },
  name: { type: 'string' },
  scheduledAt: { type: 'string', format: 'date-time' },
  protocol: { type: 'string', enum: protocols },
  status: { type: 'string', enum: ['PENDING', 'EXECUTED', 'FAILED'] },
  submittedAt: { type: 'string', format: 'date-time' },
  executedAt: { type: 'string', format: 'date-time' },
  isFavorite: { type: 'boolean' },
} as const satisfies Record<string, JSONSchema>;

export const getServiceCallDtoSchema = {
  $id: 'serviceCall',
  type: 'object',
  properties: serviceCallProperties,
  additionalProperties: false,
  required: ['id', 'name', 'protocol', 'status', 'submittedAt', 'isFavorite'],
} as const satisfies JSONSchema;

export const getServiceCallsDtoSchema = {
  $id: 'httpServiceCall',
  type: 'array',
  items: getServiceCallDtoSchema,
} as const satisfies JSONSchema;

export type GetServiceCalls = FromSchema<typeof getServiceCallsDtoSchema>;
