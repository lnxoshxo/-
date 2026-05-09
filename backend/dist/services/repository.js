import { cases, faqs } from '../seed/content';
import { documents } from '../seed/documents';
const qaLogs = [
    {
        id: 'log-1',
        question: '上实服务有哪些智慧物业能力？',
        createdAt: '2026-05-06T10:00:00.000Z',
        status: 'answered',
    },
];
export function listDocuments() {
    return documents;
}
export function listFaqs() {
    return faqs;
}
export function listCases() {
    return cases;
}
export function listQaLogs() {
    return qaLogs;
}
export function addQaLog(question, status) {
    qaLogs.unshift({
        id: `log-${qaLogs.length + 1}`,
        question,
        createdAt: new Date().toISOString(),
        status,
    });
}
