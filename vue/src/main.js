import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import "./styles/main.scss";
import { currentConfig } from "./config";

const app = createApp(App);

// 设置应用标题和描述
document.title = currentConfig.title;
document.querySelector('meta[name="description"]').content = currentConfig.description;

app.use(createPinia());
app.use(router);
app.use(ElementPlus);

app.mount("#app");
