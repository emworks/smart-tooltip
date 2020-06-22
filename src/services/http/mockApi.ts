import { api } from 'src/variables';
import { TooltipPosition, Tooltip, TooltipContext } from 'src/types';

// eslint-disable-next-line no-underscore-dangle
const _data = [
  {
    id: 1,
    content: 'Эта кнопка сразу появляется на странице',
    selector: '#first',
    sort: 100,
    user: 'admin',
    host: 'http://localhost:9000',
    uri: '/',
    isVisible: true,
    position: TooltipPosition.RIGHT,
  },
  {
    id: 2,
    content: 'А эта - спустя некоторое время',
    selector: '#second',
    sort: 200,
    user: 'admin',
    host: 'http://localhost:9000',
    uri: '/',
    isVisible: true,
  },
  {
    id: 3,
    content: 'string 3',
    selector: '#third',
    sort: 300,
    user: 'admin 2',
    host: 'http://localhost:9000',
    uri: '/',
    isVisible: true,
  },
  {
    id: 4,
    content: 'Приветики всем на этой странице',
    selector: '#react-app',
    sort: 400,
    user: 'admin',
    host: 'https://menu.epam.com',
    uri: '/app',
    isVisible: true,
  },
];

class MockApi {
  data!: Array<Tooltip>;

  key = 'mockData';

  constructor(data) {
    this.data = data;
    if (localStorage) {
      const mockData = localStorage.getItem(this.key);
      if (mockData) {
        this.data = JSON.parse(mockData);
      } else {
        localStorage.setItem(this.key, JSON.stringify(this.data));
      }
    }
    this.filter = this.filter.bind(this);
  }

  filter = (data) => (user, host, uri) =>
    data.filter((item) => item.user === user && item.host === host && item.uri === uri);

  get = {
    [api.tooltip]: ({ user, host, uri }: TooltipContext) =>
      this.filter(this.data)(user, host, uri)
        .filter((item) => item.user === user && item.host === host && item.uri === uri && !!item.isVisible)
        .sort((a, b) => a.sort - b.sort),
  };

  post = {
    [api.tooltip]: ({ user, host, uri }: TooltipContext) => {
      if (localStorage) {
        const mockData = localStorage.getItem(this.key);
        if (mockData) {
          const data = JSON.parse(mockData);
          // eslint-disable-next-line array-callback-return
          this.filter(data)(user, host, uri).map((item) => {
            item.isVisible = false;
          });
          localStorage.setItem(this.key, JSON.stringify(data));
        }
      }
      return 'OK';
    },
  };
}

export default new MockApi(_data);
