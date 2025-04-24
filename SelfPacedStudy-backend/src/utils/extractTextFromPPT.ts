import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';

/**
 * 从 PPT 文件 Buffer 中提取文本内容
 * @param pptBuffer PPT 文件的 Buffer 数据
 * @returns {Promise<string>} 提取的文本内容
 */
export async function extractTextFromPPT(pptBuffer: Buffer): Promise<string> {
    const zip = await JSZip.loadAsync(pptBuffer);

    const slideTexts: string[] = [];

    const slideFiles = Object.keys(zip.files).filter(name =>
        name.match(/^ppt\/slides\/slide\d+\.xml$/)
    );

    for (const filename of slideFiles) {
        const fileData = await zip.files[filename].async('string');
        const parsedXml = await parseStringPromise(fileData);

        // 提取 <a:t> 标签中的文本内容
        const texts = extractTextFromXml(parsedXml);
        slideTexts.push(texts.join(' '));
    }

    return slideTexts.join(' ');
}

/**
 * 从解析后的 XML 对象中提取所有文本
 */
function extractTextFromXml(xmlObj: any): string[] {
    const results: string[] = [];

    function recursiveSearch(obj: any) {
        if (typeof obj === 'object') {
            for (const key in obj) {
                if (key === 'a:t' && Array.isArray(obj[key])) {
                    results.push(...obj[key]);
                } else {
                    recursiveSearch(obj[key]);
                }
            }
        }
    }

    recursiveSearch(xmlObj);
    return results;
}
