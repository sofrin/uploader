import crypto from "node:crypto";
import { auth } from "auth";
import { s3 } from "bun";
import { db } from "./prisma";

type GetSignedURLParams = {
	fileType: string;
	fileSize: number;
	checksum: string;
};
type SignedURLResponse = Promise<
	| { failure?: undefined; success: { url: string; id: string } }
	| { failure: string; success?: undefined }
>;

const generateFileName = (bytes = 10) =>
	crypto.randomBytes(bytes).toString("hex");

const maxFileSize = 1048576 * 10;

export const getSignedURL = async ({
	fileType,
	fileSize,
}: GetSignedURLParams): SignedURLResponse => {
	const session = await auth.api.getSession();

	if (!session) {
		return { failure: "not authenticated" };
	}

	if (fileSize > maxFileSize) {
		return { failure: "File size too large" };
	}

	const fileName = generateFileName();
	const uploadUrl = s3.presign(fileName, {
		expiresIn: 60,
		method: "PUT",
		type: fileType,
	});

	console.log({ success: uploadUrl });

	const results = await db.file.create({
		data: {
			name: fileName,
			size: fileSize,
			id: fileName,
			type: fileType,
			url: uploadUrl.split("?")[0],
			user: { connect: { id: session.user.id } },
		},
	});
	return { success: { url: uploadUrl, id: results.id } };
};
