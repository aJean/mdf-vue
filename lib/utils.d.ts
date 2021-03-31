/**
 * @file utils
 */
export declare const RE_DYNAMIC_ROUTE: RegExp;
/**
 * javascript: try to match the file with extname `.{ts(x)|js(x)}`
 * css: try to match the file with extname `.{less|sass|scss|stylus|css}`
 */
declare type FileType = 'javascript' | 'css';
interface IGetFileOpts {
    base: string;
    type: FileType;
    fileNameWithoutExt: string;
}
/**
 * Try to match the exact extname of the file in a specific directory.
 * - matched: `{ path: string; filename: string }`
 * - otherwise: `null`
 */
export declare function getFile(opts: IGetFileOpts): {
    path: string;
    filename: string;
} | null;
export declare function winPath(path: string): string;
/**
 * 标准化 route path
 */
export declare function normalizePath(path: string): string;
/**
 * transform route component into webpack chunkName
 */
export declare function routeToChunkName(data: any): any;
export {};
