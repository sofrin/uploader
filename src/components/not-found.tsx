import { Empty, EmptyHeader, EmptyTitle } from "./ui/empty.tsx";

export function NotFoundPage() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>Ничего не найдено</EmptyTitle>
			</EmptyHeader>
		</Empty>
	);
}
