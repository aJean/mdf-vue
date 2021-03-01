/**
 * @file getRoutes
 */
interface IOpts {
    root: string;
    relDir?: string;
}
export interface IRoute {
    name: string;
    component?: Function;
    path?: string;
    children?: IRoute[] | null;
    wrappers?: string[];
    /**是否是动态路由 */
    __isDynamic?: boolean;
    componentPath?: string;
    [key: string]: any;
}
export default function getRoutes(opts: IOpts): IRoute[];
export {};
