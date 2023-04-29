import { FileDetail } from "./types";
import JSZip from "jszip";
import { ethers } from "ethers";
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
export const generateLink = (item: FileDetail, address?: string): string => {
  const base = `${window.location.origin}${process.env.NODE_ENV === "production" ? "/sharex" : ""}`
  if (item.secret && address) {
    const hash = ethers.utils.solidityKeccak256(["string", "string", "address"], [item.cid, item.secret, address]);
    return `${base}/download?value=${hash}&filename=${item.file.name}&secret=${!!item.secret}`;
  }
  return `${base}/download?value=${item.cid}&filename=${item.file.name}&secret=${!!item.secret}`;
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

type Folder = {
  name: string;
  files: File[];
  folders: Folder[];
};

async function convertFileListToFolder(fileList: FileList): Promise<Folder> {
  if (!fileList.length) {
    throw new Error("File list is empty");
  }

  const firstFilePath = fileList[0].webkitRelativePath.split("/");
  const rootFolderName = firstFilePath[0];

  const rootFolder: Folder = { name: rootFolderName, files: [], folders: [] };

  for (const file of Array.from(fileList)) {
    const path = file.webkitRelativePath.split("/");
    let currentFolder = rootFolder;

    // Traverse the folder tree and add missing folders
    for (let j = 0; j < path.length - 1; j++) {
      const folderName = path[j];
      let folder = currentFolder.folders.find((f) => f.name === folderName);

      if (!folder) {
        folder = { name: folderName, folders: [], files: [] };
        currentFolder.folders.push(folder);
      }

      currentFolder = folder;
    }

    // Add file to current folder
    currentFolder.files.push(file);
  }

  return rootFolder;
}
async function addFolderToZip(zip: JSZip, basePath: string, folder: Folder): Promise<void> {
  const folderPath = `${basePath}${folder.name}/`;

  // Add files to ZIP archive
  for (const file of folder.files || []) {
    const filePath = `${folderPath}${file.name}`;
    zip.file(filePath, file);
  }

  // Add subfolders to ZIP archive
  for (const subfolder of folder.folders || []) {
    await addFolderToZip(zip, folderPath, subfolder);
  }
}

export const zipUploadedFolder = async (files: FileList): Promise<File> => {
  const folder = await convertFileListToFolder(files);
  const zip = new JSZip();
  await addFolderToZip(zip, "", folder);
  const blob = await zip.generateAsync({ type: "blob" });

  // Convert the Blob to a File
  const fileName = `${folder.name}-${generateRandomString(32)}.zip`;
  const file = new File([blob], fileName, { type: "application/zip" });

  return file;
};
