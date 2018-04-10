import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import json from 'rollup-plugin-json';
import shebang from 'rollup-plugin-shebang';
import uglify from 'rollup-plugin-uglify';
import executable from 'rollup-plugin-executable';

const production = !process.env.ROLLUP_WATCH;

function defaultRollupConfig(entryPath, outputPath) {
	return {
		input: entryPath,
		output: {
			file: outputPath,
			format: 'cjs',
			sourcemap: false
		},
		plugins: [
			shebang(), // adds unix-style shebang
			resolve({
        module: true,
        jsnext: true,
        main: true
			}), // tells Rollup how to resolve node_modules
			commonjs({
      	include: 'node_modules/**'
			}), // converts to ES modules
			builtins(), // enable builtins
			globals(), // enable globals
			json(), // parses JSON package.json files
			production && uglify(), // minify, but only in production
			executable() // sets file to be executable
		]
	};
}

export default [
	defaultRollupConfig('src/nessus-collector.js', 'dist/nessus-collector.js'),
	defaultRollupConfig('src/sc-collector.js', 'dist/sc-collector.js'),
]
