<template>
  <section id="panel-result">
    <div class="panel-result--content">
      <SearchResult :search="search" :count="files.length" @onChanged="onSearchChanged" />

      <div class="content-file--items">
        <div class="content-file--item empty" v-if="files.length === 0">
          <span v-if="search !== ''">No results. Try other file name.</span>
          <span v-else>List of files that you upload will appear here.</span>
        </div>
        <TransitionGroup name="list" tag="div">
          <div class="content-file--item" v-for="(item, index) in files" :key="item.id">
            <div class="item-content">
              <div class="item-icon">
                <i-ri-file-list-3-line class="icon-color" />
              </div>
              <div class="item-detail">
                <span class="item-detail--title" :title="item.file.name">{{ item.file.name }}</span>
                <span class="item-detail--subtitle">{{ fileSize(item.file.size) }} • {{ item.file.type }}</span>
              </div>
              <div class="item-action">
                <a v-if="isImage(item)" title="Open Link" target="_blank" :href="getPreviewUrl(item)" rel="noopener">
                  <i-ri-external-link-fill class="icon-color" />
                </a>
                <a title="Download" @click="item.cid ? download(item) : {}">
                  <i-mdi-download class="icon-color" />
                </a>
                <a title="Delete" @click="onDeleteResult(item)">
                  <i-ri-delete-back-2-line class="icon-color" />
                </a>
              </div>
            </div>
            <div class="item-cid">
              <label>
                <input class="input-cid" type="text" readonly
                  @focus="(event) => (event.target as HTMLInputElement).select()" :value="getLink(item)" />
              </label>

              <a title="Copy to clipboard"
                @click="(walletStore.address === '' && !!item.secret) ? () => { } : copyLink(item)">
                <i-ri-clipboard-line class="icon-color" />
              </a>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { ref, computed, inject } from "vue";
import type { FileDetail } from "@src/services/types";
import { useStore } from "@src/store";
import { fileSize, copyToClipboard, generateLink } from "@src/services/helpers";
import SearchResult from "@src/components/VUpload/SearchResult.vue";
import { useWallet } from "@src/store";
import { Notyf } from "notyf";
import { getBlob, downloadUint8ArrayFile } from "@src/services/ipfs"

export default {
  name: "PanelResult",
  components: {
    SearchResult,
  },
  methods: {
    isImage: (item: FileDetail): boolean => {
      return item.file.type.startsWith("image/");
    },
    download: async (item: FileDetail) => {
      getBlob(item.cid!).then(async (blob) => {
        downloadUint8ArrayFile(blob, item.file.name);
      });
    }
  },
  setup() {
    const notyf = inject("notyf") as Notyf;
    const store = useStore();
    const walletStore = useWallet();
    const search = ref("");


    const getLink = (item: FileDetail) => {
      if (item.secret && walletStore.address === "") {
        return "Please sign-in to view hashed keys";
      }
      if (!item.secret) {
        return generateLink(item);
      } else {
        return generateLink(item, walletStore.address);
      }
    }

    const getPreviewUrl = (item: FileDetail) => {
      return `https://ipfs.io/ipfs/${item.cid}`
    }

    const copyLink = (item: FileDetail) => {
      const url = getLink(item)
      copyToClipboard(url).then(() => {
        notyf.success("Copied to clipboard!");
      });
    }
    const onSearchChanged = ($event: Event): void => {
      search.value = ($event.target as HTMLInputElement).value;
    }

    const onDeleteResult = (item: FileDetail) => {
      if (!item.id) return;
      store.deleteResult(item.id);
      notyf.success("Deleted!");
    }

    const files = computed(() => store
      .results.slice()
      .reverse()
      .filter(item => !!item.cid)
      .filter(item => {
        if (search.value === "") return true;

        return item.file.name.indexOf(search.value) >= 0;
      }));

    return {
      search,
      files,
      walletStore,
      fileSize,
      getPreviewUrl,
      copyLink,
      generateLink,
      getLink,
      onDeleteResult,
      onSearchChanged
    }
  }
}
</script>

<style lang="scss">
section#panel-result {
  background-color: #ffffff;
  border-top-right-radius: 1rem;
  border-bottom-right-radius: 1rem;
  border-left: 1px solid rgba(0, 0, 0, .05);

  .panel-result--content {
    padding: 0.8rem;
    height: calc(100% - 1.6rem);

    .content-file--items {
      display: flex;
      flex-direction: column;

      overflow-y: scroll;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, .4) rgba(36, 18, 18, 0.2);

      height: calc(100% - 2.95rem);

      &::-webkit-scrollbar {
        width: 0.3rem;
      }

      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 1rem;
      }

      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 1rem;
      }

      .content-file--item {
        width: calc(100% - 1.6rem);
        padding: 0.8rem;
        margin-bottom: 0.8rem;
        display: flex;
        flex-direction: column;

        border-radius: 1rem;
        background-color: rgba(0, 0, 0, .05);

        &.empty {
          font-size: 0.7rem;
          text-align: center;
          border-radius: 0.8rem;
        }

        a svg {
          cursor: pointer;
        }

        .item-content {
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;

          .item-icon {
            padding: 0.5rem 0.5rem 0.5rem 0;
          }

          .item-detail {
            display: flex;
            flex-direction: column;
            flex: 1;

            .item-detail--title {
              font-size: 0.7rem;
              width: 220px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              margin-bottom: 0.4rem;
            }

            .item-detail--subtitle {
              font-size: 0.7rem;
            }
          }

          .item-action {
            display: flex;
            align-items: center;
            padding: 0.5rem 0 0.5rem 0.5rem;

            a {
              &:not(:last-child) {
                margin-right: 0.5rem;
              }
            }
          }
        }

        .item-cid {
          display: flex;
          align-items: center;
          margin-top: 0.7rem;
          width: 100%;

          label {
            display: flex;
            flex: 1;

            .input-cid {
              flex: 1;
              background-color: rgba(0, 0, 0, 0.1);
              outline: none;
              border: none;
              color: var(--contrast-color);
              padding: 8px;
              border-radius: 0.5rem;
              font-size: 0.7rem;
            }
          }

          a {
            margin-left: 0.5rem;
          }
        }
      }
    }
  }
}

body.dark-theme {
  section#panel-result {
    background-color: var(--gradient-900);

    .content-file--items .content-file--item {
      background-color: rgba(255, 255, 255, .05);

      .item-detail--subtitle {
        color: rgba(255, 255, 255, 0.5);
      }

      .item-cid .input-cid {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>