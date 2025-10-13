import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export const serviceCallProperties = {
  name: { type: 'string' },
  scheduledAt: { type: 'string', format: 'date-time' },
} as const satisfies Record<string, JSONSchema>;

type ServiceCallPropertiesType = keyof typeof serviceCallProperties;

export const requiredServiceCallProperties: ServiceCallPropertiesType[] = ['name'] as const;

export const getServiceCallProperties = {
  id: { type: 'number' },
  ...serviceCallProperties,
  protocol: { type: 'string', enum: ['HTTP'] },
  status: { type: 'string', enum: ['PENDING', 'EXECUTED', 'FAILED'] },
  submittedAt: { type: 'string', format: 'date-time' },
  executedAt: { type: 'string', format: 'date-time' },
  isFavorite: { type: 'boolean' },
} as const satisfies Record<string, JSONSchema>;

type GetServiceCallPropertiesType = keyof typeof getServiceCallProperties;

export const requiredGetServiceCallProperties: GetServiceCallPropertiesType[] = ['id', 'name'] as const;

export const ServiceCallDtoSchema = {
  $id: 'serviceCall',
  type: 'object',
  properties: {
    ...getServiceCallProperties,
  },
  additionalProperties: false,
  required: ['id', 'name', 'protocol', 'status', 'submittedAt', 'isFavorite'],
} as const satisfies JSONSchema;

export const getServiceCallsDtoSchema = {
  $id: 'httpServiceCall',
  type: 'array',
  items: ServiceCallDtoSchema,
} as const satisfies JSONSchema;

export type ServiceCalls = FromSchema<typeof getServiceCallsDtoSchema>;
