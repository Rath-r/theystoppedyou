"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

async function readLogbook() {
  const response = await fetch("/api/logbook");
  const data = await response.json();
  return data.content;
}

function renderMarkdownAsNodes(md: string) {
  const lines = md.split(/\r?\n/);
  const nodes: any[] = [];
  let listBuffer: string[] | null = null;
  let key = 0;

  const flushList = () => {
    if (listBuffer) {
      nodes.push(
        <ul className="list-disc ml-6 mb-4 text-gray-200" key={`ul-${key++}`}>
          {listBuffer.map((li) => (
            <li key={li}>{li}</li>
          ))}
        </ul>,
      );
      listBuffer = null;
    }
  };

  for (const line of lines) {
    const H = line.match(/^#{1,6}\s+(.*)$/);
    const li = line.match(/^\s*[-*+]\s+(.*)$/);
    if (H) {
      flushList();
      const level = line.match(/^#{1,6}/)![0].length;
      const text = H[1];
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      const hClass =
        level === 1 ? "text-2xl" : level === 2 ? "text-xl" : "text-lg";
      nodes.push(
        <Tag
          className={`${hClass} font-semibold mt-6 mb-3 text-gray-100`}
          key={`h-${key++}`}
        >
          {text}
        </Tag>,
      );
      continue;
    }

    if (li) {
      listBuffer = listBuffer || [];
      listBuffer.push(li[1]);
      continue;
    }

    if (line.trim() === "") {
      flushList();
      continue;
    }

    // paragraph
    flushList();
    if (line.trim().startsWith("_") && line.trim().endsWith("_")) {
      nodes.push(
        <p className="mb-3 text-gray-400 text-sm italic" key={`p-${key++}`}>
          {line.replace(/^_|_$/g, "")}
        </p>,
      );
    } else {
      nodes.push(
        <p className="mb-3 text-gray-200" key={`p-${key++}`}>
          {line}
        </p>,
      );
    }
  }

  flushList();
  return nodes;
}

export default function LogbookPage() {
  const [logbookContent, setLogbookContent] = useState<string>("");
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    readLogbook().then((content) => {
      setLogbookContent(content);
      setNodes(renderMarkdownAsNodes(content));
    });
  }, []);

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-4xl p-6">
        <header className="space-y-4 mb-8">
          <div className="flex justify-end border-b border-gray-700 pb-4">
            <nav>
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-300"
              >
                Domov
              </Link>
            </nav>
          </div>

          <h1 className="text-3xl font-bold text-white">Logbook</h1>
        </header>

        <article className="space-y-2 text-gray-200">{nodes}</article>
      </div>
    </main>
  );
}
