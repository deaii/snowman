import { PassageTags } from '../Passage';

export default function parseTags(tagsStr: string | null): PassageTags {
  if (!tagsStr) {
    return {};
  }

  const rVal: { [key: string]: string | true; } = {};

  tagsStr.split(' ').forEach((str: string) => {
    const eqIndex = str.indexOf('=');

    if (eqIndex > 0) {
      rVal[str.substr(0, eqIndex)] = str.substr(eqIndex + 1);
    } else {
      rVal[str] = true;
    }
  });

  return rVal;
}
