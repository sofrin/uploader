import { createFileRoute } from "@tanstack/react-router";
import { setResponseHeaders } from "@tanstack/react-start/server";

export const Route = createFileRoute("/$id")({
	server: {
		handlers: {
			GET: async ({ request, params }) => {
				const { id } = params;
				setResponseHeaders(
					new Headers({
						"Cache-Control": "public, max-age=300",
						"CDN-Cache-Control": "max-age=3600, stale-while-revalidate=600",
					}),
				);
				return new Response(JSON.stringify({ message: "Hello, World!" }), {
					headers: {
						"Content-Type": "application/json",
					},
				});
			},
		},
	},
});
