import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/$id")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				const { id } = params;
				return new Response(JSON.stringify({ message: "Hello, World!" }), {
					headers: {
						"Content-Type": "application/json",
					},
				});
			},
		},
	},
});
