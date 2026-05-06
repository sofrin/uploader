import { s3 } from "bun";

import { createFileRoute } from "@tanstack/react-router";
import { customAlphabet, nanoid } from "nanoid";

import { db } from "@/lib/prisma.ts";
import { getUrl } from "@/lib/utils.ts";

const maxFileSize = 1048576 * 100;
const genId = customAlphabet(
	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	6,
);
export const Route = createFileRoute("/api/file/$")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const data = await request.formData();
				const file = data.get("file") as File;
				if (!(file instanceof File))
					return Response.json(
						{ status: "failure", reason: "Invalid file" },
						{
							status: 400,
						},
					);

				if (file.size > maxFileSize) {
					return Response.json(
						{
							status: "failure",
							reason: "File size too large",
						},
						{
							status: 400,
						},
					);
				}

				const fileKey = nanoid();
				console.log("fileName", fileKey);
				console.log("data", data);
				const s3file = s3.file(fileKey, {
					type: file.type,
					contentDisposition: "inline",
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
						return Response.json(
							{
								status: "failure",
							},
							{
								status: 500,
							},
						);
					});
				const fileId = genId();
				db.file
					.create({
						data: {
							key: fileKey,
							type: file.type,
							ext: file.type.split("/")[1].split("+")[0],
							createdAt: new Date().toISOString(),
							id: fileId,
							size: file.size,
							name: file.name,
						},
					})
					.catch((err) => {
						console.error("Error saving file info to db", err);
					});
				return Response.json(
					{
						status: "success",
						link: `${getUrl()}/${fileId}`,
						delete: `${getUrl()}/delete?key=${fileKey}`,
						data: {
							size: file.size,
							key: fileKey,
							type: file.type,
							ext: file.type.split("/")[1].split("+")[0],
							date: new Date().toISOString(),
							id: fileId,
							name: file.name,
						},
					},
					{
						status: 200,
					},
				);
			},
		},
	},
});
