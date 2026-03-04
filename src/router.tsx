import { createRouter } from "@tanstack/react-router";
import { Provider } from "jotai";

// Import the generated route tree
import { routeTree } from "./routeTree.gen.ts";

// Create a new router instance
export const getRouter = () => {
	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		Wrap: (props: { children: React.ReactNode }) => {
			return <Provider>{props.children}</Provider>;
		},
	});

	return router;
};
