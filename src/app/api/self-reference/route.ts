import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadQuranData } from "quran-search-engine";

type GraphConnection = { verse: string; shared: string[]; score: number };
type VerseGraph = {
  meta: Record<string, unknown>;
  verses: Record<string, { connections: GraphConnection[] }>;
};

const g = global as unknown as {
  _selfRefGraph?: VerseGraph;
  _selfRefVerseByKey?: Map<string, import("quran-search-engine").QuranText>;
};

async function getGraph(): Promise<VerseGraph> {
  if (g._selfRefGraph) return g._selfRefGraph;
  const file = join(process.cwd(), "src", "data", "verse_graph.json");
  g._selfRefGraph = JSON.parse(await readFile(file, "utf8")) as VerseGraph;
  return g._selfRefGraph;
}

async function getVerseByKey() {
  if (g._selfRefVerseByKey) return g._selfRefVerseByKey;
  const quran = await loadQuranData();
  const byKey = new Map<string, import("quran-search-engine").QuranText>();
  for (const verse of quran.values()) {
    byKey.set(`${verse.sura_id}:${verse.aya_id}`, verse);
  }
  g._selfRefVerseByKey = byKey;
  return byKey;
}

function describe(
  verse: import("quran-search-engine").QuranText | undefined,
  verseKey: string
) {
  return {
    verse_key: verseKey,
    text: verse?.uthmani ?? "",
    sura_id: verse?.sura_id ?? null,
    sura_name: verse?.sura_name ?? null,
    aya_id: verse?.aya_id ?? null,
    aya_id_display: verse?.aya_id_display ?? null,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("verse")?.trim() ?? "";

  if (!/^\d{1,3}:\d{1,3}$/.test(raw)) {
    return NextResponse.json(
      { error: 'Query parameter "verse" is required in the form "2:255".' },
      { status: 400 }
    );
  }

  try {
    const [graph, byKey] = await Promise.all([getGraph(), getVerseByKey()]);

    const source = byKey.get(raw);
    if (!source) {
      return NextResponse.json(
        { error: `Verse "${raw}" not found.` },
        { status: 404 }
      );
    }

    const connections = graph.verses[raw]?.connections ?? [];

    // Graph is pre-sorted by score desc; cap at the top 20 and hydrate text.
    const results = connections.slice(0, 20).map((connection) => ({
      ...describe(byKey.get(connection.verse), connection.verse),
      shared_roots: connection.shared,
      similarity_score: connection.score,
    }));

    return NextResponse.json({
      source: describe(source, raw),
      count: results.length,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
