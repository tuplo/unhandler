import 'zx/globals';

async function main() {
	await $`rm -rf dist`;
	await $`rm -rf cjs`;
	await $`tsc --build tsconfig.build.json`;

	const modes = ['cjs', 'esm'];
	for await (const mode of modes) {
		const flags = [
			'src/index.ts',
			'--bundle',
			`--format=${mode}`,
			'--platform=node',
			'--minify',
			`--outfile=dist/index.${mode}.js`,
		];

		await $`esbuild ${flags}`;
	}

	await $` rm dist/github.js dist/index.js`;
}

main();
