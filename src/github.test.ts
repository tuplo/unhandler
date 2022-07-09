import type { RequestInit } from 'undici';

import githubIssuesList from './__data__/github-list-issues.json';
import { buildUrl, createIssue, findIssue, listIssues } from './github';

const fetchSpy = jest.fn().mockImplementation(() => Promise.resolve());
jest.mock('undici', () => ({
	__esModule: true,
	fetch: (url: string, options: RequestInit) => fetchSpy(url, options),
}));

describe('unhandler', () => {
	afterEach(() => {
		fetchSpy.mockClear();
	});

	afterAll(() => {
		fetchSpy.mockRestore();
	});

	it.each([
		[
			{ user: 'john_doe', repo: 'kill-switch' },
			'https://api.github.com/repos/john_doe/kill-switch/issues',
		],
		[
			{ user: 'john_doe', repo: 'sentient/kill-switch' },
			'https://api.github.com/repos/sentient/kill-switch/issues',
		],
	])("builds the repo's url", (options, expected) => {
		const result = buildUrl('/repos/:repo/issues', {
			token: 'secret',
			...options,
		});

		expect(result).toBe(expected);
	});

	it('creates an issue', async () => {
		fetchSpy.mockReturnValue(
			Promise.resolve({
				ok: true,
				status: 200,
				json: () => Promise.resolve(githubIssuesList),
			})
		);

		const issue = {
			id: 524659464,
			title: '[the-castle] ReferenceError: foo is not defined',
			body: `\`\`\`
ReferenceError: foo is not defined
    at Object.<anonymous> (/Users/ruic/code/fc/fc-agent/src/_lib/unhandler/index.js:8:1)
    at Module._compile (internal/modules/cjs/loader.js:1063:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1103:10)
    at Module.load (internal/modules/cjs/loader.js:914:32)
    at Function.Module._load (internal/modules/cjs/loader.js:822:14)
    at Function.Module.runMain (internal/modules/cjs/loader.js:1143:12)
    at internal/main/run_main_module.js:16:11
\`\`\``,
			labels: ['bug'],
		};
		await createIssue(issue, { user: 'foo', repo: 'bar', token: 'secret' });

		expect(fetchSpy).toHaveBeenCalledTimes(2);
		const [, request] = fetchSpy.mock.calls;
		expect(request[0]).toBe('https://api.github.com/repos/foo/bar/issues');
		expect(request[1].body).toStrictEqual(JSON.stringify(issue));
	});

	it('lists issues', async () => {
		fetchSpy.mockReturnValue(
			Promise.resolve({
				ok: true,
				status: 200,
				json: () => Promise.resolve(githubIssuesList),
			})
		);

		const result = await listIssues({
			user: 'foo',
			repo: 'bar',
			token: 'secret',
		});

		const expectedIssue = {
			url: 'https://api.github.com/repos/username/my-repo/issues/16',
			title: '[the-castle] uncaughtException',
			labels: [{ name: 'bug' }],
		};
		const [request] = fetchSpy.mock.calls;
		expect(request[0]).toBe('https://api.github.com/repos/foo/bar/issues');
		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject(expectedIssue);
	});

	it('finds issues given a finder function', async () => {
		fetchSpy.mockReturnValue(
			Promise.resolve({
				ok: true,
				status: 200,
				json: () => Promise.resolve(githubIssuesList),
			})
		);

		const issues = [
			{ title: '[the-castle] uncaughtException' },
			{ title: '[the-castle] connect ECONNREFUSED 127.0.0.1:8888' },
			{ title: 'foo' },
		];
		const expected = [true, false, false];
		const result = await Promise.all(
			issues.map((issue) =>
				findIssue((i) => i.title === issue.title, {
					user: 'foo',
					repo: 'bar',
					token: 'secret',
				})
			)
		);
		expect(result.map(Boolean)).toStrictEqual(expected);

		fetchSpy.mockRestore();
	});

	it("doesn't create an issue if already created", async () => {
		fetchSpy.mockReturnValue(
			Promise.resolve({
				ok: true,
				status: 200,
				json: () => Promise.resolve(githubIssuesList),
			})
		);

		const issue = {
			title: '[the-castle] uncaughtException',
			labels: [],
			body: 'fooo',
		};
		const result = await createIssue(issue, {
			user: 'foo',
			repo: 'bar',
			token: 'secret',
		});
		expect(result).toBeNull();
	});

	it('logs instead of creating an issue, when something wrong with request', async () => {
		const consoleErrorSpy = jest
			.spyOn(console, 'error')
			.mockImplementation(() => null);
		fetchSpy.mockReturnValue(
			Promise.resolve({
				status: 400,
				ok: false,
				statusText: 'Error message',
			})
		);

		const issue = { title: '[the-app] error', labels: [], body: 'foo' };
		await createIssue(issue, { user: 'foo', repo: 'bar', token: 'secret' });

		// only 2 times: 1 to list, 1 to create
		// if it didn't handle the request error, it would be caught by uncaughtException
		// thus creating an infinite loop with unhandler
		expect(fetchSpy).toHaveBeenCalledTimes(2);

		consoleErrorSpy.mockRestore();
	});
});
