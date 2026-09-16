'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function isSourceFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  if (normalized.includes('/node_modules/') || normalized.includes('/.next/')) {
    return false;
  }
  return /\.(tsx?|jsx?|mjs|cjs|css)$/.test(normalized);
}

function scriptKind(filePath) {
  if (filePath.endsWith('.tsx')) return ts.ScriptKind.TSX;
  if (filePath.endsWith('.jsx')) return ts.ScriptKind.JSX;
  if (filePath.endsWith('.ts')) return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

function isJsx(kind) {
  return kind === ts.ScriptKind.TSX || kind === ts.ScriptKind.JSX;
}

function stripTsComments(text, kind) {
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    isJsx(kind) ? ts.LanguageVariant.JSX : ts.LanguageVariant.Standard,
    text,
  );
  let result = '';
  for (;;) {
    const token = scanner.scan();
    if (token === ts.SyntaxKind.EndOfFileToken) break;
    if (
      token === ts.SyntaxKind.SingleLineCommentTrivia ||
      token === ts.SyntaxKind.MultiLineCommentTrivia
    ) {
      const comment = scanner.getTokenText();
      const newlines = (comment.match(/\n/g) || []).length;
      result += '\n'.repeat(newlines);
      continue;
    }
    result += scanner.getTokenText();
  }
  return result;
}

function stripCssComments(text) {
  let result = '';
  let index = 0;
  while (index < text.length) {
    if (text[index] === '/' && text[index + 1] === '*') {
      const end = text.indexOf('*/', index + 2);
      if (end === -1) {
        break;
      }
      const chunk = text.slice(index, end + 2);
      result += '\n'.repeat((chunk.match(/\n/g) || []).length);
      index = end + 2;
      continue;
    }
    const quote = text[index];
    if (quote === '"' || quote === "'") {
      result += quote;
      index += 1;
      while (index < text.length && text[index] !== quote) {
        if (text[index] === '\\' && index + 1 < text.length) {
          result += text[index] + text[index + 1];
          index += 2;
          continue;
        }
        result += text[index];
        index += 1;
      }
      if (index < text.length) {
        result += text[index];
        index += 1;
      }
      continue;
    }
    result += text[index];
    index += 1;
  }
  return result;
}

function stripFile(filePath) {
  if (!isSourceFile(filePath) || !fs.existsSync(filePath)) {
    return;
  }
  const original = fs.readFileSync(filePath, 'utf8');
  const next = filePath.endsWith('.css')
    ? stripCssComments(original)
    : stripTsComments(original, scriptKind(filePath));
  if (next === original) {
    return;
  }
  fs.writeFileSync(filePath, next);
}

function main() {
  let payload = {};
  try {
    payload = JSON.parse(readStdin() || '{}');
  } catch {
    process.stdout.write('{}\n');
    return;
  }
  const filePath = payload.file_path;
  if (typeof filePath === 'string' && filePath.length > 0) {
    stripFile(path.resolve(filePath));
  }
  process.stdout.write('{}\n');
}

main();
