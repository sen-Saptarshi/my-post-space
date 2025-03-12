import { useRef } from "react";

interface TextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!textareaRef.current) return;

    if (e.key === "Tab") {
      e.preventDefault();
      insertText("    "); // Insert 4 spaces for tab
    } else if (e.key === "b" && e.ctrlKey) {
      e.preventDefault();
      wrapText("**"); // Bold
    } else if (e.key === "i" && e.ctrlKey) {
      e.preventDefault();
      wrapText("*"); // Italic
    } else if (e.key === "1" && e.ctrlKey) {
      e.preventDefault();
      insertText("# "); // Heading
    } else if (e.key === "ArrowUp" && e.altKey) {
      e.preventDefault();
      moveLine(-1); // Move line up
    } else if (e.key === "ArrowDown" && e.altKey) {
      e.preventDefault();
      moveLine(1); // Move line down
    }
  };

  const insertText = (text: string) => {
    if (!textareaRef.current) return;
    const { selectionStart } = textareaRef.current;
    const newText =
      value.slice(0, selectionStart) + text + value.slice(selectionStart);
    onChange({
      target: { value: newText },
    } as React.ChangeEvent<HTMLTextAreaElement>);
    setTimeout(() => {
      textareaRef.current!.selectionStart = textareaRef.current!.selectionEnd =
        selectionStart + text.length;
    }, 0);
  };

  const wrapText = (wrapper: string) => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    const selectedText = value.slice(selectionStart, selectionEnd);
    const newText =
      value.slice(0, selectionStart) +
      wrapper +
      selectedText +
      wrapper +
      value.slice(selectionEnd);
    onChange({
      target: { value: newText },
    } as React.ChangeEvent<HTMLTextAreaElement>);
    setTimeout(() => {
      textareaRef.current!.selectionStart = selectionStart + wrapper.length;
      textareaRef.current!.selectionEnd = selectionEnd + wrapper.length;
    }, 0);
  };

  const moveLine = (direction: -1 | 1) => {
    if (!textareaRef.current) return;

    const { selectionStart } = textareaRef.current;
    const lines = value.split("\n");
    let cursorLine = value.substring(0, selectionStart).split("\n").length - 1;

    if (
      (direction === -1 && cursorLine === 0) ||
      (direction === 1 && cursorLine === lines.length - 1)
    ) {
      return; // Prevent moving if already at top/bottom
    }

    // Swap the current line with the target line
    const temp = lines[cursorLine];
    lines[cursorLine] = lines[cursorLine + direction];
    lines[cursorLine + direction] = temp;

    const newText = lines.join("\n");
    onChange({
      target: { value: newText },
    } as React.ChangeEvent<HTMLTextAreaElement>);

    setTimeout(() => {
      let newCursorPos = 0;
      for (let i = 0; i < cursorLine + direction; i++) {
        newCursorPos += lines[i].length + 1; // +1 for newline characters
      }
      textareaRef.current!.selectionStart = textareaRef.current!.selectionEnd =
        newCursorPos;
    }, 0);
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e);
        autoResize();
      }}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`min-h-[60vh] w-full resize-none border-none bg-transparent text-lg outline-none placeholder:text-muted-foreground/50 ${className}`}
    />
  );
};

export default TextArea;
