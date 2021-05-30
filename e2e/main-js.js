import { unhandler } from '@tuplo/unhandler';

unhandler({
  appName: 'my-app-1',
  providers: {
    github: {
      user: 'tuplo',
      repo: 'unhandler',
      token: 'secret-token-xxxxxxx',
    },
  },
});

export const testUnhandler = unhandler;
