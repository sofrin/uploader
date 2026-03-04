import type { FileWithPreview } from "@/hooks/use-file-upload.ts";
import type { Item } from "@/lib/store.tsx";
import { useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useAtom, useSetAtom } from "jotai";
import {
	AlertCircleIcon,
	ExternalLinkIcon,
	FileArchiveIcon,
	FileIcon,
	FileSpreadsheetIcon,
	FileText,
	HeadphonesIcon,
	ImageIcon,
	Trash2Icon,
	UploadIcon,
	VideoIcon,
	XIcon,
} from "lucide-react";

import { CopyButton } from "@/components/copy-button/copy-button.tsx";
import { Example, ExampleWrapper } from "@/components/example.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ButtonGroup } from "@/components/ui/button-group.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload.ts";
import { itemsAtom } from "@/lib/store.tsx";
import { getUrl } from "@/lib/utils.ts";

export const Route = createFileRoute("/")({ component: App });

type UploadProgress = {
	fileId: string;
	progress: number;
	completed: boolean;
	error?: string;
};

function App() {
	return (
		<ExampleWrapper>
			<div>
				<h2 className="pb-2 font-semibold text-3xl tracking-tight">uploader</h2>
			</div>
			<Example>
				<FileUploader />
			</Example>
			<SavedFiles />
		</ExampleWrapper>
	);
}

function SavedFiles() {
	const [items, setItems] = useAtom(itemsAtom);
	return (
		<div className="flex flex-col gap-2">
			{items.map((item) => (
				<div key={item.id} className="w-fit border p-2">
					<div key={item.id} className="flex items-end gap-2">
						<div className="space-y-1">
							<Label htmlFor={item.id}>{item.name}</Label>
							<ButtonGroup className="">
								<Input
									className="w-72 read-only:bg-muted"
									defaultValue={`${getUrl()}/${item.id}.${item.ext}`}
									id={item.id}
									readOnly
								/>
								<CopyButton
									variant="outline"
									text={`${getUrl()}/${item.id}.${item.ext}`}
								/>
								<Button
									variant="outline"
									nativeButton={false}
									render={
										<a target="_blank" href={`/${item.id}.${item.ext}`}>
											<ExternalLinkIcon />
										</a>
									}
								></Button>

								<Button
									size="icon"
									className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 dark:hover:bg-destructive/30"
									variant="outline"
									onClick={async () => {
										await fetch(`/api/upload/${item.key}`, {
											method: "DELETE",
										}).catch((e) => console.error(e));
										setItems((prevItems) =>
											prevItems.filter((i) => i.id !== item.id),
										);
									}}
								>
									<Trash2Icon />
								</Button>
							</ButtonGroup>
						</div>

						<div style={{ textBoxTrim: "trim-both" }} className="flex flex-col">
							<p
								style={{ textBoxTrim: "trim-both" }}
								className="text-muted-foreground text-sm"
							>
								{new Date(item.date).toLocaleDateString("ru")}
							</p>
							<p
								style={{ textBoxTrim: "trim-both" }}
								className="text-muted-foreground text-sm"
							>
								{item.type}
							</p>
						</div>
					</div>
					{item.type.startsWith("image/") ? (
						<Image
							className="pt-2"
							layout="constrained"
							height={80}
							width={160}
							src={`${getUrl()}/${item.id}.${item.ext}`}
						/>
					) : null}
				</div>
			))}
		</div>
	);
}

