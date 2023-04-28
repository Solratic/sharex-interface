import * as IPFS from 'ipfs-core'
import type { FileDetail, SafeAsync } from './types';



const node = await IPFS.create();

/**
 * Uploads a blob of data to IPFS network using the 'node.add' method.
 * 
 * @param {Blob} blob - The blob of data to be uploaded to IPFS network.
 * @returns {Promise<string>} - The hash of the uploaded blob of data.
 * @throws {Error} - If there is any error while uploading the data to IPFS network.
 */
export const storeBlob = async (blob: Blob): Promise<string> => {
  try {
    const result = await node.add(blob);
    const hash = result.cid.toString();
    return hash;
  } catch (e) {
    console.error(e);
    throw new Error(`Error while uploading to IPFS Network`);
  }
};

/**
 * Retrieves a Uint8Array of data from IPFS network using the hash provided as input.
 * The hash is used to retrieve the data stream using the 'node.cat' method.
 * 
 * @param {string} hash - The hash of the data to be retrieved from IPFS network.
 * @returns {Promise<Uint8Array>} - The Uint8Array of data retrieved from IPFS network.
 * @throws {Error} - If there is any error while downloading the data from IPFS network.
 */
export const getBlob = async (hash: string): Promise<Uint8Array> => {
  try {
    const stream = node.cat(hash);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  } catch (e) {
    console.error(e);
    throw new Error(`Error while downloading from IPFS Network`);
  }
};

export const downloadUint8ArrayFile = async (data: Uint8Array, fileName: string, mimeType: string = "application/octet-stream") => {
  // Convert the data to a Blob
  const blob = new Blob([data], { type: mimeType });

  // Create an anchor element to download the file
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = fileName;

  // Append the anchor to the DOM, click it, and remove it
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Revoke the object URL to free memory
  setTimeout(() => {
    URL.revokeObjectURL(anchor.href);
  }, 100);
}





/**
 * Upload Blob to Storage
 * @param file - The file to upload.
 * @returns A Promise that resolves to a SafeAsync object that indicates if the upload was successful or if there was an error.
 */
export const uploadBlob = async (file: File): Promise<SafeAsync> => {
  let detail = getCidDetail({ cid: null, file });

  try {
    const cid = await storeBlob(file);
    detail = getCidDetail({ cid, file });
    return { error: false, data: detail };
  } catch (error) {
    return { error: error as Error, data: detail };
  }
};

/**
 * Get CID Detail with File
 * @param params - An object that contains the cid, file, and secret properties.
 * @param params.cid - The cid of the file.
 * @param params.file - The file object.
 * @param params.secret - The secret value.
 * @returns A FileDetail object.
 */
export const getCidDetail = ({
  cid,
  file,
  secret,
}: {
  cid: string | null;
  file: File;
  secret?: string;
}): FileDetail => {
  const base = {
    name: file.name,
    type: file.type,
    size: file.size,
    created_at: Date.now(),
    secret,
  };

  if (!cid) return { cid: null, file: base, secret: undefined };

  return {
    cid,
    file: base,
  };
};
