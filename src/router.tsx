import { createRouter } from "@tanstack/react-router";
import { Provider } from "jotai";

import { ErrorPage } from "./components/error.tsx";
import { NotFoundPage } from "./components/not-found.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
// Import the generated route tree
import { routeTree } from "./routeTree.gen.ts";

// Create a new router instance
export const getRouter = () => {
	const router = createRouter({
		defaultErrorComponent: ({ error, reset }) => (
			<ErrorPage error={error} reset={reset} />
		),
		defaultNotFoundComponent: () => <NotFoundPage />,
		defaultViewTransition: true,
		routeTree,
		scrollRestoration: true,
		Wrap: (props: { children: React.ReactNode }) => {
			return (
				<Provider>
					<Toaster richColors />
					{props.children}
				</Provider>
			);
		},
	});

	return router;
};
