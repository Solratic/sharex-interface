<template>
  <section id="panel-upload">
    <div class="content panel-upload--content">
      <button class="switch-button" @click="folderOnly = !folderOnly">
        <i-mdi-folder v-if="folderOnly" />
        <i-mdi-file v-else />
      </button>
      <div class="panel-upload--dropzone" :class="{ active: isDragged }" @dragenter="onDragEnter" @dragleave="onDragLeave"
        @drop.prevent="onDropHandler" @dragover.prevent>
        <input type="file" multiple :webkitdirectory="folderOnly" ref="fileRef" @change="onFileChangedHandler" />

        <div class="dropzone-label" @click="openSelectFile">
          <i-mdi-timer-sand v-if="(fileCount > 0)" class="icon-color" />
          <i-mdi-upload v-else class="icon-color" />

          <span v-if="folderOnly">Click to select a folder.</span>
          <span v-else>Drop files here or click to select files.</span>
          <div class="dropzone-is-loading" :class="{ active: (fileCount > 0 || isUploading) }">
            <div class="dropzone-loading--bar"></div>
          </div>
          <span v-show="fileCount === 0 && isUploading"> Preparing </span>
          <span v-show="(fileCount > 0 && isUploading)">{{ (fileCount - finished) }} of {{ fileCount }} files being
            transfered.</span>
        </div>

        <div class="dropzone-details">
          <div class="dropzone-detail">{{ result.count }} files</div>
          <div class="dropzone-detail">{{ fileSize(result.size) }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, inject, ref } from "vue";

import { useStore, useWallet } from "@src/store";
import { uploadBlob } from "@src/services/ipfs"
import { fileSize, generateRandomString, zipUploadedFolder } from "@src/services/helpers";
import { useMetaMaskWallet } from "vue-connect-wallet";
import { Sharex__factory } from "@src/types/index";
import { ethers } from "ethers"
import { PromiseOrValue } from "@src/types/common";
import { Notyf } from "notyf";
import { v4 as uuidv4 } from 'uuid';
import { Emitter, EventType } from "mitt";


export default {
  name: "PanelUpload",
  setup() {
    const notyf = inject("notyf") as Notyf;
    const emitter = inject("emitter") as Emitter<Record<EventType, unknown>>;
    const fileRef = ref<HTMLInputElement | null>(null);
    const isDragged = ref(false);
    const finished = ref(0);
    const isUploading = ref(false);

    const folderOnly = ref(false);
    const wallet = useMetaMaskWallet();
    const store = useStore();
    const walletStore = useWallet();

    const processDirectory = async (item: FileSystemDirectoryEntry, files: File[]) => {
      const entries = await new Promise<FileSystemEntry[]>((resolve) => item.createReader().readEntries(resolve));

      for (const entry of entries) {
        if (entry.isFile) {
          const fileEntry = entry as FileSystemFileEntry;
          const file = await new Promise<File>((resolve) => fileEntry.file(resolve));
          files.push(file);
        } else if (entry.isDirectory) {
          const directoryEntry = entry as FileSystemDirectoryEntry;
          await processDirectory(directoryEntry, files);
        }
      }
    };

    const onDropHandler = async ($event: DragEvent) => {
      if (isUploading.value) return false;

      isDragged.value = false;

      const files: File[] = [];
      const items = $event.dataTransfer!.items;

      for (const item of items) {
        if (item.kind === 'file' && item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry?.isFile) {
            files.push(item.getAsFile()!);
          } else if (entry?.isDirectory) {
            const directoryEntry = entry as FileSystemDirectoryEntry;
            await processDirectory(directoryEntry, files);
          }
        } else if (item.kind === 'file') {
          files.push(item.getAsFile()!);
        }
      }

      if (fileRef.value) {
        Object.defineProperty(fileRef.value, 'files', {
          get: () => files,
          configurable: true,
        });
      }

      onFileChangedHandler();
    };

    const openSelectFile = () => {
      if (isUploading.value) return false;
      if (fileRef.value) {
        fileRef.value.click();
      }
    }
    const onDragEnter = () => {
      isDragged.value = true;
    }
    const onDragLeave = () => {
      isDragged.value = false;
    }

    const uploadToContract = async (hash: PromiseOrValue<string>, secret: PromiseOrValue<string>) => {
      if (!wallet.isMetaMask) {
        return
      }
      if (!walletStore.address) {
        await wallet.connect();
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const expiration = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
      const sharex = Sharex__factory.connect(walletStore.address, signer).attach("0x3FD611658eE18cC8aa91De4CD5E86FE2a9484309")

      return sharex.uploadFile(hash, secret, expiration).then(async (tx) => {
        emitter.emit("send_txn");
        await tx.wait();
      })
    }

    const uploadFileHandler = async (file: File) => {
      const result = await uploadBlob(file);
      if (walletStore.address) {
        try {
          let secret = generateRandomString(32);
          result.data.secret = secret;
          await uploadToContract(result.data.cid!, secret)
            .then((reciept) => {
              result.data.secret = secret;
            })
            .catch(err => {
              throw err
            });
        } catch (err) {
          console.error(err)
          result.error = err as Error;
        } finally {
          emitter.emit("end_txn")
        }
      }
      const { error } = result;
      if (error && error instanceof Error) {
        notyf.error(error.message)
      } else {
        finished.value++;
      }
      result.data.id = uuidv4();
      return result;
    }

    const onFileChangedHandler = async () => {
      isUploading.value = true;

      if (fileRef.value?.files) {
        if (folderOnly.value) {
          const singleZip = await zipUploadedFolder(fileRef.value?.files);
          store.addFiles(singleZip);
        } else {
          store.addFiles(...fileRef.value.files);
        }
      }

      const files = store.files.map((file: any) => uploadFileHandler(file));

      try {
        let results = await Promise.all(files);

        const successfully = results.filter(({ error }) => !error);

        store.addResults(...successfully.map(({ error, data: file }) => file));
        store.resetFiles();

        fileRef.value = null

        if (successfully.length > 0) {
          notyf.success(`${successfully.length} files successfully processed.`);
        }
      } catch (error) {
        console.error(error)
        notyf.error(`Opss!, something error while processing your files.`);
      } finally {
        finished.value = 0;
        isUploading.value = false;
      }
    }

    const fileCount = computed(() => {
      return store.files.length;
    });

    const result = computed(() => {
      return {
        count: store.results.length,
        size: store.results.reduce((sum, result) => {
          return sum + result.file.size;
        }, 0),
      };
    });

    return {
      folderOnly,
      isUploading,
      finished,
      fileRef,
      fileCount,
      result,
      isDragged,
      fileSize,
      onDragEnter,
      onDragLeave,
      onDropHandler,
      openSelectFile,
      onFileChangedHandler,
    }
  },
}
</script>

