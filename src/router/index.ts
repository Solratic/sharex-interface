import { createRouter, createWebHistory } from "vue-router";
import VUpload from "@src/views/VUpload.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: VUpload
  },
  {
    path: "/receive",
    name: "receive",
    component: () => import("@src/views/Receive.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;