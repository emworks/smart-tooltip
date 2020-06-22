import { TooltipContext } from 'src/types';

import MockApi from './mockApi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const get = (endpoint: string, context: TooltipContext): Promise<any> => {
  const getMockData = MockApi.get[endpoint];
  if (!getMockData) {
    Promise.reject(new Error('Not implemented'));
  }
  const data = getMockData(context);
  return Promise.resolve(data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const post = (endpoint: string, context: TooltipContext): Promise<any> => {
  const postMockData = MockApi.post[endpoint];
  if (!postMockData) {
    Promise.reject(new Error('Not implemented'));
  }
  const data = postMockData(context);
  return Promise.resolve(data);
};
