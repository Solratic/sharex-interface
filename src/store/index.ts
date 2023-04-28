import { defineStore } from "pinia";
import Storage from "@src/services/storage";
import type { FileDetail } from "@src/services/types";

const db = new Storage("app");

db.read();
db.data ??= { version: "0.0.1", results: [] };

interface StoreState {
  files: File[];
  results: FileDetail[];
}

export const useStore = defineStore({
  id: "store",
  state: (): StoreState => {
    return {
      files: [],
      results: db.data!.results,
    };
  },
  actions: {
    resetFiles(this: StoreState) {
      this.files = [];
    },
    addFiles(this: StoreState, ...files: File[]) {
      this.files.push(...files);
    },
    addResults(this: StoreState, ...results: FileDetail[]) {
      this.results.push(...results);
      this.results = this.results.filter(({ cid }) => !!cid);

      db.data!.results = [...this.results];
      db.write();
    },
    deleteResult(this: StoreState, _id: string) {
      this.results = this.results.filter(({ id }) => id !== _id);
      db.data!.results = [...this.results];
      db.write();
    },
  },
});


export const useWallet = defineStore({
  id: "wallet",
  state() {
    return {
      address: ""
    }
  },
  actions: {
    setAddress(address: string) {
      this.address = address;
    }
  }
})