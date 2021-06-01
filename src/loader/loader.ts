import { getUpdater } from './updater';

/**
 * @file vue loader 自定义块处理 router block
 */

export default function (source: string, map: any) {
  const updater = getUpdater();

  // 遗留问题：把已经存在的 router block 删除不会触发 updater
  if (updater && map) {
    const filename = map.sources[0];
    updater && updater({ filename, source });
  }

  return '';
}
