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
    pattern: string;
}
/**
 * Try to match the exact extname of the file in a specific directory.
 * - matched: `{ path: string; filename: string }`
 * - otherwise: `null`
 */
export declare function findFile(opts: IGetFileOpts): {
    path: string;
    filename: string;
} | null;
export declare function winPath(path: string): string;
/**
 * 标准化 route path
 * @param path 文件路径
 * @param pages 页面目录
 */
export declare function genRoutePath(path: string, pages: string): string;
/**
 * transform route component into webpack chunkName
 */
export declare function routeToChunkName(data: any): any;
/**
 * 防止 mustache tpl 递归时向上查找变量
 */
export declare function assignRoute(route: any, extra?: any): any;
/**
 * updater 使用
 */
export declare function assignContext(context: any): any;
/**
 * 必须设置的 route 属性
 */
export declare function endLookup(): {
    props: null;
    meta: null;
    redirect: null;
    beforeEach: null;
    beforeEnter: null;
    afterEach: null;
};
/**
 * mdf 构建使用缓存
 */
export declare const mdfCache: any;
export declare function collectScrollCache(context: any, name: string): boolean;
export {};
