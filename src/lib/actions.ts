import crypto from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
// import { auth } from "auth";
import { S3Client } from "bun";

const s3 = new S3Client({
	accessKeyId: process.env.ACCESSKEYID,
	secretAccessKey: process.env.SECRETACCESSKEY,
	bucket: process.env.BUCKET,
	// sessionToken: "..."
	// acl: "public-read",
	endpoint: process.env.ENDPOINT,
});

const generateFileName = (bytes = 5) =>
	crypto.randomBytes(bytes).toString("hex");

const maxFileSize = 1048576 * 10;

export const getSignedURL = createServerFn()
	.inputValidator((data: { fileType: string; fileSize: number }) => data)
	.handler(async ({ data }) => {
		// const session = await auth.api.getSession();

		// if (!session) {
		// 	return { failure: "not authenticated" };
		// }

		if (data.fileSize > maxFileSize) {
			return { failure: "File size too large" };
		}

		const fileName = generateFileName();
		console.log("fileName", fileName);
		const uploadUrl = s3.presign(fileName, {
			expiresIn: 60,
			method: "PUT",
			type: data.fileType,
			acl: "public-read",
		});

		console.log({ success: uploadUrl });

		// const results = await db.file.create({
		// 	data: {
		// 		name: fileName,
		// 		size: data.fileSize,
		// 		id: fileName,
		// 		type: data.fileType,
		// 		url: uploadUrl.split("?")[0],
		// 		user: { connect: { id: session.user.id } },
		// 	},
		// });
		return { success: { url: uploadUrl, id: fileName } };
	});
