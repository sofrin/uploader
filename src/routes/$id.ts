import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createFileRoute } from "@tanstack/react-router";

import { db } from "@/lib/prisma.ts";

export const s3 = new S3Client({
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID!,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
	},
	endpoint: process.env.S3_ENDPOINT!,
	region: process.env.S3_REGION!,
	requestChecksumCalculation: "WHEN_REQUIRED",
});

export const Route = createFileRoute("/$id")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const { id: idRaw } = params;
				const id = idRaw.split(".")[0];
				const file = await db.file.findUnique({
					where: { id },
				});
				if (!file) {
					return Response.json(
						{
							reason: "File not found",
							status: "failure",
						},
						{
							status: 404,
						},
					);
				}
				const getObjectCommand = new GetObjectCommand({
					Bucket: process.env.S3_BUCKET_DOMAIN,
					Key: file.key,
					ResponseCacheControl: "public, max-age=31536000, immutable",
					ResponseContentDisposition: "inline",
				});

				const url = await getSignedUrl(s3, getObjectCommand, {
					expiresIn: 604800,
				});
				console.log({ key: file.key, success: url });
				return Response.redirect(url);
			},
		},
	},
});
