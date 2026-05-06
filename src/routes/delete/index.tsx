import type { Item } from "@/lib/store.tsx";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { ExternalLinkIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { CopyButton } from "@/components/copy-button/copy-button.tsx";
import { Example, ExampleWrapper } from "@/components/example.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ButtonGroup } from "@/components/ui/button-group.tsx";
import {
	Card,
	CardAction,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import { getUrl } from "@/lib/utils.ts";

const deleteFileSearchSchema = z.object({
	key: z.string().default(""),
});
export const Route = createFileRoute("/delete/")({
	component: RouteComponent,
	validateSearch: deleteFileSearchSchema,
	loaderDeps: ({ search: { key } }) => ({ key }),
	loader: async ({ deps: { key } }) => {
		try {
			console.log("key", key);
			const file = await fetch(`${getUrl()}/api/file/${key}`).then(
				(res) => res.json() as Promise<Item & { createdAt: string }>,
			);
			console.log("file", file);
			return file;
		} catch (error) {
			console.error(error);
		}
	},
});

function RouteComponent() {
	const item = Route.useLoaderData();
	const navigate = useNavigate();
	if (!item?.id) {
		return <div>File not found {item?.id}</div>;
	}
	return (
		<ExampleWrapper>
			<div className="col-span-2">
				<Example className="col-span-2">
					<Card className="relative mx-auto w-full pt-0">
						{item.type.startsWith("image/") ? (
							<Image
								className="relative z-20 aspect-video w-full object-cover"
								layout="fullWidth"
								height={80}
								// width={160}
								src={`${getUrl()}/${item.id}.${item.ext}`}
							/>
						) : null}
						{item.type.startsWith("video/") ? (
							<video
								preload="metadata"
								controls
								// loading="lazy"
								// disablepictureinpicture
								className="relative z-20 aspect-video w-full object-cover"
								// type={`video/${item.ext}`}
								// height={80}
								// width={160}
								src={`${getUrl()}/${item.id}.${item.ext}`}
							/>
						) : null}
						{item.type.startsWith("audio/") ? (
							<audio
								className="w-full rounded-none"
								// loading="lazy"
								controls
								preload="metadata"
								src={`${getUrl()}/${item.id}.${item.ext}`}
							/>
						) : null}
						<CardHeader>
							<CardAction>
								<Badge variant="secondary">
									{new Date(item.createdAt).toLocaleDateString("ru")}
								</Badge>
							</CardAction>
							<CardTitle> {item.name}</CardTitle>
						</CardHeader>
						<CardFooter>
							<ButtonGroup className="flex w-full">
								<Button
									size="icon"
									className="grow bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 dark:hover:bg-destructive/30"
									variant="outline"
									onClick={async () => {
										await fetch(`/api/file/${item.key}`, {
											method: "DELETE",
										})
											.then(async () => {
												toast.success("Файл удалён");
												await navigate({ to: "/" });
											})
											.catch((e) => console.error(e));
									}}
								>
									<Trash2Icon /> <span className="pl-2">Удалить файл</span>
								</Button>
								<CopyButton
									className="pr-3 pl-2.5 will-change-transform"
									variant="outline"
									size="default"
									text={`${getUrl()}/${item.id}.${item.ext}`}
								></CopyButton>
								<Button
									variant="outline"
									nativeButton={false}
									render={
										<a
											target="_blank"
											href={`/${item.id}.${item.ext}`}
											rel="noopener"
										>
											<ExternalLinkIcon />
										</a>
									}
								></Button>
							</ButtonGroup>
						</CardFooter>
					</Card>
				</Example>
			</div>
		</ExampleWrapper>
	);
}
