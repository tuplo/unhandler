import { stringify } from "./stringify";

describe("stringify", () => {
	it.each([
		["object", { foobar: "bazbuz" }, `{\n  "foobar": "bazbuz"\n}`],
		["string", "foobar", "foobar"],
		["number", 2, "2"],
		["undefined", undefined, "undefined"],
		["null", null, "undefined"],
		["array", [1, 2, 3], "1\n2\n3"],
		[
			"objects array",
			[{ foo: "bar" }, { baz: "buz" }],
			'{\n  "foo": "bar"\n}\n{\n  "baz": "buz"\n}',
		],
	])("stringifies a value: %s", (_, input, expected) => {
		const actual = stringify(input);
		expect(actual).toBe(expected);
	});
});
