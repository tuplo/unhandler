/* eslint no-console:off */
import { Agent } from 'https';
import fetch from '@tuplo/fetch';
import type { FetchOptions, Response } from '@tuplo/fetch';

type GithubIssue = {
  id?: number;
  title: string;
  labels: string[];
  body: string;
};

export type GitHubOptions = {
  user: string;
  repo: string;
  token: string;
  labels?: string[];
};

export function buildUrl(
  template: string,
  githubOptions: GitHubOptions
): string {
  const { user, repo: repoName } = githubOptions;
  const repo = !/\//.test(repoName) ? `${user}/${repoName}` : repoName;

  return ['https://api.github.com', template.replace(/:repo/, repo)].join('');
}

async function client<T = unknown>(
  url: string,
  options: Partial<FetchOptions>,
  githubOptions: GitHubOptions
): Promise<Response<T> | null> {
  const { user, token } = githubOptions;
  const defaultOptions = {
    agent: new Agent({
      rejectUnauthorized: process.env.NODE_ENV !== 'test',
    }),
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${token}`,
      'User-Agent': user,
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
      console.error('[github]', err.message, githubUrl, options);
      return null;
    });
}

export async function listIssues(
  githubOptions: GitHubOptions
): Promise<GithubIssue[]> {
  const url = '/repos/:repo/issues';

  return client<GithubIssue[]>(url, { method: 'GET' }, githubOptions).then(
    (res) => res?.json() || []
  );
}

type FinderFn = (issue: GithubIssue) => boolean;
export async function findIssue(
  finder: FinderFn,
  options: GitHubOptions
): Promise<GithubIssue | null> {
  const issues = await listIssues(options);
  if (issues === null) return null;

  return issues.find(finder) || null;
}

export async function createIssue(
  issue: GithubIssue,
  options: GitHubOptions
): Promise<Response | null> {
  const existingIssue = await findIssue(
    (i) => i.title === issue.title,
    options
  );
  if (existingIssue) return null;
  const url = '/repos/:repo/issues';

  return client(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue),
    },
    options
  );
}
