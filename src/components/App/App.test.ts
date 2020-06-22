import App from '.';

describe('App', () => {
  it('initializes', () => {
    const user = 'user';
    const app = new App({ user });
    expect(app.context).toHaveProperty('user');
    expect(app.context.user).toEqual(user);
  });
});
