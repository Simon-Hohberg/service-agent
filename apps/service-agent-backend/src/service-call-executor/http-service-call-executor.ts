import { Prisma, ServiceCallStatus } from '../../generated/client/index.js';
import {
  CreateServiceCallResult,
  ServiceCallPersistence,
  serviceCallPersistence,
} from '../db/service-call-persistence.js';

export class ServiceCallExecutor {
  // This class can be expanded in the future for more protocols

  constructor(private _serviceCallPersistence: ServiceCallPersistence = serviceCallPersistence) {}

  async executeHttpServiceCall(serviceCallData: CreateServiceCallResult) {
    console.log(
      `Executing HTTP service call to ${serviceCallData.details.url} with method ${serviceCallData.details.method}`
    );
    let response: Prisma.HttpServiceCallDetailsUpdateInput | undefined;
    let status: ServiceCallStatus = 'EXECUTED';
    if (serviceCallData.details.url.startsWith('http://example.com')) {
      // Simulate a response
      response = {
        responseCode: 200,
        responseHeaders: { 'Content-Type': 'application/json' },
        responseBody: '{"message": "Success"}',
      };
    } else {
      // Actual HTTP call
      const headers = new Headers();
      if (serviceCallData.details.requestHeaders) {
        for (const [key, value] of Object.entries(serviceCallData.details.requestHeaders)) {
          headers.append(key, value);
        }
      }
      try {
        const fetchResult = await fetch(serviceCallData.details.url, {
          method: serviceCallData.details.method,
          headers,
          body: serviceCallData.details.requestBody || undefined,
        });
        response = {
          responseCode: fetchResult.status,
          responseHeaders: Object.fromEntries(fetchResult.headers.entries()),
          responseBody: await fetchResult.text(),
        };
      } catch (error) {
        status = 'FAILED';
      }
    }

    await this._serviceCallPersistence.updateServiceCall(serviceCallData.serviceCall.id, {
      executedAt: new Date(),
      status,
      httpDetails:
        response !== undefined
          ? {
              update: response,
            }
          : undefined,
    });
    return response;
  }
}

export const serviceCallExecutor = new ServiceCallExecutor();
