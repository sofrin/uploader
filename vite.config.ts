import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	build: {
		rolldownOptions: {
			// external: ["bun", "bun:*", "@prisma/client"],
		},
		sourcemap: false, // Explicitly disable source maps
	},
	plugins: [
		tailwindcss(),
		tanstackStart({
			prerender: {
				failOnError: false,
			},
			sitemap: {
				host: "https://i.sofrin.ru",
			},
			spa: {
				enabled: true,
			},
		}),
		viteReact(),
		babel({
			presets: [reactCompilerPreset()],
		}),
	],
	resolve: {
		tsconfigPaths: true,
	},
	server: { forwardConsole: true },
});

export default config;
