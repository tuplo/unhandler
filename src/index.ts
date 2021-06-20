import type { Response } from 'node-fetch';
import * as github from './github';

type UnhandlerError = Error & { body?: unknown };

type Providers = {
  github?: github.GitHubOptions;
};

type UnhandlerOptions = {
  appName?: string;
  providers: Providers;
};

export async function submitError(
  error: UnhandlerError,
  options: UnhandlerOptions
): Promise<Response | null> {
  const { appName, providers } = options;
  let tracker;
  let trackerOptions;
  if ('github' in providers) {
    tracker = github;
    trackerOptions = providers.github as github.GitHubOptions;
  }
  if (!tracker || !trackerOptions) return null;

  const { labels = ['bug'] } = trackerOptions || {};

  return tracker.createIssue(
    {
      title: [appName && `[${appName}]`, error.message].join(' '),
      labels,
      body: `\`\`\`\n${error.body || error.stack}\n\`\`\``,
    },
    trackerOptions
  );
}

type UncaughtHandlerFn = (
  options: UnhandlerOptions
) => (error: Error) => Promise<Response | null>;
export const uncaughtHandlerFn: UncaughtHandlerFn =
  (options) =>
  (error: UnhandlerError): Promise<Response | null> =>
    submitError(error, options);

export function unhandler(options: UnhandlerOptions): void {
  const uncaughtHandler = uncaughtHandlerFn(options);
  process.on('uncaughtException', uncaughtHandler);
  process.on('unhandledRejection', (reason) => {
    throw reason;
  });
}
