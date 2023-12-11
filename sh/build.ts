import * as shell from "@tuplo/shell";

async function main() {
	const $ = shell.$({ verbose: true });

	await $`rm -rf dist`;
	await $`tsc --build tsconfig.build.json`;

	// const modes = ["cjs", "esm"];
	// for await (const mode of modes) {
	// 	const flags = [
	// 		"src/index.ts",
	// 		"--bundle",
	// 		`--format=${mode}`,
	// 		"--platform=node",
	// 		"--minify",
	// 		`--outfile=dist/index.${mode}.js`,
	// 	];

	// 	await $`esbuild ${flags}`;
	// }

	const flags = ["--bundle", "--platform=node"];

	await $`esbuild src/cjs/index.cjs --outfile=dist/index.cjs ${flags}`;
	await $`esbuild src/index.ts --format=esm --outfile=dist/index.mjs ${flags}`;

	// await $`rm dist/github.js dist/index.js`;
	await $`rm -rf dist/helpers`;
}

main();
