import { defineStore } from "pinia";
import * as IPFS from 'ipfs-core'
import { computed, ref } from "vue";
import type { FileDetail } from '@src/services/types';

export const useIPFSStore = defineStore("ipfs", () => {
    const node = ref<IPFS.IPFS | null>(null)
    const connect = async () => {
        if (node.value === null) {
            node.value = await IPFS.create({
                libp2p: {
                    addresses: {
                        listen: [
                            '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                            '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
                        ]
                    }
                }
            })
        }
    }
    const storeBlob = async (blob: Blob) => {
        await connect()
        try {
            const result = await node.value!.add(blob);
            const hash = result.cid.toString();
            return hash;
        } catch (e) {
            console.error(e);
            throw new Error(`Error while uploading to IPFS Network`);
        }
    }
    const getBlob = async (hash: string): Promise<Uint8Array> => {
        await connect()
        try {
            const stream = node.value!.cat(hash);
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
    const getMeta = async (hash: string): Promise<Partial<FileDetail> | undefined> => {
        await connect()
        try {
            const results = node.value!.ls(hash);
            for await (const file of results) {
                return {
                    cid: file.cid.toString(),
                    file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                    },
                }
            }
        } catch (e) {
            console.error(e);
            throw new Error(`Error while downloading from IPFS Network`);
        }
    }

    return {
        node,
        connect,
        storeBlob,
        getBlob,
        getMeta,
    }
})