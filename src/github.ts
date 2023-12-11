/* eslint no-console:off */
import { Agent } from "node:https";

import fetch, { type FetchOptions } from "@tuplo/fetch";

export type IGithubIssue = {
	id?: number;
	title: string;
	labels: string[];
	body: string;
};

export type IGitHubOptions = {
	user: string;
	repo: string;
	token: string;
	labels?: string[];
};

export function buildUrl(template: string, githubOptions: IGitHubOptions) {
	const { user, repo: repoName } = githubOptions;
	const repo = !/\//.test(repoName) ? `${user}/${repoName}` : repoName;

	const uri = new URL("https://api.github.com");
	uri.pathname = template.replace(/:repo/, repo);

	return uri.href;
}

async function client<T = unknown>(
	url: string,
	options: Partial<FetchOptions>,
	githubOptions: IGitHubOptions
) {
	const { user, token } = githubOptions;
	const defaultOptions = {
		agent: new Agent({
			rejectUnauthorized: process.env.NODE_ENV !== "test",
		}),
		headers: {
			Accept: "application/vnd.github.v3+json",
			Authorization: `token ${token}`,
			"User-Agent": user,
		},
	};

	const { headers, ...restOfOptions } = options;
	const opts = {
		...defaultOptions,
		...restOfOptions,
		headers: {
			...defaultOptions.headers,
			...headers,
		},
	};

	const githubUrl = buildUrl(url, githubOptions);

	return fetch<T>(githubUrl, opts)
		.then(async (res) => {
			if (!res.ok) throw new Error(res.statusText);
			return res;
		})
		.catch((err) => {
			console.error("[github]", err.message, githubUrl, options);
			return null;
		});
}

export async function listIssues(githubOptions: IGitHubOptions) {
	const url = "/repos/:repo/issues";

	return client<IGithubIssue[]>(url, { method: "GET" }, githubOptions).then(
		(res) => res?.json() || []
	);
}

type IFinderFn = {
	(issue: IGithubIssue): boolean;
};

export async function findIssue(
	finder: IFinderFn,
	options: IGitHubOptions
): Promise<IGithubIssue | null> {
	const issues = await listIssues(options);
	if (issues === null) return null;

	return issues.find(finder) || null;
}

export async function createIssue(
	issue: IGithubIssue,
	options: IGitHubOptions
) {
	const existingIssue = await findIssue(
		(i) => i.title === issue.title,
		options
	);
	if (existingIssue) return null;

	const url = "/repos/:repo/issues";
	const { title, labels, body } = issue;
	const issueBody = {
		title: title.slice(0, 64),
		labels,
		// github api issue body limit is 65_536 chars
		body: body.slice(0, 65_536),
	};

	return client(
		url,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(issueBody),
		},
		options
	);
}
