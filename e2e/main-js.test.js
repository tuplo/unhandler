import { testUnhandler } from './main-js';

it('is testable with Jest and JavaScript', () => {
  testUnhandler({
    appName: 'my-app-1',
    providers: {
      github: {
        user: 'tuplo',
        repo: 'unhandler',
        token: 'secret-token-xxxxxxx',
      },
    },
  });

  expect(true).toBe(true);
});
