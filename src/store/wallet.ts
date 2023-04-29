
import { defineStore } from "pinia";

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