import { createApp } from 'vue';
import { Quasar, Notify, Loading } from 'quasar';
import quasarIconSet from 'quasar/icon-set/fontawesome-v6';
import { createPinia } from 'pinia';

import '@quasar/extras/fontawesome-v6/fontawesome-v6.css';
import 'quasar/src/css/index.sass';

import App from '@/presentation/App.vue';

const app = createApp(App);

app.use(createPinia());

app.use(Quasar, {
  // 這個欄位用來註冊要使用的 Quasar 插件
  plugins: {
    Notify, // 註冊 Notify（通知）插件，之後可用 this.$q.notify 呼叫
    Loading, // 註冊 Loading（載入/遮罩）插件，之後可用 this.$q.loading 呼叫
  },
  // Quasar 的全域設定選項，可覆寫插件或元件的預設行為
  config: {
    // Notify 插件的全域設定
    notify: {
      position: 'top', // 通知顯示在畫面頂端
      timeout: 2500, // 通知顯示 2500ms（2.5 秒）後自動關閉
      textColor: 'white', // 通知文字顏色設定為白色
      actions: [{ icon: 'fa-solid fa-xmark', color: 'white' }], // 通知預設帶一個白色的關閉按鈕
    },
    // Loading 插件的全域設定
    loading: {
      // 使用 Quasar 預設 spinner（若需自定義 Spinner 元件，可建立並匯入）
      spinnerColor: 'primary',
      spinnerSize: 140,
      backgroundColor: 'grey-9',
      message: '\u8cc7\u6599\u8f09\u5165\u4e2d\uff0c\u8acb\u7a0d\u5019...',
    },
  },
  // 設定 Quasar 使用的 icon set 為我們匯入的 FontAwesome v6
  iconSet: quasarIconSet,
});

// 全域 Vue 錯誤處理器（最後防線）
app.config.errorHandler = (err, instance, info) => {
  // 開發者能在 console 看到詳細錯誤
  console.error('GlobalErrorHandler caught:', err);
  console.error('Vue instance:', instance);
  console.error('Error info:', info);

  // 嘗試顯示友善的錯誤通知給使用者（若 Quasar 已啟用）
  try {
    const qnotify = (app.config.globalProperties as any).$q?.notify;
    if (typeof qnotify === 'function') {
      qnotify({
        type: 'negative',
        message: (err as any)?.message || '發生未預期的錯誤',
      });
    }
  } catch (e) {
    // 忽略顯示錯誤時的二次錯誤
  }
};

// 捕捉未處理的 Promise rejection 作為補強
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  try {
    const qnotify = (app.config.globalProperties as any).$q?.notify;
    if (typeof qnotify === 'function') {
      qnotify({
        type: 'negative',
        message: (event.reason as any)?.message || '發生未處理的非同步錯誤',
      });
    }
  } catch (e) {
    // ignore
  }
});

app.mount('#app');
