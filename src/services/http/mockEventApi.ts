import { api } from 'src/variables';
import { TooltipEvent, DOMEventMap, CustomEventMap, TooltipContext } from 'src/types';

// eslint-disable-next-line no-underscore-dangle
const _data: Array<TooltipEvent> = [
  {
    id: '1',
    eventType: DOMEventMap.CLICK,
    source: '#first',
    trigger: CustomEventMap.TOOLTIP_SHOW,
    target: '1',
    user: 'admin',
    host: 'http://localhost:9000',
    uri: '/',
  },
  {
    id: '2',
    eventType: CustomEventMap.TOOLTIP_VISIBLE,
    source: '2',
    trigger: DOMEventMap.CLICK,
    target: '#zero',
    user: 'admin',
    host: 'http://localhost:9000',
    uri: '/',
  },
];

class MockTooltipApi<TData> {
  data!: Array<TData>;

  constructor(data: Array<TData>) {
    this.data = data;
    this.filter = this.filter.bind(this);
  }

  filter = (data) => (user, host, uri) =>
    data.filter((item) => item.user === user && item.host === host && item.uri === uri);

  get = {
    [api.event]: ({ user, host, uri }: TooltipContext) => this.filter(this.data)(user, host, uri),
  };
}

export default new MockTooltipApi<TooltipEvent>(_data);
