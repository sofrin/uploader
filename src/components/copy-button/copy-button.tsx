"use client";

import type { HTMLMotionProps, Variants } from "motion/react";
import type { ComponentProps } from "react";
import type { CopyState } from "@/hooks/use-copy-to-clipboard.ts";

import { CheckIcon, CircleXIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button.tsx";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard.ts";

export const motionIconVariants: Variants = {
	animate: { filter: "blur(0px)", opacity: 1, scale: 1 },
	exit: { opacity: 0, scale: 0.8 },
	initial: { filter: "blur(2px)", opacity: 0, scale: 0.8 },
};

export const motionIconProps: HTMLMotionProps<"span"> = {
	animate: "animate",
	exit: "exit",
	initial: "initial",
	transition: { duration: 0.15, ease: "easeOut" },
	variants: motionIconVariants,
};

export function CopyStateIcon({ state }: { state: CopyState }) {
	return (
		<AnimatePresence initial={false} mode="popLayout">
			{state === "idle" ? (
				<motion.span key="idle" {...motionIconProps}>
					<CopyIcon />
				</motion.span>
			) : state === "done" ? (
				<motion.span key="done" {...motionIconProps}>
					<CheckIcon strokeWidth={3} />
				</motion.span>
			) : state === "error" ? (
				<motion.span key="error" {...motionIconProps}>
					<CircleXIcon />
				</motion.span>
			) : null}
		</AnimatePresence>
	);
}

export type CopyButtonProps = ComponentProps<typeof Button> & {
	/** The text to copy, or a function that returns the text. */
	text: string | (() => string);
	/** Called with the copied text on successful copy. */
	onCopySuccess?: (text: string) => void;
	/** Called with the error if the copy operation fails. */
	onCopyError?: (error: Error) => void;
};

export function CopyButton({
	size = "icon",
	children,
	text,
	onCopySuccess,
	onCopyError,
	onClick,
	...props
}: CopyButtonProps) {
	const { state, copy } = useCopyToClipboard({
		onCopyError,
		onCopySuccess,
	});

	return (
		<Button
			aria-label="Copy"
			onClick={async (e) => {
				await copy(text);
				onClick?.(e);
			}}
			size={size}
			{...props}
		>
			<CopyStateIcon state={state} />
			{children}
		</Button>
	);
}
