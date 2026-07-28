import type { FileWithPreview } from "@/hooks/use-file-upload.ts";
import type { Item } from "@/lib/store.tsx";

import { useEffect, useEffectEvent, useState } from "react";

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
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

import { CopyButton } from "@/components/copy-button/copy-button.tsx";
import { Example, ExampleWrapper } from "@/components/example.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ButtonGroup } from "@/components/ui/button-group.tsx";
import {
	Card,
	CardAction,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card.tsx";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload.ts";
import { itemsAtom } from "@/lib/store.tsx";
import { getUrl, isAPNG, removeExif } from "@/lib/utils.ts";

export const Route = createFileRoute("/")({ component: App, ssr: false });

type UploadProgress = {
	fileId: string;
	progress: number;
	completed: boolean;
	error?: string;
};

function App() {
	return (
		<ExampleWrapper>
			<h2 className="col-span-2 pb-2 font-semibold text-3xl tracking-tight">
				uploader
			</h2>
			<div className="flex col-span-2">
				<Dialog>
					<DialogTrigger
						render={
							<Button className="w-fit" variant="ghost">
								Условия использования
							</Button>
						}
					></DialogTrigger>
					<DialogContent className="min-w-3xl">
						<DialogHeader>
							<DialogTitle>Условия использования</DialogTitle>
							<DialogDescription>
								Настоящие Условия предоставления услуг («Условия») регулируют
								ваше использование данного Сервиса.
							</DialogDescription>
						</DialogHeader>
						<div className="no-scrollbar -mx-4 max-h-[80vh] overflow-y-auto px-4">
							<p className="not-first:mt-6 leading-7">
								Используя данный сервис, вы соглашаетесь со следующим:
							</p>
							<ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
								<li>
									<strong>Пользовательский контент:</strong> Мы не несем
									ответственности за пользовательский контент («Контент»).
								</li>
								<li>
									<strong>Мнения авторов контента:</strong> Загруженный контент
									отражает исключительно точку зрения пользователя который это
									загрузил.
								</li>
								<li>
									<strong>Возрастное ограничение:</strong> Данная услуга
									предназначена для пользователей, достигших 18 лет.
								</li>
								<li>
									<strong>Проверка контента:</strong> Весь контент может быть
									проверен нами.
								</li>
								<li>
									<strong>Запрещенный контент:</strong> Не размещайте незаконный
									или вредоносный контент.
								</li>
								<li>
									<strong>Ответственность:</strong> Вы несете ответственность за
									контент, который вы предоставляете, и за любой причиненный в
									результате этого вред.
								</li>
								<li>
									<strong>Изменение и удаление контента:</strong> Мы можем
									удалять или изменять контент в любое время.
								</li>
								<li>
									<strong>Коммерческое использование:</strong> требуется
									разрешение на коммерческое использование третьими лицами. для
									коммерческого использования третьими лицами.
								</li>
								<li>
									<strong>Прекращение действия:</strong> Мы можем прекратить ваш
									доступ в любое время.
								</li>
							</ol>
							<p className="not-first:mt-6 leading-7">
								Использование вами Сервиса подразумевает принятие вами настоящих
								Условий.
							</p>
							<p className="not-first:mt-6 leading-7">
								Мы оставляем за собой право вносить изменения в настоящие
								Условия в любое время без предварительного уведомления.
							</p>
							<p className="not-first:mt-6 leading-7">
								<strong>Контакт: request@sofrin.ru</strong>
							</p>
							<p className="not-first:mt-6 leading-7">
								<strong>Последнее обновление: 1 Марта, 2026</strong>
							</p>
						</div>
					</DialogContent>
				</Dialog>
				<Button
					nativeButton={false}
					render={
						<a download="uploader.sxcu" href="/uploader.sxcu">
							ShareX конфиг
						</a>
					}
					variant="link"
				></Button>
				<Button
					className="ml-auto"
					nativeButton={false}
					render={
						<a
							rel="noopener"
							target="_blank"
							href="https://github.com/sofrin/uploader"
						>
							<svg
								fill="none"
								height="24"
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								width="24"
								xmlns="http://w3.org"
							>
								<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
								<path d="M9 18c-4.51 2-5-2-7-2" />
							</svg>
						</a>
					}
					variant="link"
				></Button>
				<Button
					nativeButton={false}
					render={
						<a
							rel="noopener"
							target="_blank"
							href="https://donate.stream/sofrin"
						>
							Донат
						</a>
					}
				></Button>
			</div>
			<div className="col-span-2">
				<Example className="col-span-2">
					<FileUploader />
				</Example>
			</div>
			<SavedFiles />
		</ExampleWrapper>
	);
}

function SavedFiles() {
	const [items, setItems] = useAtom(itemsAtom);

	return (
		<AnimatePresence>
			{items.map((item) => (
				<motion.div
					animate={{ opacity: 1 }}
					className="fade-in col-span-2 md:col-span-1 flex w-full animate-in flex-col gap-2 border p-2"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					key={item.id}
					layout
				>
					<Card className="relative mx-auto  pt-0">
						{item.type.startsWith("image/") ? (
							<Image
								className="relative z-20 aspect-video object-cover"
								height={80}
								aspectRatio={16/9}
								loading="lazy"
								src={`${getUrl()}/${item.id}.${item.ext}`}
								// width={160}
							/>
						) : null}
						{item.type.startsWith("video/") ? (
							<video
								className="relative z-20 aspect-video w-full object-cover"
								controls
								height={80}
								//@ts-expect-error
								loading="lazy"
								preload="metadata"
								src={`${getUrl()}/${item.id}.${item.ext}`}
								type={`video/${item.ext}`}
								width={160}
							/>
						) : null}
						{item.type.startsWith("audio/") ? (
							<audio
								className="w-full rounded-none"
								controls
								//@ts-expect-error
								loading="lazy"
								preload="metadata"
								src={`${getUrl()}/${item.id}.${item.ext}`}
							/>
						) : null}
						<CardHeader>
							<CardAction>
								<Badge variant="secondary">
									{new Date(item.date).toLocaleDateString("ru")}
								</Badge>
							</CardAction>
							<CardTitle> {item.name}</CardTitle>
						</CardHeader>
						<CardFooter>
							<ButtonGroup className="flex w-full">
								<CopyButton
									className="grow pr-3 pl-2.5 will-change-transform"
									size="default"
									text={`${getUrl()}/${item.id}.${item.ext}`}
									variant="outline"
								>
									{`${getUrl()}/${item.id}.${item.ext}`}
								</CopyButton>
								<Button
									nativeButton={false}
									render={
										<a
											href={`/${item.id}.${item.ext}`}
											rel="noopener"
											target="_blank"
										>
											<ExternalLinkIcon />
										</a>
									}
									variant="outline"
								></Button>

								<Button
									className="bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 dark:hover:bg-destructive/30"
									onClick={async () => {
										await fetch(`/api/file/${item.key}`, {
											method: "DELETE",
										})
											.then(() =>
												setItems((prevItems) =>
													prevItems.filter((i) => i.id !== item.id),
												),
											)
											.catch((e) => console.error(e));
									}}
									size="icon"
									variant="outline"
								>
									<Trash2Icon />
								</Button>
							</ButtonGroup>
						</CardFooter>
					</Card>
				</motion.div>
			))}
		</AnimatePresence>
	);
}

function FileUploader() {
	const maxSize = 100 * 1024 * 1024; // 100MB
	const setItems = useSetAtom(itemsAtom);
	// State to track upload progress for each file
	const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
	console.log("Upload progress:", uploadProgress);
	const onPaste = useEffectEvent((e: ClipboardEvent) => {
		if (!e.clipboardData?.files.length) {
			return;
		}
		addFiles(e.clipboardData?.files);
	});
	useEffect(() => {
		document.addEventListener("paste", (e) => {
			e.preventDefault();
			if (!e.clipboardData?.files.length) {
				return;
			}
			onPaste(e);
		});
		return () => {
			document.removeEventListener("paste", onPaste);
		};
	}, []);
	// Function to handle file upload to server
	const uploadFileToServer = async (file: FileWithPreview): Promise<Item> => {
		if (window.umami) {
			void umami.track("file upload");
		}

		const strippedFile = await removeExif(file.file as File);
		return new Promise((resolve, reject) => {
			try {
				// Create FormData
				const formData = new FormData();
				formData.append("file", strippedFile);
				formData.append("type", strippedFile.type);
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
						const response = JSON.parse(xhr.responseText) as Item & {
							status: "success";
						};
						// Mark as completed
						setUploadProgress((prev) =>
							prev.map((item) =>
								item.fileId === file.file.name
									? { ...item, completed: true }
									: item,
							),
						);
						console.log("Upload completed:", response);
						setItems((prev) => [response, ...prev]);
						handleFileRemoved(file.file.name);
						removeFile(file.id);
						resolve(response);
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
				xhr.open("POST", "/api/file/", true);
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
			completed: false,
			fileId: file.file.name,
			progress: 0,
		}));

		// Add new progress items to state
		setUploadProgress((prev) => [...newProgressItems, ...prev]);

		// Start upload for each file
		addedFiles.forEach(async (file) => {
			if (file) {
				if (
					file.file.type === "image/png" &&
					(await isAPNG(file.file as File))
				) {
					toast.error("apng не принимаются");
					return removeFile(file.id);
				}
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
			addFiles,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			removeFile,
			clearFiles,
			getInputProps,
		},
	] = useFileUpload({
		maxFiles: 10,
		maxSize,
		multiple: true,
		onFilesAdded: handleFilesAdded,
	});
	return (
		<div className="flex flex-col gap-2">
			{/* Drop area */}
			<div
				className="relative flex min-h-52 flex-col items-center not-data-files:justify-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
				data-dragging={isDragging || undefined}
				data-files={files.length > 0 || undefined}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<input
					{...getInputProps()}
					aria-label="Upload image file"
					className="sr-only"
				/>
				<AnimatePresence initial={false}>
					{files.length > 0 ? (
						<div className="flex w-full flex-col gap-3">
							<div className="flex items-center justify-end gap-2">
								<div className="flex gap-2">
									<Button onClick={openFileDialog} size="sm" variant="outline">
										<UploadIcon
											aria-hidden="true"
											className="-ms-0.5 size-3.5 opacity-60"
										/>
										Добавить файлы
									</Button>
									<Button
										onClick={() => {
											// Clear all progress tracking
											setUploadProgress([]);
											clearFiles();
										}}
										size="sm"
										variant="outline"
									>
										<Trash2Icon
											aria-hidden="true"
											className="-ms-0.5 size-3.5 opacity-60"
										/>
										Удалить всё
									</Button>
								</div>
							</div>

							<div className="w-full space-y-2">
								<AnimatePresence mode="popLayout">
									{files.map((file) => {
										const fileProgress = uploadProgress.find(
											(p) => p.fileId === file.file.name,
										);
										const isUploading = fileProgress && !fileProgress.completed;
										console.log("fileProgress:", fileProgress);
										console.log("isUploading:", isUploading);
										return (
											<motion.div
												animate={{ opacity: 1 }}
												className="flex flex-col gap-1 rounded-lg border bg-background p-2 pe-3 transition-opacity duration-300"
												data-uploading={isUploading || undefined}
												exit={{ opacity: 0 }}
												initial={{ opacity: 0 }}
												key={file.id}
												layout
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
														aria-label="Remove file"
														className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
														onClick={() => {
															handleFileRemoved(file.id);
															removeFile(file.id);
														}}
														size="icon"
														variant="ghost"
													>
														<XIcon aria-hidden="true" className="size-4" />
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
																<div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
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
											</motion.div>
										);
									})}
								</AnimatePresence>
							</div>
						</div>
					) : (
						<motion.div
							className="flex flex-col items-center justify-center px-4 py-3 text-center"
							exit={{ opacity: 0 }}
							layout
						>
							<div
								aria-hidden="true"
								className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
							>
								<ImageIcon className="size-4 opacity-60" />
							</div>
							<p className="mb-1.5 font-medium text-sm">
								Перетащите файлы сюда
							</p>
							<p className="text-muted-foreground text-xs">
								Максимум 10 ∙ До 100 MB
							</p>
							<Button
								className="mt-4"
								onClick={openFileDialog}
								variant="outline"
							>
								<UploadIcon aria-hidden="true" className="-ms-1 opacity-60" />
								Выберите файлы
							</Button>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{errors.length > 0 && (
				<motion.div
					className="flex items-center gap-1 text-destructive text-xs"
					role="alert"
				>
					<AlertCircleIcon className="size-3 shrink-0" />
					<span>{errors[0]}</span>
				</motion.div>
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
