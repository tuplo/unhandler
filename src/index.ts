import { type Response } from "@tuplo/fetch";

import * as github from "./github";
import { type IGitHubOptions } from "./github";
import { stringify } from "./helpers/stringify";

export interface IUnhandlerError extends Error {
	body?: unknown;
}

interface IProviders {
	github?: IGitHubOptions;
}

export interface IUnhandlerOptions {
	appName?: string;
	onAfterSubmitError?: (error: Error) => void | Promise<void>;
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
	if ("github" in providers) {
		tracker = github;
		trackerOptions = providers.github as IGitHubOptions;
	}
	if (!tracker || !trackerOptions) return null;

	const [title] = error.message?.split("\n") || ["Unknown error"];
	const { labels = ["bug"] } = trackerOptions || {};

	const body = `\`\`\`\n${stringify(error.body || error.stack)}\n\`\`\``;
	return tracker.createIssue(
		{
			title: [appName && `[${appName}]`, title].join(" "),
			labels,
			body,
		},
		trackerOptions
	);
}

export function uncaughtHandlerFn(options: IUnhandlerOptions) {
	return async (error: IUnhandlerError): Promise<Response | null> => {
		const { onBeforeSubmitError, onAfterSubmitError } = options;

		if (onBeforeSubmitError) {
			await Promise.resolve(onBeforeSubmitError(error));
		}

		const response = await submitError(error, options);

		if (onAfterSubmitError) {
			await Promise.resolve(onAfterSubmitError(error));
		}

		return response;
	};
}

export function unhandler(options: IUnhandlerOptions) {
	const uncaughtHandler = uncaughtHandlerFn(options);
	process.on("uncaughtException", uncaughtHandler);
	process.on("unhandledRejection", (reason) => {
		throw reason;
	});
}
