import { IApi } from '@mdfjs/types';
/**
 * @file vue 插件集
 */
export default function (api: IApi): {
    presets: string[];
};
/**
 * es-lint config for vue
 */
export declare function lint(opts: any): any;
