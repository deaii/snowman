export interface LoadScriptParams {
  src: string;
  integrity?: string;
}

export default async function loadScript(src: string, integrity?: string) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = src;
  if (integrity) {
    script.integrity = integrity;
  }
  script.async = true;
  script.defer = true;
}
