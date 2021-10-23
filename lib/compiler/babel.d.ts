/**
 * @file babel vue
 */
export default function getBabelOpts({ isDev, isTest }: {
    isDev?: boolean | undefined;
    isTest?: boolean | undefined;
}): {
    cacheDirectory: boolean;
    presets: ((string | {
        targets: {
            node: string;
        };
    })[] | (string | {
        useBuiltIns: string;
        corejs: number;
        modules: boolean;
    })[])[];
    plugins: (string | (string | {
        version: any;
        absoluteRuntime: string;
        useESModules: boolean;
    })[] | (string | {
        legacy: boolean;
    })[] | (string | {
        loose: boolean;
    })[])[];
};
