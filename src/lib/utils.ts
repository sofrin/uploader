import type { ClassValue } from "clsx";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
export function getUrl() {
	const base = (() => {
		if (process.env.NODE_ENV === "development") {
			return `http://localhost:${process.env.PORT ?? 3000}`;
		}
		return `https://i.sofrin.ru`;
	})();
	return `${base}`;
}
