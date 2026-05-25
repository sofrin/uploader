import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	server: { forwardConsole: true },
	build: {
		sourcemap: false, // Explicitly disable source maps

		rolldownOptions: {
			external: ["bun", "bun:*", "@prisma/client"],
		},
	},
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [
		tailwindcss(),
		tanstackStart({
			spa: {
				enabled: true,
			},
			sitemap: {
				host: "https://i.sofrin.ru",
			},
			prerender: {
				failOnError: false,
			},
		}),
		viteReact(),
		babel({
			presets: [reactCompilerPreset()],
		}),
	],
});

export default config;
