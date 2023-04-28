<template>
  <section id="panel-result">
    <div class="panel-result--content">
      <SearchResult :search="search" :count="files.length" @onChanged="onSearchChanged" />

      <div class="content-file--items">
        <div class="content-file--item empty" v-if="files.length === 0">
          <span v-if="search !== ''">No results. Try other file name.</span>
          <span v-else>List of files that you upload will appear here.</span>
        </div>

        <div class="content-file--item" v-for="(item, index) in files" :key="index">
          <div class="item-content">
            <div class="item-icon">
              <i-ri-file-list-3-line class="icon-color" />
            </div>
            <div class="item-detail">
              <span class="item-detail--title" :title="item.file.name">{{ item.file.name }}</span>
              <span class="item-detail--subtitle">{{ fileSize(item.file.size) }} • {{ item.file.type }}</span>
            </div>
            <div class="item-action">
              <a title="Open Link" target="_blank" :href="generateLink(item)" rel="noopener">
                <i-ri-external-link-fill class="icon-color" />
              </a>
              <a title="Delete">
                <i-ri-delete-back-2-line class="icon-color" @click="onDeleteResult(idx)" />
              </a>
            </div>
          </div>
          <div class="item-cid">
            <label>
              <input class="input-cid" type="text" readonly
                @focus="(event) => (event.target as HTMLInputElement).select()" :value="getLinkOrKey(item)" />
            </label>

            <a title="Copy to clipboard" @click="copyFileLink(item)">
              <i-ri-clipboard-line class="icon-color" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { ref, computed, inject } from "vue";
import type { FileDetail } from "@src/services/types";
import { useStore } from "@src/store";
import { fileSize, copyToClipboard, generateLink } from "@src/services/helpers";
import { ethers } from "ethers";
import SearchResult from "@src/components/VUpload/SearchResult.vue";
import { useWallet } from "@src/store/index";
import { Notyf } from "notyf";

export default {
  name: "PanelResult",
  components: {
    SearchResult
  },
  setup() {
    const notyf = inject("notyf") as Notyf;
    const store = useStore();
    const walletStore = useWallet();
    const search = ref("");

    const generateKey = (item: FileDetail) => {
      if (walletStore.address === "") {
        return "Please sign-in to view keys";
      }
      return ethers.utils.solidityKeccak256(["string", "string", "address"], [item.cid, item.secret, walletStore.address]);
    }

    const getLinkOrKey = (item: FileDetail) => {
      if (!item.secret) {
        return generateLink(item);
      } else {
        return generateKey(item);
      }
    }

    const copyLink = (item: FileDetail) => {
      const url = getLinkOrKey(item)
      copyToClipboard(url).then(() => {
        notyf.success("Copied to clipboard!");
      });
    }
    const onSearchChanged = ($event: Event): void => {
      search.value = ($event.target as HTMLInputElement).value;
    }

    const onDeleteResult = (idx: number) => {
      store.deleteResult(idx);
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
      fileSize,
      copyFileLink: copyLink,
      generateLink,
      getLinkOrKey,
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
</style>