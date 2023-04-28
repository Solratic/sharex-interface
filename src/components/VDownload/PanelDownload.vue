<template>
    <section id="panel-download">
        <div class="search-box">
            <input v-model="inputText" type="text" placeholder="Please input ipfs url or key" @keyup.enter="onURLSubmit"
                :disabled="isLoading">
            <button @click="onURLSubmit" :disabled="isLoading">
                <i-mdi-download></i-mdi-download>
            </button>
        </div>
    </section>
</template>

<script lang="ts">
import { inject, ref } from "vue";
import { getBlob, downloadUint8ArrayFile } from "@src/services/ipfs"
import { useWallet } from "@src/store/index";
import { Sharex__factory } from "@src/types/index";
import { ethers } from "ethers"
import { Notyf } from "notyf";


export default {
    name: "PanelDownload",
    setup() {
        const notyf = inject("notyf") as Notyf;
        const isLoading = ref(false);
        const inputText = ref("");

        const onURLSubmit = async () => {
            if (isLoading.value) {
                return;
            }
            try {
                isLoading.value = true;
                const value = inputText.value;
                if (!value) {
                    return;
                }
                let url = "";
                if (!value.startsWith("http")) {
                    const walletStore = useWallet();
                    if (!walletStore.address) {
                        throw new Error("Please connect your wallet first");
                    }
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner(walletStore.address);
                    const sharex = Sharex__factory.connect("0x3FD611658eE18cC8aa91De4CD5E86FE2a9484309", signer);
                    const hash = await sharex.getFile(value)
                        .then((v) => {
                            return v
                        })
                        .catch((e) => {
                            throw e;
                        })
                    if (!hash) {
                        throw new Error("File not found or expired")
                    }
                    url = hash;
                } else {
                    const hash = value.split("/").pop() as string;
                    if (!hash) {
                        throw new Error("Invalid ipfs url")
                    }
                    url = hash;
                }
                await getBlob(url).then((byteArray) => {
                    downloadUint8ArrayFile(byteArray)
                })
            } catch (e) {
                const error = e as Error;
                notyf.error(error.message)
            } finally {
                isLoading.value = false;
                inputText.value = "";
            }
        }

        return {
            inputText,
            isLoading,
            onURLSubmit,
        }
    },
}
</script>
  
<style lang="scss" >
section#panel-download {
    background-color: var(--gradient-100);
    border-radius: 1rem;

    .panel-download--content {
        width: 100%;
        height: 100%;
    }
}

body.dark-theme {
    section#panel-download {
        background-color: var(--gradient-800);
    }
}

.secred-mode {
    section#panel-download {
        background-color: var(--gradient-900);
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

    ::placeholder {
        text-align: center;
    }

    &:hover {
        background-color: #E8E8E8;
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