/* eslint import/no-extraneous-dependencies:off */
import fetch from 'node-fetch';
import { mocked } from 'ts-jest/utils';

import { createIssue, findIssue, listIssues } from './github';
import githubIssuesList from './__data__/github-list-issues.json';

jest.mock('node-fetch');

describe(`unhandler`, () => {
  it('creates an issue', async () => {
    expect.assertions(2);
    const fetchSpy = jest.fn().mockReturnValue(
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve(githubIssuesList),
      })
    );
    const mockFetch = mocked(fetch, true);
    mockFetch.mockImplementation(fetchSpy);

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
    expect(request[1].body).toStrictEqual(JSON.stringify(issue));

    fetchSpy.mockRestore();
  });

  it('lists issues', async () => {
    expect.assertions(3);
    const fetchSpy = jest.fn().mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve(githubIssuesList),
      })
    );
    const mockedFetch = mocked(fetch, true);
    mockedFetch.mockImplementation(fetchSpy);

    const result = await listIssues({
      user: 'foo',
      repo: 'bar',
      token: 'secret',
    });
    const expectedIssue = {
      url: 'https://api.github.com/repos/ruicosta042/fc-agent/issues/16',
      title: '[the-castle] uncaughtException',
      labels: [{ name: 'bug' }],
    };
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject(expectedIssue);

    fetchSpy.mockRestore();
  });

  it('finds issues given a finder function', async () => {
    expect.assertions(1);
    const fetchSpy = jest.fn().mockReturnValue(
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve(githubIssuesList),
      })
    );
    const mockFetch = mocked(fetch, true);
    mockFetch.mockImplementation(fetchSpy);

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
    expect.assertions(1);
    const fetchSpy = jest.fn().mockReturnValue(
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve(githubIssuesList),
      })
    );
    const mockFetch = mocked(fetch, true);
    mockFetch.mockImplementation(fetchSpy);

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

    fetchSpy.mockRestore();
  });
});
