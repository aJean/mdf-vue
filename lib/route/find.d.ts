/**
 * @file 查找并生成路由列表
 */
interface IOpts {
    root: string;
    pageDir: string;
    parentDir?: string;
}
export interface IRoute {
    name: string;
    component?: Function;
    path?: string;
    children?: IRoute[] | null;
    wrappers?: string[];
    __isDynamic?: boolean;
    componentPath?: string;
    [key: string]: any;
}
export default function findRoutes(opts: IOpts): IRoute[];
export {};
