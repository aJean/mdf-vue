import { getUpdater } from './updater';

/**
 * @file vue loader 自定义块处理 router block
 */

export default function (source: string, map: any) {
  const updater = getUpdater();
  
  if (updater && map) {
    const filename = map.sources[0];
    updater && updater({ filename, source });
  }

  return '';
}
