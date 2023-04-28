import { FileDetail } from "./types";

/**
 * File size human readble
 * @param bytes - The size of the file in bytes.
 * @param si - If true, use SI (decimal) units. Otherwise, use binary units (default).
 * @param dp - The number of decimal places to round to (default 1).
 * @returns A string representing the size of the file in human-readable form.
 */
export const fileSize = (bytes: number, si = false, dp = 1): string => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
};


/**
 * Copy text to clipboard
 */
export const copyToClipboard = (value: string) => {
  return navigator.clipboard.writeText(value)
};

/**
 * Check is file type is video
 * @param {String} type
 * @returns {Boolean}
 **/
export const isVideo = (type: string): boolean => {
  return type.indexOf("video") >= 0;
}


/**
 * Generate IPFS Gateway link
 * @param item - The file object to generate the link for.
 * @returns A string representing the IPFS gateway link for the specified file object.
 */
export const generateLink = (item: FileDetail): string => {
  return `https://cloudflare-ipfs.com/ipfs/${item.cid}`;
};


/**
 * Check is website running on PWA mode.
 * @returns {Boolean}
 */
export const isRunningOnPWA = (): boolean => {
  return window.matchMedia("(display-mode: standalone)").matches;
};


export const generateRandomString = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}