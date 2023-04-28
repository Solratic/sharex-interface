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
 * Retrieves a blob of data from IPFS network using the hash provided as input.
 * The hash is used to retrieve the data stream using the 'node.cat' method.
 * 
 * @param {string} hash - The hash of the data to be retrieved from IPFS network.
 * @returns {Promise<string>} - The blob of data retrieved from IPFS network.
 * @throws {Error} - If there is any error while downloading the data from IPFS network.
 */
export const getBlob = async (hash: string): Promise<string> => {
  try {
    const stream = node.cat(hash);
    const decoder = new TextDecoder()
    let data = ''
    for await (const chunk of stream) {
      // chunks of data are returned as a Uint8Array, convert it back to a string
      data += decoder.decode(chunk, { stream: true })
    }
    return data
  } catch (e) {
    console.error(e)
    throw new Error(`Error while download from IPFS Network`)
  }
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
