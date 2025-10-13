import { HttpHeaders } from 'common';
import { Prisma } from '../../../generated/client/index.js';

export function convertHttpHeaders(headers: Prisma.JsonValue) {
  if (headers === null) {
    return undefined;
  }
  if (typeof headers !== 'object') {
    return undefined;
  }
  if (Array.isArray(headers)) {
    return undefined;
  }
  return Object.entries(headers).reduce((res, e) => {
    if (typeof e[1] === 'string') {
      res[e[0]] = e[1];
    }
    return res;
  }, {} as HttpHeaders);
}
