import { atomWithStorage } from "jotai/utils";
export type Item = {
	size: number;
	key: string;
	type: string;
	ext: string;
	date: string;
	id: string;
	name: string;
};
export const itemsAtom = atomWithStorage<Item[]>("files1", []);
