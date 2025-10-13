import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { requiredServiceCallProperties, serviceCallProperties } from './service-call-dto.js';

const httpMessageBasicProperties = {
  headers: {
    type: 'object',
    patternProperties: {
      '^[a-zA-Z0-9-]+$': { type: 'string' },
    },
    additionalProperties: false,
  },
  body: { type: 'string' },
} as const satisfies Record<string, JSONSchema>;

const httpRequest = {
  type: 'object',
  properties: {
    url: { type: 'string', format: 'uri' },
    method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
    ...httpMessageBasicProperties,
  },
  additionalProperties: false,
  required: ['url', 'method'],
} as const satisfies JSONSchema;

const httpResponse = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer', minimum: 100, maximum: 599 },
    ...httpMessageBasicProperties,
  },
  required: ['statusCode'],
  additionalProperties: false,
} as const satisfies JSONSchema;

export const httpServiceCallDtoSchema = {
  $id: 'httpServiceCall',
  type: 'object',
  properties: {
    ...serviceCallProperties,
    protocol: { type: 'string', const: 'HTTP' },
    request: httpRequest,
    response: httpResponse,
  },
  additionalProperties: false,
  required: [...requiredServiceCallProperties, 'request', 'response'],
} as const satisfies JSONSchema;

export type HttpServiceCall = FromSchema<typeof httpServiceCallDtoSchema>;

export const createHttpServiceCallDtoSchema = {
  $id: 'createHttpServiceCall',
  type: 'object',
  properties: {
    ...serviceCallProperties,
    request: httpRequest,
  },
  additionalProperties: false,
  required: [...requiredServiceCallProperties, 'request'],
} as const satisfies JSONSchema;

export type CreateHttpServiceCall = FromSchema<typeof createHttpServiceCallDtoSchema>;
