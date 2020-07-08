import App from 'src/components/App';
import 'src/assets/styles/global.scss';

const USER_ATTR = 'data-user';

try {
  const script = document.querySelectorAll(`[${USER_ATTR}]`)[0];
  const user = script?.getAttribute(USER_ATTR) || '';

  new App({ user }).init();
} catch (err) {
  console.warn(err);
}
