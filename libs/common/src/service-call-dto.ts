import { JSONSchema } from 'json-schema-to-ts';

export const serviceCallProperties = {
  name: { type: 'string' },
  scheduledAt: { type: 'string', format: 'date-time' },
} as const satisfies Record<string, JSONSchema>;

type ServiceCallPropertiesType = keyof typeof serviceCallProperties;

export const requiredServiceCallProperties: ServiceCallPropertiesType[] = ['name'] as const;

export const getServiceCallProperties = {
  id: { type: 'string' },
  ...serviceCallProperties,
} as const satisfies Record<string, JSONSchema>;

type GetServiceCallPropertiesType = keyof typeof getServiceCallProperties;

export const requiredGetServiceCallProperties: GetServiceCallPropertiesType[] = ['id', 'name'] as const;
