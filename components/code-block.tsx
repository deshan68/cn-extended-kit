"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  className?: string;
}

export function CodeBlock({
  children,
  language = "bash",
  title,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={cn("relative group", className)}>
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted border border-b-0 rounded-t-lg">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 "
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      <div className="relative">
        <pre
          className={cn(
            "overflow-x-auto p-4 bg-muted/50 border rounded-lg font-mono text-sm",
            title && "rounded-t-none border-t-0"
          )}
        >
          <code
            className={cn(
              language === "bash" && "text-green-600 dark:text-green-400",
              language === "javascript" && "text-blue-600 dark:text-blue-400",
              language === "typescript" && "text-blue-600 dark:text-blue-400",
              language === "json" && "text-orange-600 dark:text-orange-400"
            )}
          >
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}
