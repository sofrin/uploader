import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{ name: "apple-mobile-web-app-title", content: "uploader" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "uploader",
			},
		],

		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/favicon-96x96.png",
				sizes: "96x96",
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
			{
				rel: "shortcut icon",
				href: "/favicon.ico",
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "manifest",
				href: "/site.webmanifest",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="ru" suppressHydrationWarning>
			<head>
				<HeadContent />
				<script
					defer
					src="https://cloud.umami.is/script.js"
					data-website-id="48c82926-f298-4714-92d6-1c94eed9fe34"
				></script>
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
