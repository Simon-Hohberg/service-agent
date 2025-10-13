import { ServiceCallExecutor } from './http-service-call-executor';
import { ServiceCallPersistence } from '../db/service-call-persistence';
import { prismaTestingClient, prismaTestingHelper } from '../db/prisma-testing-client.js';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('executeHttpServiceCall', () => {
  let serviceCallPersistence: ServiceCallPersistence;
  let serviceCallExecutor: ServiceCallExecutor;

  const baseServiceCallData = {
    serviceCall: { id: 123 },
    details: {
      url: '',
      method: 'GET',
      requestHeaders: undefined,
      requestBody: undefined,
    },
  };

  beforeEach(async () => {
    serviceCallPersistence = {
      updateServiceCall: jest.fn(),
    } as unknown as ServiceCallPersistence;
    serviceCallExecutor = new ServiceCallExecutor(serviceCallPersistence);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should simulate response for example.com and update status to EXECUTED', async () => {
    const serviceCallData = {
      ...baseServiceCallData,
      details: {
        ...baseServiceCallData.details,
        url: 'http://example.com/api',
      },
    };

    const result = await serviceCallExecutor.executeHttpServiceCall(serviceCallData as any);

    expect(result).toEqual({
      responseCode: 200,
      responseHeaders: { 'Content-Type': 'application/json' },
      responseBody: '{"message": "Success"}',
    });
    expect(serviceCallPersistence.updateServiceCall).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        status: 'EXECUTED',
        httpDetails: {
          update: {
            responseCode: 200,
            responseHeaders: { 'Content-Type': 'application/json' },
            responseBody: '{"message": "Success"}',
          },
        },
      })
    );
  });

  it('should perform actual HTTP call for non-example.com URL and update status to EXECUTED', async () => {
    const responseMock = () =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: async () => 'response body',
        headers: { get: (key: string) => (key === 'x-custom' ? 'abc' : null), entries: () => [['x-custom', 'abc']] },
      } as unknown as Response);
    jest.spyOn(global, 'fetch').mockImplementation(responseMock);

    const serviceCallData = {
      ...baseServiceCallData,
      details: {
        ...baseServiceCallData.details,
        url: 'http://other.com/api',
        method: 'POST',
        requestHeaders: { 'x-header': 'value' },
        requestBody: 'body',
      },
    };

    const result = await serviceCallExecutor.executeHttpServiceCall(serviceCallData as any);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://other.com/api',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
        body: 'body',
      })
    );
    expect(result).toEqual({
      responseCode: 200,
      responseHeaders: { 'x-custom': 'abc' },
      responseBody: 'response body',
    });
    expect(serviceCallPersistence.updateServiceCall).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        status: 'EXECUTED',
        httpDetails: {
          update: {
            responseCode: 200,
            responseHeaders: { 'x-custom': 'abc' },
            responseBody: 'response body',
          },
        },
      })
    );
  });

  it('should set status to FAILED if fetch throws', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    const serviceCallData = {
      ...baseServiceCallData,
      details: {
        ...baseServiceCallData.details,
        url: 'http://fail.com/api',
      },
    };

    const result = await serviceCallExecutor.executeHttpServiceCall(serviceCallData as any);

    expect(result).toBeUndefined();
    expect(serviceCallPersistence.updateServiceCall).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        status: 'FAILED',
        httpDetails: undefined,
      })
    );
  });

  it('should handle missing requestHeaders and requestBody gracefully', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      status: 204,
      headers: {
        entries: () => [],
      },
      text: () => Promise.resolve(''),
    } as any);

    const serviceCallData = {
      ...baseServiceCallData,
      details: {
        url: 'http://other.com/api',
        method: 'GET',
      },
    };

    const result = await serviceCallExecutor.executeHttpServiceCall(serviceCallData as any);

    expect(result).toEqual({
      responseCode: 204,
      responseHeaders: {},
      responseBody: '',
    });
    expect(serviceCallPersistence.updateServiceCall).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        status: 'EXECUTED',
        httpDetails: {
          update: {
            responseCode: 204,
            responseHeaders: {},
            responseBody: '',
          },
        },
      })
    );
  });
});
