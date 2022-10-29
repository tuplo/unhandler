import type { Response } from '@tuplo/fetch';

import * as github from './github';
import type { IGitHubOptions } from './github';

export interface IUnhandlerError extends Error {
	body?: unknown;
}

interface IProviders {
	github?: IGitHubOptions;
}

export interface IUnhandlerOptions {
	appName?: string;
	onBeforeSubmitError?: (error: Error) => void | Promise<void>;
	providers: IProviders;
}

export async function submitError(
	error: IUnhandlerError,
	options: IUnhandlerOptions
) {
	const { appName, providers } = options;
	let tracker;
	let trackerOptions;
	if ('github' in providers) {
		tracker = github;
		trackerOptions = providers.github as IGitHubOptions;
	}
	if (!tracker || !trackerOptions) return null;

	const [title] = error.message?.split('\n') || ['Unknown error'];
	const { labels = ['bug'] } = trackerOptions || {};

	return tracker.createIssue(
		{
			title: [appName && `[${appName}]`, title].join(' '),
			labels,
			body: `\`\`\`\n${error.body || error.stack}\n\`\`\``,
		},
		trackerOptions
	);
}

export function uncaughtHandlerFn(options: IUnhandlerOptions) {
	return async (error: IUnhandlerError): Promise<Response | null> => {
		const { onBeforeSubmitError } = options;

		if (onBeforeSubmitError) {
			await Promise.resolve(onBeforeSubmitError(error));
		}

		return submitError(error, options);
	};
}

export function unhandler(options: IUnhandlerOptions) {
	const uncaughtHandler = uncaughtHandlerFn(options);
	process.on('uncaughtException', uncaughtHandler);
	process.on('unhandledRejection', (reason) => {
		throw reason;
	});
}
