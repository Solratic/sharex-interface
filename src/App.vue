<template>
  <AppHeader />

  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" :key="$route.name" />
    </keep-alive>
  </router-view>

  <Footer />
  <ReloadPrompt />
</template>

<script>
import AppHeader from "@src/components/AppHeader.vue";
import ReloadPrompt from "@src/components/ReloadPrompt.vue";
import Footer from "./components/Footer.vue";
import { Notyf } from "notyf";
import { provide } from "vue";
import mitt from "mitt";

export default {
  name: "App",
  components: {
    AppHeader,
    ReloadPrompt
  },
  setup() {
    const NotfyProvider = new Notyf({
      duration: 2000,
      position: {
        x: 'center',
        y: 'bottom'
      },
      types: [
        {
          type: 'loading',
          background: 'orange',
          duration: 0,
          dismissible: true,
          icon: {
            className: 'icon icon-loading',
            tagName: 'i'
          }
        },
      ]
    })
    provide("notyf", NotfyProvider);
    provide("emitter", mitt());
  }
}
</script>

<style></style>