function FileUploader() {
	const maxSize = 100 * 1024 * 1024; // 100MB
	const setItems = useSetAtom(itemsAtom);
	// State to track upload progress for each file
	const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
	console.log("Upload progress:", uploadProgress);

	// Function to handle file upload to server
	const uploadFileToServer = async (file: FileWithPreview): Promise<Item> => {
		return new Promise((resolve, reject) => {
			try {
				// Create FormData
				const formData = new FormData();
				formData.append("file", file.file as File);
				console.log("Uploading file:", file.file.name);

				// Create XMLHttpRequest to track progress
				const xhr = new XMLHttpRequest();

				// Track upload progress
				xhr.upload.addEventListener("progress", (event) => {
					console.log("Progress:", event.loaded, "/", event.total);
					if (event.lengthComputable) {
						const progressPercent = Math.round(
							(event.loaded / event.total) * 100,
						);
						console.log("Progress:", progressPercent);
						// Update progress state for this file
						setUploadProgress((prev) =>
							prev.map((item) =>
								item.fileId === file.file.name
									? { ...item, progress: progressPercent }
									: item,
							),
						);
					}
				});

				// Handle completion
				xhr.addEventListener("load", () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						const response = JSON.parse(xhr.responseText) as {
							status: "success";
							data: Item;
						};
						// Mark as completed
						setUploadProgress((prev) =>
							prev.map((item) =>
								item.fileId === file.file.name
									? { ...item, completed: true }
									: item,
							),
						);
						console.log("Upload completed:", response.data);
						setItems((prev) => [response.data, ...prev]);
						handleFileRemoved(file.file.name);
						removeFile(file.id);
						resolve(response.data);
					} else {
						// Handle error
						setUploadProgress((prev) =>
							prev.map((item) =>
								item.fileId === file.file.name
									? { ...item, error: "Upload failed" }
									: item,
							),
						);
						reject(new Error("Upload failed"));
					}
				});

				// Handle error
				xhr.addEventListener("error", () => {
					setUploadProgress((prev) =>
						prev.map((item) =>
							item.fileId === file.file.name
								? { ...item, error: "Network error" }
								: item,
						),
					);
					reject(new Error("Network error"));
				});

				// Open and send the request
				xhr.open("POST", "/api/upload/", true);
				xhr.send(formData);
			} catch (error) {
				reject(error);
			}
		});
	};

	// Handle newly added files
	const handleFilesAdded = (addedFiles: FileWithPreview[]) => {
		// Initialize progress tracking for each new file
		const newProgressItems = addedFiles.map((file) => ({
			fileId: file.file.name,
			progress: 0,
			completed: false,
		}));

		// Add new progress items to state
		setUploadProgress((prev) => [...newProgressItems, ...prev]);

		// Start upload for each file
		addedFiles.forEach((file) => {
			if (file) {
				uploadFileToServer(file)
					.then((response) => {
						console.log("Upload successful:", response);
					})
					.catch((error) => {
						console.error("Upload failed:", error);
					});
			}
		});
	};

	// Remove the progress tracking for the file
	const handleFileRemoved = (fileId: string) => {
		setUploadProgress((prev) => prev.filter((item) => item.fileId !== fileId));
	};

	const [
		{ files, isDragging, errors },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			removeFile,
			clearFiles,
			getInputProps,
		},
	] = useFileUpload({
		multiple: true,
		maxSize,
		onFilesAdded: handleFilesAdded,
	});

	return (
		<div className="flex flex-col gap-2">
			{/* Drop area */}
			<div
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				data-dragging={isDragging || undefined}
				data-files={files.length > 0 || undefined}
				className="relative flex min-h-52 flex-col items-center not-data-files:justify-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
			>
				<input
					{...getInputProps()}
					className="sr-only"
					aria-label="Upload image file"
				/>
				{files.length > 0 ? (
					<div className="flex w-full flex-col gap-3">
						<div className="flex items-center justify-end gap-2">
							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={openFileDialog}>
									<UploadIcon
										className="-ms-0.5 size-3.5 opacity-60"
										aria-hidden="true"
									/>
									Добавить файлы
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										// Clear all progress tracking
										setUploadProgress([]);
										clearFiles();
									}}
								>
									<Trash2Icon
										className="-ms-0.5 size-3.5 opacity-60"
										aria-hidden="true"
									/>
									Удалить всё
								</Button>
							</div>
						</div>

						<div className="w-full space-y-2">
							{files.map((file) => {
								const fileProgress = uploadProgress.find(
									(p) => p.fileId === file.file.name,
								);
								const isUploading = fileProgress && !fileProgress.completed;
								console.log("fileProgress:", fileProgress);
								console.log("isUploading:", isUploading);
								return (
									<div
										key={file.id}
										data-uploading={isUploading || undefined}
										className="flex flex-col gap-1 rounded-lg border bg-background p-2 pe-3 transition-opacity duration-300"
									>
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-3 overflow-hidden in-data-[uploading=true]:opacity-50">
												<div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded border">
													{getFileIcon(file)}
												</div>
												<div className="flex min-w-0 flex-col gap-0.5">
													<p className="truncate font-medium text-[13px]">
														{file.file instanceof File
															? file.file.name
															: file.file.name}
													</p>
													<p className="text-muted-foreground text-xs">
														{formatBytes(
															file.file instanceof File
																? file.file.size
																: file.file.size,
														)}
													</p>
												</div>
											</div>
											<Button
												size="icon"
												variant="ghost"
												className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
												onClick={() => {
													handleFileRemoved(file.id);
													removeFile(file.id);
												}}
												aria-label="Remove file"
											>
												<XIcon className="size-4" aria-hidden="true" />
											</Button>
										</div>

										{/* Upload progress bar */}
										{fileProgress &&
											(() => {
												const progress = fileProgress.progress || 0;
												const completed = fileProgress.completed || false;

												if (completed) return null;

												return (
													<div className="mt-1 flex items-center gap-2">
														<div className="h-1.5 w-full overflow-hidden rounded-full bg-accent-foreground">
															<div
																className="h-full bg-accent-foreground transition-all duration-300 ease-out"
																style={{ width: `${progress}%` }}
															/>
														</div>
														<span className="w-10 text-muted-foreground text-xs tabular-nums">
															{progress}%
														</span>
													</div>
												);
											})()}
									</div>
								);
							})}
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center px-4 py-3 text-center">
						<div
							className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
							aria-hidden="true"
						>
							<ImageIcon className="size-4 opacity-60" />
						</div>
						<p className="mb-1.5 font-medium text-sm">Перетащите файлы сюда</p>
						<p className="text-muted-foreground text-xs">
							{/*Max {maxFiles} files ∙ Up to {maxSizeMB}MB*/}
						</p>
						<Button variant="outline" className="mt-4" onClick={openFileDialog}>
							<UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
							Выберите файлы
						</Button>
					</div>
				)}
			</div>

			{errors.length > 0 && (
				<div
					className="flex items-center gap-1 text-destructive text-xs"
					role="alert"
				>
					<AlertCircleIcon className="size-3 shrink-0" />
					<span>{errors[0]}</span>
				</div>
			)}
		</div>
	);
}
const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
	const fileType = file.file instanceof File ? file.file.type : file.file.type;
	const fileName = file.file instanceof File ? file.file.name : file.file.name;

	if (
		fileType.includes("pdf") ||
		fileName.endsWith(".pdf") ||
		fileType.includes("word") ||
		fileName.endsWith(".doc") ||
		fileName.endsWith(".docx")
	) {
		return <FileText className="size-4 opacity-60" />;
	}
	if (
		fileType.includes("zip") ||
		fileType.includes("archive") ||
		fileName.endsWith(".zip") ||
		fileName.endsWith(".rar")
	) {
		return <FileArchiveIcon className="size-4 opacity-60" />;
	}
	if (
		fileType.includes("excel") ||
		fileName.endsWith(".xls") ||
		fileName.endsWith(".xlsx")
	) {
		return <FileSpreadsheetIcon className="size-4 opacity-60" />;
	}
	if (fileType.includes("video/")) {
		return <VideoIcon className="size-4 opacity-60" />;
	}
	if (fileType.includes("audio/")) {
		return <HeadphonesIcon className="size-4 opacity-60" />;
	}
	if (fileType.startsWith("image/")) {
		return <ImageIcon className="size-4 opacity-60" />;
	}
	return <FileIcon className="size-4 opacity-60" />;
};
