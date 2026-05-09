import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type ParseInput = {
  fileName: string;
  mimeType?: string;
  buffer: Buffer;
};

type ParseResult = {
  content: string;
  parser: 'text' | 'markdown' | 'pdf-placeholder' | 'docx-placeholder' | 'unsupported';
};

function extensionOf(fileName: string) {
  const index = fileName.lastIndexOf('.');
  return index === -1 ? '' : fileName.slice(index).toLowerCase();
}

function normalizeWhitespace(content: string) {
  return content.replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
}

async function extractPdfText(fileName: string, buffer: Buffer) {
  const dir = await mkdtemp(join(tmpdir(), 'siicservice-pdf-'));
  const filePath = join(dir, fileName);

  try {
    await writeFile(filePath, buffer);
    const { stdout } = await execFileAsync('strings', [filePath], { maxBuffer: 16 * 1024 * 1024 });
    const content = normalizeWhitespace(stdout);

    return content || [
      `当前文件名：${fileName}`,
      '系统已识别 PDF 文件，但未提取到稳定正文。',
      '建议优先通过外部解析结果导入，或上传文本版资料。',
    ].join('\n');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function extractDocxText(fileName: string, buffer: Buffer) {
  const dir = await mkdtemp(join(tmpdir(), 'siicservice-docx-'));
  const filePath = join(dir, fileName);

  try {
    await writeFile(filePath, buffer);
    const { stdout } = await execFileAsync('unzip', ['-p', filePath, 'word/document.xml'], { maxBuffer: 16 * 1024 * 1024 });
    const content = normalizeWhitespace(
      stdout
        .replace(/<w:p[^>]*>/g, '\n')
        .replace(/<w:tab\/?[^>]*>/g, '\t')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
    );

    return content || [
      `当前文件名：${fileName}`,
      '系统已识别 DOCX 文件，但未提取到稳定正文。',
      '建议检查文档内容是否为图片扫描件。',
    ].join('\n');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export async function parseDocumentContent(input: ParseInput): Promise<ParseResult> {
  const extension = extensionOf(input.fileName);

  if (extension === '.txt' || extension === '.md') {
    return {
      content: input.buffer.toString('utf-8').trim(),
      parser: extension === '.md' ? 'markdown' : 'text',
    };
  }

  if (extension === '.pdf') {
    return {
      content: await extractPdfText(input.fileName, input.buffer),
      parser: 'pdf-placeholder',
    };
  }

  if (extension === '.docx') {
    return {
      content: await extractDocxText(input.fileName, input.buffer),
      parser: 'docx-placeholder',
    };
  }

  return {
    content: input.buffer.toString('utf-8').trim(),
    parser: 'unsupported',
  };
}
