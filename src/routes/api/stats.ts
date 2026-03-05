import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stats")({
	server: {
		handlers: {
			GET: async () => {
				const scriptText = await fetch("https://cloud.umami.is/script.js");

				return new Response(await scriptText.text());
			},
		},
	},
});
