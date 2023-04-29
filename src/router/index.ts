import { createRouter, createWebHistory } from "vue-router";
import VUpload from "@src/views/VUpload.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: VUpload
  },
  {
    path: "/download",
    name: "download",
    component: () => import("@src/views/VDownload.vue")
  }
];

const router = createRouter({
  history: createWebHistory(process.env.NODE_ENV === 'production' ? "/sharex-interface/" : "./"),
  routes
});

export default router;