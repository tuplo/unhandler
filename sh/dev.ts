import "zx/globals";

async function main() {
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
