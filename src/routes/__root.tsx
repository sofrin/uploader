import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		links: [
			{
				href: appCss,
				rel: "stylesheet",
			},
			{
				href: "/favicon-96x96.png",
				rel: "icon",
				sizes: "96x96",
				type: "image/png",
			},
			{
				href: "/favicon.svg",
				rel: "icon",
				type: "image/svg+xml",
			},
			{
				href: "/favicon.ico",
				rel: "shortcut icon",
			},
			{
				href: "/apple-touch-icon.png",
				rel: "apple-touch-icon",
				sizes: "180x180",
			},
			{
				href: "/site.webmanifest",
				rel: "manifest",
			},
		],
		meta: [
			{
				charSet: "utf-8",
			},
			{ content: "uploader", name: "apple-mobile-web-app-title" },
			{
				content: "width=device-width, initial-scale=1",
				name: "viewport",
			},
			{
				title: "uploader",
			},
		],
	}),
	shellComponent: RootDocument,
	// ssr: "data-only",
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru" suppressHydrationWarning>
			<head>
				<HeadContent />
				<script
					data-website-id="48c82926-f298-4714-92d6-1c94eed9fe34"
					defer
					src="/api/stats.js"
				></script>
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
