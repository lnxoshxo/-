import type { DocumentRecord, KnowledgeChunk } from '../types';

const DEFAULT_CHUNK_SIZE = 180;
const DEFAULT_OVERLAP = 30;

const CHINESE_STOP_WORDS = new Set(['的', '了', '和', '与', '或', '及', '在', '对', '按', '未', '有', '会', '吗', '呢', '啊', '将', '可', '应', '于']);

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function tokenize(value: string) {
  const normalized = normalizeText(value).toLowerCase();
  const tokens = new Set<string>();

  for (const match of normalized.matchAll(/[\p{Script=Han}]{2,}|[\p{L}\p{N}]{2,}/gu)) {
    const part = match[0];
    tokens.add(part);

    if (/^[\p{Script=Han}]+$/u.test(part)) {
      for (let index = 0; index < part.length; index += 1) {
        const single = part.slice(index, index + 1);
        if (!CHINESE_STOP_WORDS.has(single)) {
          tokens.add(single);
        }

        const bigram = part.slice(index, index + 2);
        if (bigram.length === 2) {
          tokens.add(bigram);
        }
      }
    }
  }

  return [...tokens];
}

export function splitIntoChunks(document: DocumentRecord, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP): KnowledgeChunk[] {
  const content = normalizeText(document.content);
  if (!content) {
    return [];
  }

  const chunks: KnowledgeChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    const snippet = content.slice(start, end);
    chunks.push({
      id: `${document.id}-chunk-${index + 1}`,
      documentId: document.id,
      title: document.title,
      snippet,
      score: 0,
    });

    if (end === content.length) {
      break;
    }

    start = Math.max(end - overlap, start + 1);
    index += 1;
  }

  return chunks;
}

export function rankChunks(question: string, documents: DocumentRecord[]): KnowledgeChunk[] {
  const tokens = tokenize(question);

  return documents
    .flatMap((document) => splitIntoChunks(document))
    .map((chunk) => {
      const haystack = `${chunk.title} ${chunk.snippet}`.toLowerCase();
      const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score || a.snippet.length - b.snippet.length)
    .slice(0, 4);
}

export function previewDocumentChunks(document: DocumentRecord): KnowledgeChunk[] {
  return splitIntoChunks(document).map((chunk, index) => ({
    ...chunk,
    score: index + 1,
  }));
}
