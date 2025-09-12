"use client";

import React, { useMemo, useRef } from "react";
import JoditEditor from "jodit-react";

type Props = {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
};

export default function Editor({
  value,
  onChange,
  height = 100, // smaller height
  placeholder = "Enter text...",
}: Props) {
  const editor = useRef<any>(null);

  const config = useMemo(() => {
    return {
      readonly: false,
      toolbar: true,
      language: "de",
      toolbarAdaptive: false,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: false,
      askBeforePasteHTML: true,
      askBeforePasteFromWord: true,

      height,
      placeholder,
      buttons: ["bold", "italic", "underline",  "font", "fontsize"],
      plugins: ["lists", "font"],
      style: {
        fontSize: "11px",
        lineHeight: "1.2",
      },

    };
  }, [height, placeholder]);

  return (
    <JoditEditor
      ref={editor}
      value={value}
      onBlur={(newContent) => onChange(newContent)}
      config={config}
    />
  );
}
