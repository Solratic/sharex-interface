<template>
  <section id="content">
    <div class="main animated">
      <div class="main-content--shadow s-index-1"></div>
      <div class="main-content--shadow s-index-2"></div>
      <div class="main-content">
        <PanelUpload />
        <PanelResult />
      </div>
    </div>
  </section>
  <div class="overlay" v-if="showQRCode" @click.self="closeOverlay">
    <div class="dialog">
      <div class="text">Share your file</div>
      <QRCodeVue :value="QRCodeValue.value" class="qrcode" :size="200"></QRCodeVue>
      <div class="item-cid">
        <input class="input-cid" type="text" :value="QRCodeValue.value" readonly
          @focus="(event) => (event.target as HTMLInputElement).select()" />
        <button class="copy-button" @click="onCopy">
          <i-mdi-clipboard-outline v-if="!isCopied" />
          <i-mdi-check v-else style="color: green;" />
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { inject, ref, reactive } from "vue";
import { Emitter, EventType } from "mitt";

import PanelUpload from "@src/components/VUpload/PanelUpload.vue";
import PanelResult from "@src/components/VUpload/PanelResult.vue";
import QRCodeVue from "qrcode.vue";
import { copyToClipboard } from "@src/services/helpers";

import { QREvents } from "@src/services/types";



export default {
  name: "VUpload",
  components: {
    PanelUpload,
    PanelResult,
    QRCodeVue,
  },
  setup() {
    const showQRCode = ref(false)
    const QRCodeValue = reactive({} as QREvents)
    const isCopied = ref(false)

    const emitter = inject("emitter") as Emitter<Record<EventType, QREvents>>
    emitter.on("open_qrcode", (e) => {
      if (!e.value) return;
      QRCodeValue.value = e.value;
      showQRCode.value = true;
    })

    const onCopy = () => {
      isCopied.value = true
      copyToClipboard(QRCodeValue.value);
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
    }

    const closeOverlay = () => {
      QRCodeValue.value = ""
      showQRCode.value = false
    }

    return {
      emitter,
      onCopy,
      closeOverlay,
      isCopied,
      showQRCode,
      QRCodeValue,
    }
  }
}
</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 900;

  .dialog {
    position: fixed;
    width: 30vw;
    height: 30vh;
    background-color: var(--gradient-800);
    border-radius: 1.5rem;
    padding: 20px;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.3);

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;

    color: var(--contrast-color);

    .text {
      font-size: large;
    }

    canvas {
      z-index: 999;
    }

    .item-cid {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      .input-cid {
        outline: none;
        border: none;
        padding: 8px;
        border-radius: 0.5rem;
        font-size: 0.7rem;
        width: 80%;
      }

      .copy-button {
        all: unset;
        margin-left: 2%;
        cursor: pointer;
      }
    }


  }
}


section#content {
  position: relative;
  height: 100%;

  .main {
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;

    height: 100%;

    .main-content {
      position: absolute;
      z-index: 3;

      display: flex;
      border-radius: 1em;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

      section {
        width: 414px;
        height: 414px;
      }
    }

    .main-content--shadow {
      position: absolute;

      width: 878px;
      height: 464px;

      box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-radius: 1em;

      &.s-index-1 {
        z-index: 1;
        background-image: var(--liniear-gradient-color-1);
        transition: transform .3s ease-in-out;

        transform: rotate(2deg);
      }

      &.s-index-2 {
        z-index: 2;
        background-image: var(--liniear-gradient-color-2);
        transition: transform .3s ease-in-out;

        transform: rotate(-2deg);

        &.animate {
          animation-name: shadow-index--2;
          animation-duration: 1s;
        }
      }
    }

    &.animated {
      .main-content--shadow {
        &.s-index-1 {
          animation-name: shadow-index--1;
          animation-duration: 1s;
        }

        &.s-index-2 {
          animation-name: shadow-index--2;
          animation-duration: 1s;
        }
      }
    }
  }
}

@keyframes shadow-index--1 {
  from {
    transform: rotate(-2deg);
  }

  to {
    transform: rotate(2deg);
  }
}

@keyframes shadow-index--2 {
  from {
    transform: rotate(2deg);
  }

  to {
    transform: rotate(-2deg);
  }
}
</style>