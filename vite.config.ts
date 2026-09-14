import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { cn } from "cn/vite";
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
		cn({ content: ["src/**/*.{ts,tsx}"], out: "src/lib/cn-tables.ts" }),
		tanstackStart({
			pages: [
				{
					path: "/",
				},
			],
			prerender: {
				failOnError: false,
			},
			sitemap: {
				host: "https://i.sofrin.ru",
			},
			// spa: {
			// 	enabled: true,
			// },
		}),
		viteReact({ compiler: true }),
	],
	preview: {
		host: "127.0.0.1",
	},
	resolve: {
		tsconfigPaths: true,
	},
	server: { forwardConsole: true },
});

export default config;
