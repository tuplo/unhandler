import { testUnhandler } from './main-ts';

it('is testable with Jest and TypeScript', () => {
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
