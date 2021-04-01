/**
 * @file 获取路由列表
 */
interface IOpts {
    root: string;
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
export default function getRoutes(opts: IOpts): IRoute[];
export {};
