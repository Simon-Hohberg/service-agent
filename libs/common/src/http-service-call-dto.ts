import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serviceCallProperties } from './service-call-dto.js';
import { omit } from './utils.js';

const headers = {
  type: 'object',
  patternProperties: {
    '^[a-zA-Z0-9-]+$': { type: 'string' },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

export type HttpHeaders = FromSchema<typeof headers>;

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;
export type HttpMethod = (typeof httpMethods)[number];

const body = { type: 'string' } as const satisfies JSONSchema;

const httpRequest = {
  type: 'object',
  properties: {
    url: { type: 'string', format: 'uri' },
    method: { type: 'string', enum: httpMethods },
    headers,
    body,
  },
  additionalProperties: false,
  required: ['url', 'method'],
} as const satisfies JSONSchema;

const httpResponse = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer', minimum: 100, maximum: 599 },
    headers,
    body,
  },
  required: [],
  additionalProperties: false,
} as const satisfies JSONSchema;

export const getHttpServiceCallDtoSchema = {
  $id: 'httpServiceCall',
  type: 'object',
  properties: {
    ...serviceCallProperties,
    request: httpRequest,
    response: httpResponse,
  },
  additionalProperties: false,
  required: ['name', 'request', 'response'],
} as const satisfies JSONSchema;

export type GetHttpServiceCallDTO = FromSchema<typeof getHttpServiceCallDtoSchema>;

export const createHttpServiceCallDtoSchema = {
  $id: 'createHttpServiceCall',
  type: 'object',
  properties: {
    ...omit(serviceCallProperties, ['id', 'protocol', 'status', 'submittedAt', 'executedAt']),
    request: httpRequest,
  },
  additionalProperties: false,
  required: ['name', 'request'],
} as const satisfies JSONSchema;

export type CreateHttpServiceCallDTO = FromSchema<typeof createHttpServiceCallDtoSchema>;
