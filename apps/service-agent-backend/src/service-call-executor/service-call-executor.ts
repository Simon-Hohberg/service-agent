import { Protocol } from '../../generated/client/client.js';
import { CreateServiceCallResult } from '../db/db.js';
import { executeHttpServiceCall } from './http-service-call-executor.js';

const serviceCallExecutorsMap = new Map<Protocol, (serviceCallData: CreateServiceCallResult) => Promise<any>>([
  ['HTTP', executeHttpServiceCall],
]);

export function executeServiceCall(serviceCallData: CreateServiceCallResult) {
  const executor = serviceCallExecutorsMap.get(serviceCallData.serviceCall.protocol);
  if (executor === undefined) {
    throw new Error('No executor found for protocol ' + serviceCallData.serviceCall.protocol);
  }
  return executor(serviceCallData);
}
