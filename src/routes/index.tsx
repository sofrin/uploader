import { createFileRoute } from "@tanstack/react-router";
import Component from "@/components/comp-549";
import { Example, ExampleWrapper } from "@/components/example";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<ExampleWrapper>
			<Example>
				<Component />
			</Example>
		</ExampleWrapper>
	);
}
