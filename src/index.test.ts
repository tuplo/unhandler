import type { UnhandlerError, UnhandlerOptions } from './index';
import { submitError, uncaughtHandlerFn } from './index';

const githubCreateIssueSpy = jest.fn().mockResolvedValue(null);

jest.mock('./github', () => ({
  __esModule: true,
  createIssue: (error: UnhandlerError, options: UnhandlerOptions) =>
    githubCreateIssueSpy(error, options),
}));

describe('unhandler', () => {
  afterEach(() => {
    githubCreateIssueSpy.mockClear();
  });

  afterAll(() => {
    githubCreateIssueSpy.mockRestore();
  });

  it('submits an error', async () => {
    const error = new Error('foo');
    await submitError(error, {
      appName: 'app-name',
      providers: {
        github: { user: 'foo', repo: 'foo/bar', token: 'secret-token' },
      },
    });

    const expected = {
      title: '[app-name] foo',
      labels: ['bug'],
    };
    expect(githubCreateIssueSpy).toHaveBeenCalledTimes(1);
    const [payload] = githubCreateIssueSpy.mock.calls[0];
    expect(payload).toMatchObject(expected);
  });

  it('handles an exception - github', () => {
    const error = new Error('foo');
    const uncaughtHandler = uncaughtHandlerFn({
      appName: 'app-name',
      providers: {
        github: { user: 'foo', repo: 'foo/bar', token: 'secret' },
      },
    });
    uncaughtHandler(error);

    expect(githubCreateIssueSpy).toHaveBeenCalledTimes(1);
    const [payload] = githubCreateIssueSpy.mock.calls[0];
    expect(payload).toMatchObject({
      title: '[app-name] foo',
      labels: ['bug'],
    });
  });

  it('handles an exception with a custom body', () => {
    class FooError extends Error {
      public body: string;

      constructor(message: string, body: string) {
        super(message);
        this.body = body;
      }
    }
    const error = new FooError('foo', 'bar baz buz');
    const uncaughtHandler = uncaughtHandlerFn({
      appName: 'app-name',
      providers: {
        github: { user: 'foo', repo: 'foo/bar', token: 'secret' },
      },
    });
    uncaughtHandler(error);

    expect(githubCreateIssueSpy).toHaveBeenCalledTimes(1);
    const [payload] = githubCreateIssueSpy.mock.calls[0];
    expect(payload).toMatchObject({
      title: '[app-name] foo',
      labels: ['bug'],
      body: '```\nbar baz buz\n```',
    });
  });
});
