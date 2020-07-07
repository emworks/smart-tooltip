import { TooltipContext } from 'src/types';

import MockTooltipApi from './mockTooltipApi';
import MockEventApi from './mockEventApi';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createGet = (mockApi: any) => (endpoint: string, context: TooltipContext): Promise<any> => {
  const getMockData = mockApi.get[endpoint];
  if (!getMockData) {
    Promise.reject(new Error('Not implemented'));
  }
  const data = getMockData(context);
  return Promise.resolve(data);
};

export const getEvent = createGet(MockEventApi);

export const getTooltip = createGet(MockTooltipApi);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createPost = (mockApi: any) => (endpoint: string, context: TooltipContext): Promise<any> => {
  const postMockData = mockApi.post[endpoint];
  if (!postMockData) {
    Promise.reject(new Error('Not implemented'));
  }
  const data = postMockData(context);
  return Promise.resolve(data);
};

export const postTooltip = createPost(MockTooltipApi);
