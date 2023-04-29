<template>
    <section id="panel-download">
        <div class="search-box">
            <input v-model="inputText" type="text" placeholder="Please input ipfs url or key" @keyup.enter="onURLSubmit"
                :disabled="isLoading">
            <button @click="onURLSubmit" :disabled="isLoading">
                <i-mdi-download></i-mdi-download>
            </button>
        </div>
        <div v-if="isLoading" class="spinner"></div>
        <FileBlock v-if="!isLoading && fileName" :fname="fileName" :fsize="fileSize" @click="onDownloadFile" />
    </section>
</template>

<script lang="ts">
import { inject, ref, onMounted } from "vue";
import { getBlob, getMetadata, downloadUint8ArrayFile } from "@src/services/ipfs"
import { useWallet } from "@src/store";
import { Sharex__factory } from "@src/types/index";
import { ethers } from "ethers"
import { Notyf } from "notyf";
import FileBlock from "@src/components/FileBlock.vue"


export default {
    name: "PanelDownload",
    setup() {
        const notyf = inject("notyf") as Notyf;
        const isLoading = ref(false);
        const inputText = ref(window.location.toString());
        const fileName = ref("");
        const fileHash = ref("");
        const fileSize = ref(0);

        onMounted(() => {
            if (inputText.value) {
                onURLSubmit();
            }
        })


        const onURLSubmit = async () => {
            if (isLoading.value) {
                return;
            }
            const inputValue = inputText.value;
            try {
                isLoading.value = true;
                const url = new URL(inputValue)
                const filename = url.searchParams.get("filename")
                let value = url.searchParams.get("value")
                const secret = url.searchParams.get("secret")
                if (!filename || !value) {
                    isLoading.value = false;
                    return;
                }

                if (secret === "true") {
                    const walletStore = useWallet();
                    if (!walletStore.address) {
                        throw new Error("Please connect your wallet first");
                    }
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner(walletStore.address);
                    const sharex = Sharex__factory.connect("0x3FD611658eE18cC8aa91De4CD5E86FE2a9484309", signer);
                    const _hash = await sharex.getFile(value)
                        .then((v) => {
                            return v
                        })
                        .catch((e) => {
                            throw e;
                        })
                    if (!_hash) {
                        throw new Error("File not found or expired")
                    }
                    value = _hash;
                }
                await getMetadata(value).then((metadata) => {
                    if (!metadata.cid) {
                        throw new Error("File not found or expired")
                    }
                    fileName.value = filename;
                    fileHash.value = metadata.cid!.toString();
                    fileSize.value = metadata.file.size;
                })
            } catch (e) {
                const error = e as Error;
                notyf.error(error.message)
            } finally {
                isLoading.value = false;
            }
        }

        const onDownloadFile = async () => {
            if (!fileHash.value || !fileName.value) {
                return;
            }
            await getBlob(fileHash.value).then((byteArray) => {
                downloadUint8ArrayFile(byteArray, fileName.value)
            })
        }

        return {
            inputText,
            isLoading,
            fileName,
            fileSize,
            onURLSubmit,
            onDownloadFile,
        }
    },
}
</script>
  
<style lang="scss" >
#panel-download {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.spinner {
    display: inline-block;
    display: inline-block;
    width: 3em;
    height: 3em;
    border: 0.25em solid rgba(0, 0, 0, 0.1);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spinner-rotate 0.6s linear infinite;
    margin-right: 0.5em;
    margin-top: 5em;
}

@keyframes spinner-rotate {
    to {
        transform: rotate(360deg);
    }
}


.search-box {
    display: flex;
    align-items: center;
    border-radius: 1em;
    padding: 0.5rem;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
    transition: background-color 0.35s;
    min-width: 30rem;
    background-color: var(--gradient-800);

    ::placeholder {
        text-align: center;
    }

    &:hover {
        background-color: var(--gradient-500);
        border-radius: 1em;
    }

    input {
        flex: 1;
        border: none;
        font-size: 1rem;
        background-color: transparent;
        outline: none;
    }

    button {
        border: none;
        background-color: transparent;
        cursor: pointer;
        padding: 0.5rem;

        svg {
            width: 1.5rem;
            height: 1.5rem;
        }
    }
}
</style>