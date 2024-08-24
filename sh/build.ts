import * as shell from "@tuplo/shell";

async function main() {
	const $ = shell.$({ verbose: true });

	await $`rm -rf dist`;
	await $`tsc --project tsconfig.build.json`;
	await $`tsup src/index.ts`;
}

main();
