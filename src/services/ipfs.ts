import * as IPFS from 'ipfs-core'
import type { FileDetail, SafeAsync } from './types';
import type { Message } from "@libp2p/interface-pubsub"
let node: IPFS.IPFS | null = null;

const connectIPFS = async () => {
  node = await IPFS.create({
    config: {
      Addresses: {
        Swarm: [
          '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
          '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        ],
      },
    },
  });
  await node.pubsub.subscribe("announce-circuit", processAnnounce);
  setInterval(function () {
    if (node === null) return;
    const msg = new TextEncoder().encode("peer-alive");
    node.pubsub.publish("announce-circuit", msg);
    console.log(msg)
  }, 15000);
}

async function processAnnounce(raw_msg: Message): Promise<void> {
  const msg = new TextDecoder().decode(raw_msg.data)

  // get our peerid
  let me = (await node!.id()).id;

  // if we got a keep-alive, nothing to do
  if (msg == "keep-alive") {
    console.log(msg);
    return;
  }

  const peer = msg.split("/")[9];
  console.log("Peer: " + peer);
  console.log("Me: " + me);
  if (peer === me.toString()) { // return if the peer being announced is us
    return;
  }

  // get a list of peers
  const peers = await node!.swarm.peers();
  for (let i in peers) {
    // if we're already connected to the peer, don't bother doing a
    // circuit connection
    if (peers[i].peer.toString() == peer) {
      return;
    }
  }
  // log the address to console as we're about to attempt a connection
  console.log("EVENT ADDRESS", msg);

  // connection almost always fails the first time, but almost always
  // succeeds the second time, so we do this:
  try {
    //@ts-ignore
    await node!.swarm.connect(msg);
  } catch (err) {
    console.log(err);
    //@ts-ignore
    await node!.swarm.connect(msg);
  }
}



/**
 * Uploads a blob of data to IPFS network using the 'node.add' method.
 * 
 * @param {Blob} blob - The blob of data to be uploaded to IPFS network.
 * @returns {Promise<string>} - The hash of the uploaded blob of data.
 * @throws {Error} - If there is any error while uploading the data to IPFS network.
 */
export const storeBlob = async (blob: Blob): Promise<string> => {
  if (!node) {
    await connectIPFS();
  }
  try {
    const result = await node!.add(blob);
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
  if (!node) {
    await connectIPFS();
  }
  try {
    const stream = node!.cat(hash);
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

export const downloadUint8ArrayFile = async (data: Uint8Array, filename?: string, mimeType: string = "application/octet-stream") => {
  // Convert the data to a Blob
  const blob = new Blob([data], { type: mimeType });

  // Create an anchor element to download the file
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  if (filename) anchor.download = filename;

  // Append the anchor to the DOM, click it, and remove it
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Revoke the object URL to free memory
  setTimeout(() => {
    URL.revokeObjectURL(anchor.href);
  }, 100);
}

export const getMetadata = async (hash: string): Promise<FileDetail> => {
  if (!node) {
    await connectIPFS();
  }
  try {
    const result = node!.ls(hash);
    let payload: any = null;
    for await (const file of result) {
      payload = {
        cid: file.cid.toString(),
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
        },
        id: "",
      };
      break
    }
    return payload;
  } catch (e) {
    console.error(e);
    throw new Error(`Error while downloading from IPFS Network`);
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

  if (!cid) return { id: "", cid: null, file: base, secret: undefined };

  return {
    id: "",
    cid,
    file: base,
  };
};
