import type { IGithubIssue, IGitHubOptions } from "./github";
import { submitError, uncaughtHandlerFn } from "./index";

const githubCreateIssueSpy = jest.fn().mockResolvedValue(null);
jest.mock<typeof import("./github")>("./github", () => ({
	...jest.requireActual("./github"),
	createIssue: (issue: IGithubIssue, options: IGitHubOptions) =>
		githubCreateIssueSpy(issue, options),
}));

describe("unhandler", () => {
	afterEach(() => {
		githubCreateIssueSpy.mockClear();
	});

	afterAll(() => {
		githubCreateIssueSpy.mockRestore();
	});

	it("submits an error", async () => {
		const error = new Error("foo");
		await submitError(error, {
			appName: "app-name",
			providers: {
				github: { user: "foo", repo: "foo/bar", token: "secret-token" },
			},
		});

		const expected = {
			title: "[app-name] foo",
			labels: ["bug"],
		};
		expect(githubCreateIssueSpy).toHaveBeenCalledTimes(1);
		const [payload] = githubCreateIssueSpy.mock.calls[0];
		expect(payload).toMatchObject(expected);
	});

	it("makes sure error doesn't have break lines on title", async () => {
		const error = new Error(["line1", "line2"].join("\n"));
		await submitError(error, {
			appName: "app-name",
			providers: {
				github: { user: "foo", repo: "foo/bar", token: "secret-token" },
			},
		});

		const expected = {
			title: "[app-name] line1",
			labels: ["bug"],
		};
		expect(githubCreateIssueSpy).toHaveBeenCalledTimes(1);
		const [payload] = githubCreateIssueSpy.mock.calls[0];
		expect(payload).toMatchObject(expected);
	});

	it("handles an exception - github", () => {
		const error = new Error("foo");
		const uncaughtHandler = uncaughtHandlerFn({
			appName: "app-name",
			providers: {
				github: { user: "foo", repo: "foo/bar", token: "secret" },
			},
		});
		uncaughtHandler(error);

		expect(githubCreateIssueSpy).toHaveBeenCalledTimes(1);
		const [payload] = githubCreateIssueSpy.mock.calls[0];
		expect(payload).toMatchObject({
			title: "[app-name] foo",
			labels: ["bug"],
		});
	});

	it("handles an exception with a custom body", () => {
		class FooError extends Error {
			public body: string;

			constructor(message: string, body: string) {
				super(message);
				this.body = body;
			}
		}
		const error = new FooError("foo", "bar baz buz");
		const uncaughtHandler = uncaughtHandlerFn({
			appName: "app-name",
			providers: {
				github: { user: "foo", repo: "foo/bar", token: "secret" },
			},
		});
		uncaughtHandler(error);

		expect(githubCreateIssueSpy).toHaveBeenCalledTimes(1);
		const [payload] = githubCreateIssueSpy.mock.calls[0];
		expect(payload).toMatchObject({
			title: "[app-name] foo",
			labels: ["bug"],
			body: "```\nbar baz buz\n```",
		});
	});

	it.each([
		["regular function", jest.fn()],
		["async function", jest.fn().mockResolvedValue(undefined)],
	])("calls onBeforeSubmitError if one is provided: %s", async (_, spy) => {
		const onBeforeSubmitErrorSpy = spy;
		const error = new Error("foo");
		const uncaughtHandler = uncaughtHandlerFn({
			appName: "app-name",
			providers: {
				github: { user: "foo", repo: "foo/bar", token: "secret" },
			},
			onBeforeSubmitError: onBeforeSubmitErrorSpy,
		});
		await uncaughtHandler(error);

		expect(onBeforeSubmitErrorSpy).toHaveBeenCalledTimes(1);
		expect(onBeforeSubmitErrorSpy).toHaveBeenCalledWith(error);
	});

	it.each([
		["regular function", jest.fn()],
		["async function", jest.fn().mockResolvedValue(undefined)],
	])("calls onAfterSubmitError if one is provided: %s", async (_, spy) => {
		const onAfterSubmitError = spy;
		const error = new Error("foo");
		const uncaughtHandler = uncaughtHandlerFn({
			appName: "app-name",
			providers: {
				github: { user: "foo", repo: "foo/bar", token: "secret" },
			},
			onAfterSubmitError,
		});
		await uncaughtHandler(error);

		expect(onAfterSubmitError).toHaveBeenCalledTimes(1);
		expect(onAfterSubmitError).toHaveBeenCalledWith(error);
	});
});
