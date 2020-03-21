/* eslint no-console:off */
import { Agent } from 'https';
import fetch, { RequestInit, Response } from 'node-fetch';

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

type BuildUrlFn = (template: string, githubOptions: GitHubOptions) => string;
export const buildUrl: BuildUrlFn = (template, githubOptions) => {
  const { user, repo } = githubOptions;
  return [
    `https://api.github.com`,
    template.replace(/:owner/, user).replace(/:repo/, repo),
  ].join(``);
};

type ClientFn = (
  url: string,
  options: RequestInit,
  githubOptions: GitHubOptions
) => Promise<Response | null>;
const client: ClientFn = async (url, options, githubOptions) => {
  const { user, token } = githubOptions;
  const defaultOptions = {
    agent: new Agent({
      rejectUnauthorized: process.env.NODE_ENV !== `test`,
    }),
    headers: {
      Accept: `application/vnd.github.v3+json`,
      Authorization: `token ${token}`,
      'User-Agent': user,
    },
    retries: 0,
  };

  const opts = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const githubUrl = buildUrl(url, githubOptions);
  return fetch(githubUrl, opts).catch(err => {
    console.error(`[github] ${err.message}`);
    return null;
  });
};

type ListIssuesFn = (githubOptions: GitHubOptions) => Promise<GithubIssue[]>;
export const listIssues: ListIssuesFn = async githubOptions => {
  const url = `/repos/:owner/:repo/issues`;
  return client(url, { method: `get` }, githubOptions)
    .then(res => res && res.json())
    .catch(err => {
      console.error(`[github] ${err.message}`);
      return null;
    });
};

type FinderFn = (issue: GithubIssue) => boolean;
type FindIssueFn = (
  finder: FinderFn,
  options: GitHubOptions
) => Promise<GithubIssue | null>;
export const findIssue: FindIssueFn = async (finder, options) => {
  const issues = await listIssues(options);
  if (issues === null) return null;
  return issues.find(finder) || null;
};

type CreateIssueFn = (
  issue: GithubIssue,
  options: GitHubOptions
) => Promise<null | Response>;
export const createIssue: CreateIssueFn = async (issue, options) => {
  const existingIssue = await findIssue(i => i.title === issue.title, options);
  if (existingIssue) return null;
  const url = `/repos/:owner/:repo/issues`;
  return client(
    url,
    {
      method: `post`,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue),
    },
    options
  );
};