<style lang="scss">
section#panel-upload {
  background-color: var(--gradient-100);
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;

  .panel-upload--content,
  .panel-upload--content .panel-upload--dropzone {
    width: 100%;
    height: 100%;
  }

  .switch-button {
    all: unset;
    cursor: pointer;
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 100;
    font-size: x-large;
    border-radius: 50%;
    color: var(--gradient-500);
    animation: pulse 2s infinite ease-in-out;
  }

  .panel-upload--dropzone {
    position: relative;
    cursor: pointer;
    overflow: hidden;

    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;

    &.active {
      >* {
        pointer-events: none;
      }

      .dropzone-label {
        background-color: rgba(0, 0, 0, .2);
      }
    }

    input {
      display: none;
    }

    .dropzone-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: .8rem;
      border-radius: .5rem;
      text-align: center;
      width: 80%;

      svg {
        height: 48px;
        width: 48px;
        margin-bottom: 1rem;
      }

      span {
        font-size: 0.8rem;
      }
    }

    .dropzone-details {
      position: absolute;
      display: flex;

      bottom: 1rem;
      left: 1rem;

      .dropzone-detail {
        background-color: var(--gradient-300);
        border-radius: 1rem;
        padding: .4rem .8rem;
        font-size: .8rem;
        margin-right: .6rem;
      }
    }

    .dropzone-is-loading {
      opacity: 0;

      position: relative;
      height: 4px;
      display: block;
      width: 150px;
      background-color: var(--gradient-300);
      border-radius: 2px;
      margin: 1rem 0 1rem 0;
      overflow: hidden;

      &.active {
        opacity: 1;
      }

      .dropzone-loading--bar {
        background-color: var(--gradient-800);

        &:before {
          content: '';
          position: absolute;
          background-color: inherit;
          top: 0;
          left: 0;
          bottom: 0;
          will-change: left, right;
          animation: indeterminate 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }

        &:after {
          content: '';
          position: absolute;
          background-color: inherit;
          top: 0;
          left: 0;
          bottom: 0;
          will-change: left, right;
          animation: indeterminate-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
          animation-delay: 1.15s;
        }
      }
    }
  }
}

body.dark-theme {
  section#panel-upload {
    background-color: var(--gradient-800);

    .dropzone-details .dropzone-detail {
      background-color: var(--gradient-900);
    }

    .dropzone-is-loading {
      background-color: var(--gradient-700);

      .dropzone-loading--bar {
        background-color: var(--icon-color);
      }
    }
  }
}

.secred-mode {
  section#panel-upload {
    background-color: var(--gradient-900);

    .dropzone-details .dropzone-detail {
      background-color: var(--gradient-100);
    }

    .dropzone-is-loading {
      background-color: var(--gradient-800);

      .dropzone-loading--bar {
        background-color: var(--gradient-100);
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    color: var(--gradient-100);
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes indeterminate {
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
}

@keyframes indeterminate-short {
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
}
</style>