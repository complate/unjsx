import unjsx from "./unjsx";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import jsx from "acorn-jsx";

export default {
	input: "./src/index.js",
	output: {
		file: "./dist/bundle.js",
		format: "esm",
		sourcemap: false
	},
	plugins: [
		unjsx,
		resolve({
			extensions: [".js", ".jsx"]
		}),
		commonjs({ include: "node_modules/**" })
	],
	acornInjectPlugins: [
		jsx()
	]
};
