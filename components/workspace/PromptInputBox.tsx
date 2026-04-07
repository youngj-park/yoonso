'use client';

import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ArrowUp, ChevronUp, Clock, Music } from "lucide-react";
import { motion } from "framer-motion";

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-base text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none",
      className
    )}
    ref={ref}
    rows={1}
    style={{ scrollbarWidth: "thin", scrollbarColor: "#444444 transparent" }}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// Tooltip
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md border border-[#333333] bg-[#1F2023] px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-white hover:bg-white/80 text-black",
      outline: "border border-[#444444] bg-transparent hover:bg-[#3A3A40]",
      ghost: "bg-transparent hover:bg-[#3A3A40]",
    };
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6",
      icon: "h-8 w-8 rounded-full aspect-[1/1]",
    };
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// OptionPopover
interface OptionPopoverProps<T extends string | number> {
  icon: React.ReactNode;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}
function OptionPopover<T extends string | number>({ icon, options, value, onChange, disabled }: OptionPopoverProps<T>) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 h-8 text-xs font-medium border transition-colors",
          open
            ? "border-[#555] bg-[#2E3033] text-white"
            : "border-transparent text-[#9CA3AF] hover:text-[#D1D5DB] hover:bg-gray-600/30",
          disabled && "opacity-40 pointer-events-none"
        )}
      >
        {icon}
        <span className={cn("transition-colors", open ? "text-white" : "text-[#D1D5DB]")}>{current?.label}</span>
        <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <ChevronUp className="h-3 w-3" />
        </motion.div>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full mb-2 left-0 z-50 min-w-[110px] rounded-xl border border-[#444444] bg-[#1F2023] shadow-xl overflow-hidden py-1"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[#2E3033] flex items-center justify-between gap-2",
                opt.value === value ? "text-white" : "text-[#9CA3AF]"
              )}
            >
              {opt.label}
              {opt.value === value && (
                <div className="h-1.5 w-1.5 rounded-full bg-white/60 flex-shrink-0" />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// PromptInput context
interface PromptInputContextType {
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
  maxHeight: number | string;
  onSubmit?: () => void;
  disabled?: boolean;
}
const PromptInputContext = React.createContext<PromptInputContextType>({
  isLoading: false, value: "", setValue: () => {}, maxHeight: 240, onSubmit: undefined, disabled: false,
});
function usePromptInput() {
  return React.useContext(PromptInputContext);
}

interface PromptInputProps {
  isLoading?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  maxHeight?: number | string;
  onSubmit?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}
const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  ({ className, isLoading = false, maxHeight = 240, value, onValueChange, onSubmit, children, disabled = false }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "");
    const handleChange = (newValue: string) => { setInternalValue(newValue); onValueChange?.(newValue); };
    return (
      <TooltipProvider>
        <PromptInputContext.Provider value={{ isLoading, value: value ?? internalValue, setValue: onValueChange ?? handleChange, maxHeight, onSubmit, disabled }}>
          <div
            ref={ref}
            className={cn("rounded-3xl border border-[#444444] bg-[#1F2023] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.24)] transition-all duration-300", className)}
          >
            {children}
          </div>
        </PromptInputContext.Provider>
      </TooltipProvider>
    );
  }
);
PromptInput.displayName = "PromptInput";

const PromptInputTextarea: React.FC<{ disableAutosize?: boolean; placeholder?: string } & React.ComponentProps<typeof Textarea>> = ({
  className, onKeyDown, disableAutosize = false, placeholder, ...props
}) => {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (disableAutosize || !textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [value, maxHeight, disableAutosize]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit?.(); }
        onKeyDown?.(e);
      }}
      className={cn("text-base", className)}
      disabled={disabled}
      placeholder={placeholder}
      {...props}
    />
  );
};

const PromptInputActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>{children}</div>
);

const PromptInputAction: React.FC<{ tooltip: React.ReactNode; children: React.ReactNode; side?: "top" | "bottom" | "left" | "right" } & React.ComponentProps<typeof Tooltip>> = ({
  tooltip, children, side = "top", ...props
}) => {
  const { disabled } = usePromptInput();
  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled}>{children}</TooltipTrigger>
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  );
};

// Duration options
const DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 60, label: "1분" },
  { value: 120, label: "2분" },
  { value: 180, label: "3분" },
];

// Format options
const FORMAT_OPTIONS: { value: "wav" | "mp3"; label: string }[] = [
  { value: "mp3", label: "MP3" },
  { value: "wav", label: "WAV" },
];

export type OutputFormat = "wav" | "mp3";

export interface MusicGenOptions {
  duration: number;
  outputFormat: OutputFormat;
}

// Main export
interface PromptInputBoxProps {
  onSend?: (message: string, options: MusicGenOptions) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export const PromptInputBox = React.forwardRef<HTMLDivElement, PromptInputBoxProps>((props, ref) => {
  const { onSend = () => {}, isLoading = false, placeholder = "Type your message here...", className } = props;
  const [input, setInput] = React.useState("");
  const [duration, setDuration] = React.useState<number>(60);
  const [outputFormat, setOutputFormat] = React.useState<OutputFormat>("mp3");
  const promptBoxRef = React.useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSend(input, { duration, outputFormat });
    setInput("");
  };

  const hasContent = input.trim() !== "";

  return (
    <PromptInput
      value={input}
      onValueChange={setInput}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      className={cn("w-full transition-all duration-300 ease-in-out", className)}
      disabled={isLoading}
      ref={ref ?? promptBoxRef}
    >
      <PromptInputTextarea placeholder={placeholder} className="text-base" />

      <PromptInputActions className="flex items-center justify-between gap-2 p-0 pt-2">
        <div className="flex items-center gap-1">
          <OptionPopover
            icon={<Clock className="h-3.5 w-3.5" />}
            options={DURATION_OPTIONS}
            value={duration}
            onChange={(v) => setDuration(v as number)}
            disabled={isLoading}
          />
          <OptionPopover
            icon={<Music className="h-3.5 w-3.5" />}
            options={FORMAT_OPTIONS}
            value={outputFormat}
            onChange={(v) => setOutputFormat(v as OutputFormat)}
            disabled={isLoading}
          />
        </div>

        <PromptInputAction tooltip={isLoading ? "Generating..." : hasContent ? "Generate" : "Enter a prompt"}>
          <Button
            variant="default"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full transition-all duration-200",
              hasContent && !isLoading
                ? "bg-white hover:bg-white/80 text-[#1F2023]"
                : "bg-transparent hover:bg-gray-600/30 text-[#9CA3AF] hover:text-[#D1D5DB]"
            )}
            onClick={handleSubmit}
            disabled={isLoading || !hasContent}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 rounded-full border-2 border-[#9CA3AF] border-t-transparent"
              />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </PromptInputAction>
      </PromptInputActions>
    </PromptInput>
  );
});
PromptInputBox.displayName = "PromptInputBox";
