import fs from "fs/promises";
import path from "path";
import Link from "next/link";

async function readLogbook() {
  const file = path.join(process.cwd(), "LOGBOOK.md");
  return fs.readFile(file, "utf8");
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
      const Tag = `h${level}` as any;
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

export default async function Page() {
  const md = await readLogbook();
  const nodes = renderMarkdownAsNodes(md);

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-3xl p-6">
        <div className="flex justify-end mb-4">
          <Link href="/" className="text-sm text-gray-300 hover:text-white">
            Domov
          </Link>
        </div>
        <h1 className="text-2xl font-semibold mb-4 text-gray-100">Logbook</h1>
        <article className="rounded border border-gray-800 bg-gray-900 p-6 shadow-sm">
          {nodes}
        </article>
      </div>
    </main>
  );
}
