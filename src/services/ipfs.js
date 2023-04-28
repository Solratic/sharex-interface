import * as IPFS from 'ipfs-core'

const node = await IPFS.create();

/**
 * Uploads a blob of data to IPFS network using the 'node.add' method.
 * 
 * @param {Blob} blob - The blob of data to be uploaded to IPFS network.
 * @returns {Promise<string>} - The hash of the uploaded blob of data.
 * @throws {Error} - If there is any error while uploading the data to IPFS network.
 */

export const storeBlob = async (blob) => {
  try {
    const result = node.add(blob)
    const hash = (await result).cid.toString()
    return hash
  } catch (e) {
    console.error(e)
    throw new Error(`Error while upload into IPFS Network`)
  }
}

/**
 * Retrieves a blob of data from IPFS network using the hash provided as input.
 * The hash is used to retrieve the data stream using the 'node.cat' method.
 * 
 * @param {string} hash - The hash of the data to be retrieved from IPFS network.
 * @returns {Promise<string>} - The blob of data retrieved from IPFS network.
 * @throws {Error} - If there is any error while downloading the data from IPFS network.
 */
export const getBlob = async (hash) => {
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
 * Upload Blob to NFT Storage
 * 
 * @typedef {Object} SafeAsync
 * @property {Boolean|Error} error
 * @property {FileDetail} data
 * 
 * @param {File} file
 * @returns {Promise<SafeAsync>}
 */
export const uploadBlob = async (file) => {
  let detail = getCidDetail({ cid: null, file });

  try {
    const cid = await storeBlob(file);
    detail = getCidDetail({ cid, file });
    return { error: false, data: detail };
  } catch (error) {
    return { error, data: detail };
  }
}

/**
 * Get CID Detail with File
 * 
 * @typedef {Object} FileDetail
 * @property {String} cid
 * @property {Object} file
 * @property {String} file.name
 * @property {String} file.type
 * @property {Number} file.size
 * @property {Number} file.created_at
 * @property {String | undefined} secret
 * 
 * @param {Object} params
 * @param {String} params.cid
 * @param {File} params.file
 * @returns {FileDetail}
 */
export const getCidDetail = ({ cid, file, secret }) => {
  const base = {
    name: file.name,
    type: file.type,
    size: file.size,
    created_at: Date.now(),
    secret: secret,
  }

  if (!cid) return { cid: null, file: base, secret: undefined };

  return {
    cid,
    file: base
  };
}