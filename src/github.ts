/* eslint no-console:off */
import { Agent } from "node:https";

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
	const repo = /\//.test(repoName) ? repoName : `${user}/${repoName}`;

	const uri = new URL("https://api.github.com");
	uri.pathname = template.replace(/:repo/, repo);

	return uri.href;
}

async function request(
	url: string,
	options: Partial<RequestInit>,
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

	return fetch(githubUrl, opts)
		.then(async (res) => {
			if (!res.ok) {
				throw new Error(res.statusText);
			}

			return res;
		})
		.catch((error) => {
			console.error("[github]", error.message, githubUrl, options);
			return;
		});
}

export async function listIssues(githubOptions: IGitHubOptions) {
	const url = "/repos/:repo/issues";

	const response = await request(url, { method: "GET" }, githubOptions);
	if (!response) {
		return [];
	}

	const issues = await response.json();

	return issues as IGithubIssue[];
}

type IFinderFn = {
	(issue: IGithubIssue): boolean;
};

export async function findIssue(
	finder: IFinderFn,
	options: IGitHubOptions
): Promise<IGithubIssue | undefined> {
	const issues = await listIssues(options);
	if (!issues) {
		return;
	}

	return issues.find((issue) => finder(issue)) || undefined;
}

export async function createIssue(
	issue: IGithubIssue,
	options: IGitHubOptions
) {
	const existingIssue = await findIssue(
		(i) => i.title === issue.title,
		options
	);
	if (existingIssue) {
		return;
	}

	const url = "/repos/:repo/issues";
	const { title, labels, body } = issue;
	const issueBody = {
		title: title.slice(0, 64),
		labels,
		// github api issue body limit is 65_536 chars
		body: body.slice(0, 65_536),
	};

	return request(
		url,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(issueBody),
		},
		options
	);
}
