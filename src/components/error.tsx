import { useNavigate } from "@tanstack/react-router";
import { BugIcon } from "lucide-react";

import { Button } from "./ui/button.tsx";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "./ui/empty.tsx";

export function ErrorPage({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	const navigate = useNavigate();
	return (
		<Empty>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<BugIcon />
				</EmptyMedia>
				<EmptyTitle>Произошла ошибка</EmptyTitle>
				<EmptyDescription>
					Пожалуйста, попробуйте обновить страницу или вернуться на главную
					страницу. Если проблема повторяется, пожалуйста, сообщите об ошибке по
					ссылке ниже.
					<br />
					{error.message}
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<div className="flex gap-2">
					<Button onClick={reset}>Обновить страницу</Button>
					<Button onClick={() => navigate({ to: "/" })} variant="outline">
						На главную
					</Button>
				</div>
			</EmptyContent>
		</Empty>
	);
}
