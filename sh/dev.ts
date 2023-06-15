import * as shell from "@tuplo/shell";

async function main() {
	const $ = shell.$({ verbose: true });

	const flags = [
		"src/index.ts",
		"--bundle",
		"--platform=node",
		"--format=esm",
		"--outfile=dist/index.esm.js",
		"--watch",
	];

	await $`esbuild ${flags}`;
}

main();
