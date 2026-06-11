import { s3 } from "bun";

import { createServerFn } from "@tanstack/react-start";
import { z } from "better-auth";
// import { auth } from "auth";
import { customAlphabet, nanoid } from "nanoid";

const genId = customAlphabet("1234567890abcdef", 6);
const maxFileSize = 1048576 * 10;

export const writeFile = createServerFn()
	.validator(z.instanceof(FormData))
	.handler(async ({ data }) => {
		const file = data.get("file") as File;
		if (!(file instanceof File))
			return { reason: "Invalid file", status: "failure" };
		if (file.size > maxFileSize) {
			return { reason: "File size too large", status: "failure" };
		}

		const fileKey = nanoid();
		console.log("fileName", fileKey);
		console.log("data", data);
		const s3file = s3.file(fileKey, {
			type: file.type,
		});
		await s3file
			.write(file, {
				type: file.type,
			})
			.then((res) => {
				console.log("File written successfully", res);
			})
			.catch((err) => {
				console.error("Error writing file", err);
			});

		return {
			date: new Date().toISOString(),
			ext: file.type.split("/")[1].split("+")[0],
			id: genId(),
			key: fileKey,
			status: "success",
			type: file.type,
		};
	});

export const deleteFile = createServerFn()
	.validator(z.string())
	.handler(async ({ data }) => {
		const fileKey = data;
		const s3file = s3.file(fileKey);
		await s3file.delete().catch((err) => {
			console.error("Error deleting file", err);
		});
		return {
			key: fileKey,
			status: "success",
		};
	});
