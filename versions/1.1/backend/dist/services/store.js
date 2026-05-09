import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const currentDir = dirname(fileURLToPath(import.meta.url));
const storePath = resolve(currentDir, '../data/store.json');
function readStore() {
    if (!existsSync(storePath)) {
        throw new Error('本地数据文件不存在');
    }
    return JSON.parse(readFileSync(storePath, 'utf-8'));
}
function writeStore(data) {
    writeFileSync(storePath, JSON.stringify(data, null, 2));
}
export function getHomeContent() {
    return readStore().homeContent;
}
export function updateHomeContent(homeContent) {
    const store = readStore();
    store.homeContent = homeContent;
    writeStore(store);
    return store.homeContent;
}
export function getDocuments() {
    return readStore().documents;
}
export function addDocument(input) {
    const store = readStore();
    const item = {
        id: `doc-${store.documents.length + 1}`,
        updatedAt: new Date().toISOString(),
        ...input,
    };
    store.documents.unshift(item);
    writeStore(store);
    return item;
}
export function updateDocumentStatus(id, status) {
    const store = readStore();
    const index = store.documents.findIndex((item) => item.id === id);
    if (index === -1) {
        return null;
    }
    store.documents[index] = {
        ...store.documents[index],
        status,
        updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return store.documents[index];
}
export function updateDocumentContent(id, patch) {
    const store = readStore();
    const index = store.documents.findIndex((item) => item.id === id);
    if (index === -1) {
        return null;
    }
    store.documents[index] = {
        ...store.documents[index],
        ...patch,
        updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return store.documents[index];
}
export function removeDocument(id) {
    const store = readStore();
    const next = store.documents.filter((item) => item.id !== id);
    if (next.length === store.documents.length) {
        return false;
    }
    store.documents = next;
    writeStore(store);
    return true;
}
export function getFaqs() {
    return readStore().faqs;
}
export function addFaq(input) {
    const store = readStore();
    const item = {
        id: `faq-${store.faqs.length + 1}`,
        updatedAt: new Date().toISOString(),
        ...input,
    };
    store.faqs.unshift(item);
    writeStore(store);
    return item;
}
export function updateFaq(id, input) {
    const store = readStore();
    const index = store.faqs.findIndex((item) => item.id === id);
    if (index === -1) {
        return null;
    }
    store.faqs[index] = {
        ...store.faqs[index],
        ...input,
        updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return store.faqs[index];
}
export function removeFaq(id) {
    const store = readStore();
    const next = store.faqs.filter((item) => item.id !== id);
    if (next.length === store.faqs.length) {
        return false;
    }
    store.faqs = next;
    writeStore(store);
    return true;
}
export function getCases() {
    return readStore().cases;
}
export function addCase(input) {
    const store = readStore();
    const item = {
        id: `case-${store.cases.length + 1}`,
        updatedAt: new Date().toISOString(),
        ...input,
    };
    store.cases.unshift(item);
    writeStore(store);
    return item;
}
export function updateCase(id, input) {
    const store = readStore();
    const index = store.cases.findIndex((item) => item.id === id);
    if (index === -1) {
        return null;
    }
    store.cases[index] = {
        ...store.cases[index],
        ...input,
        updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return store.cases[index];
}
export function removeCase(id) {
    const store = readStore();
    const next = store.cases.filter((item) => item.id !== id);
    if (next.length === store.cases.length) {
        return false;
    }
    store.cases = next;
    writeStore(store);
    return true;
}
export function getQaLogs() {
    return readStore().qaLogs;
}
export function addQaLogRecord(question, status) {
    const store = readStore();
    const item = {
        id: `log-${store.qaLogs.length + 1}`,
        question,
        createdAt: new Date().toISOString(),
        status,
    };
    store.qaLogs.unshift(item);
    writeStore(store);
    return item;
}
export function updateQaLogRecord(id, patch) {
    const store = readStore();
    const index = store.qaLogs.findIndex((item) => item.id === id);
    if (index === -1) {
        return null;
    }
    store.qaLogs[index] = {
        ...store.qaLogs[index],
        ...patch,
    };
    writeStore(store);
    return store.qaLogs[index];
}
