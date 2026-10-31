import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createFileRoute } from "@tanstack/react-router";
import mime from "mime-types";
import { customAlphabet, nanoid } from "nanoid";
import { generate } from "random-words";

import { db } from "@/lib/prisma.ts";
import { getUrl } from "@/lib/utils.ts";

import { s3 } from "../../$id.ts";

const maxFileSize = 1048576 * 100;
// const genId = customAlphabet(
// 	"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
// 	6,
// );

// const genId2 = generate({
// 	min: 2,
// 	max: 3,
// 	formatter: (word) => word.slice(0, 1).toUpperCase().concat(word.slice(1)),
// });
export const Route = createFileRoute("/api/file/$")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const data = await request.formData();
				const file = data.get("file") as File;
				// Strip MIME parameters such as ";charset=utf-8" so bucket metadata,
				// db records and the Content-Type the client sends for the presigned
				// PUT all match exactly.
				const fileType =
					file.type.split(";")[0].trim() !== ""
						? file.type.split(";")[0].trim()
						: data.get("type")?.toString().split(";")[0].trim() !== ""
							? data.get("type")!.toString().split(";")[0].trim()
							: mime.lookup(file.name) || "image/png";

				// console.log("fileType", fileType);
				if (!(file instanceof File))
					return Response.json(
						{ reason: "Invalid file", status: "failure" },
						{
							status: 400,
						},
					);

				if (file.size > maxFileSize) {
					return Response.json(
						{
							reason: "File size too large",
							status: "failure",
						},
						{
							status: 400,
						},
					);
				}

				const fileKey = nanoid();
				// ShareX (and other single-shot API clients) use this endpoint as a
				// classic uploader: one POST, parse the JSON response, done. They never
				// follow an uploadUrl, so the file we just received must be written to
				// S3 here. The two-step presigned flow (uploadUrl) remains available
				// for the web client.
				const Body = new Uint8Array(await file.arrayBuffer());
				try {
					await s3.send(
						new PutObjectCommand({
							Bucket: process.env.S3_BUCKET,
							Key: fileKey,
							ContentType: fileType,
							Body,
						}),
					);
				} catch (err) {
					console.error("S3 upload failed", err);
					return Response.json(
						{
							reason: "Failed to upload file to storage",
							status: "failure",
						},
						{
							status: 502,
						},
					);
				}
				const command = new PutObjectCommand({
					Bucket: process.env.S3_BUCKET,
					Key: fileKey,
					ContentType: fileType,
				});
				const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
				// await s3.write(fileKey, file, {
				// 	accessKeyId: process.env.S3_ACCESS_KEY_ID!,
				// 	bucket: process.env.S3_BUCKET,
				// 	contentDisposition: `inline; filename=${file.name}`,
				// 	endpoint: process.env.S3_ENDPOINT!,
				// 	region: process.env.S3_REGION!,
				// 	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
				// 	type: fileType,
				// });

				// const fileId = genId();
				const fileId = generate({
					seed: fileKey,
					join: "",
					min: 2,
					max: 3,
					formatter: (word) =>
						word.slice(0, 1).toUpperCase().concat(word.slice(1)),
				});

				await db.file
					.create({
						data: {
							createdAt: new Date().toISOString(),
							ext: fileType ? fileType.split("/")[1].split("+")[0] : "png",
							id: fileId,
							key: fileKey,
							name: file.name,
							size: file.size,
							type: fileType,
						},
					})
					.catch((err) => {
						console.error("Error saving file info to db", err);
					});
				return Response.json(
					{
						date: new Date().toISOString(),
						delete: `${getUrl()}/delete?key=${fileKey}`,
						ext: fileType ? fileType.split("/")[1].split("+")[0] : "png",
						id: fileId,
						key: fileKey,
						link: `${getUrl()}/${fileId}`,
						name: file.name,
						size: file.size,
						status: "success",
						type: fileType,
						uploadUrl: uploadUrl,
					},
					{
						status: 200,
					},
				);
				//     return Response.json(
				// 	{
				// 		date: new Date().toISOString(),
				// 		delete: `${getUrl()}/delete?key=${fileKey}`,
				// 		ext: fileType ? fileType.split("/")[1].split("+")[0] : "png",
				// 		id: fileId,
				// 		key: fileKey,
				// 		link: `${getUrl()}/${fileId}`,
				// 		name: file.name,
				// 		size: file.size,
				// 		status: "success",
				// 		type: fileType,
				// 	},
				// 	{
				// 		status: 200,
				// 	},
				// );
			},
			PUT: async ({ request }) => {
				const data = await request.formData();
				// const file = data.get("file") as File;
				const fileName = data.get("name")?.toString() ?? "";
				const fileSize = Number(data.get("size")?.toString() ?? "");

				if (!Number.isFinite(fileSize) || fileSize < 0) {
					return Response.json(
						{
							reason: "Invalid file size",
							status: "failure",
						},
						{
							status: 400,
						},
					);
				}

				// Prefer the explicit type sent by the client (the real file.type),
				// fall back to a guess based on the filename. Strip MIME parameters
				// like ";charset=utf-8" so the bucket metadata, db record and the
				// Content-Type header the client sends for the presigned PUT all match.
				const providedType = data.get("type")?.toString() ?? "";
				const fileType =
					providedType.split(";")[0].trim() !== ""
						? providedType.split(";")[0].trim()
						: mime.lookup(fileName) || "image/png";

				// console.log("fileType", fileType);

				if (fileSize > maxFileSize) {
					return Response.json(
						{
							reason: "File size too large",
							status: "failure",
						},
						{
							status: 400,
						},
					);
				}

				const fileKey = nanoid();
				const command = new PutObjectCommand({
					Bucket: process.env.S3_BUCKET,
					Key: fileKey,
					ContentType: fileType,
				});
				const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
				// await s3.write(fileKey, file, {
				// 	accessKeyId: process.env.S3_ACCESS_KEY_ID!,
				// 	bucket: process.env.S3_BUCKET,
				// 	contentDisposition: `inline; filename=${file.name}`,
				// 	endpoint: process.env.S3_ENDPOINT!,
				// 	region: process.env.S3_REGION!,
				// 	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
				// 	type: fileType,
				// });

				// const fileId = genId();
				const fileId = generate({
					seed: fileKey,
					join: "",
					min: 2,
					max: 3,
					formatter: (word) =>
						word.slice(0, 1).toUpperCase().concat(word.slice(1)),
				});

				await db.file
					.create({
						data: {
							createdAt: new Date().toISOString(),
							ext: fileType ? fileType.split("/")[1].split("+")[0] : "png",
							id: fileId,
							key: fileKey,
							name: fileName,
							size: fileSize,
							type: fileType,
						},
					})
					.catch((err) => {
						console.error("Error saving file info to db", err);
					});
				return Response.json(
					{
						date: new Date().toISOString(),
						delete: `${getUrl()}/delete?key=${fileKey}`,
						ext: fileType ? fileType.split("/")[1].split("+")[0] : "png",
						id: fileId,
						key: fileKey,
						link: `${getUrl()}/${fileId}`,
						name: fileName,
						size: fileSize,
						status: "success",
						type: fileType,
						uploadUrl: uploadUrl,
					},
					{
						status: 200,
					},
				);
				//     return Response.json(
				// 	{
				// 		date: new Date().toISOString(),
				// 		delete: `${getUrl()}/delete?key=${fileKey}`,
				// 		ext: fileType ? fileType.split("/")[1].split("+")[0] : "png",
				// 		id: fileId,
				// 		key: fileKey,
				// 		link: `${getUrl()}/${fileId}`,
				// 		name: file.name,
				// 		size: file.size,
				// 		status: "success",
				// 		type: fileType,
				// 	},
				// 	{
				// 		status: 200,
				// 	},
				// );
			},
		},
	},
});
