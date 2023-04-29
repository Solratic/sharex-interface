<template>
    <div class="file-details">
        <div class="file-name">{{ truncate(fname) }}</div>
        <div class="file-size">
            {{ fsize ? fileSize(fsize) : "unknown" }}
            <i-mdi-download></i-mdi-download>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { fileSize } from "@src/services/helpers";


export default defineComponent({
    name: "FileBlock",
    setup() {
        const truncate = (str: string, maxLength: number = 15): string => {
            if (str.length <= maxLength) {
                return str;
            }
            else {
                const leftLength = Math.ceil((maxLength - 3) / 2);
                const rightLength = Math.floor((maxLength - 3) / 2);
                return str.substring(0, leftLength) + '...' + str.substring(str.length - rightLength);
            }
        }
        return {
            truncate,
            fileSize,
        }
    },
    props: {
        fname: {
            type: String,
            required: true,
        },
        fsize: {
            type: Number,
        },
    },
})
</script>

<style lang="scss">
.file-details {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 1em;
    margin-top: 5em;
    font-size: 1em;
    width: 15em;
    height: 15em;

    background-color: var(--gradient-500);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
}

.file-details-skeleton {
    background-color: #d1d1d1;
    cursor: default;
}

.file-details:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15), 0 6px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-0.5em);
}

.file-name {
    font-size: 1.1em;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 0.5em;
    white-space: nowrap;
    overflow: hidden;
    max-width: 90%;
}

.file-size {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 0.9em;
    color: #ffffff;
}
</style>