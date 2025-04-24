// src/types/pptx2json.d.ts
declare module 'pptx2json' {
    export function parse(pptFilePath: string, callback: (error: any, result: any) => void): void;
}
