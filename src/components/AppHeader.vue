<template>
  <header id="header">
    <div class="header-title">

      <h1>ShaRex<span class="emoji">⚡</span></h1>

      <span>Instant File Sharing powered by IPFS Protocol</span>
    </div>
    <div class="header-menu">
      <nav>
        <router-link :to="{ name: 'home' }">Upload</router-link>
        <router-link :to="{ name: 'download' }">Download</router-link>
        <i :title="`Switch to ${isDark ? 'Light' : 'Dark'} Theme`">
          <i-mdi-brightness-7 v-if="isDark" class="icon-color" @click="toggleTheme" />
          <i-mdi-brightness-4 v-else class="icon-color" @click="toggleTheme" />
        </i>
      </nav>
      <ConnectWalletButton :address="address" :dark="isDark" @click="handleConnect">
        Connect
      </ConnectWalletButton>
    </div>
  </header>
</template>

<script lang="ts">
import { ref } from "vue";
import { ConnectWalletButton } from "vue-connect-wallet";
import { useMetaMaskWallet } from "vue-connect-wallet";
import { useWallet } from "@src/store/index";
import "vue-connect-wallet/dist/style.css";

export default {
  name: "AppHeader",
  setup() {
    const isDarkClassAvailable = document.body.classList.contains("dark-theme");

    const isDark = ref(isDarkClassAvailable);
    const toggleTheme = () => {
      document.body.classList.toggle("dark-theme");

      requestAnimationFrame(toggleAnimation);

      isDark.value = !isDark.value;
    }
    const toggleAnimation = () => {
      const element: HTMLElement | null = document.querySelector(
        "section#content .main"
      );

      element?.classList.remove("animated");
      void element?.offsetWidth;
      element?.classList.add("animated");
    }

    const address = ref("");
    const wallet = useMetaMaskWallet();
    const walletStore = useWallet();

    wallet.onChainChanged((chainId) => {
      window.location.reload();
    });

    const connect = async () => {
      const accounts = await wallet.connect();
      if (typeof accounts === "string") {
        console.log("An error occurred" + accounts);
      }
      address.value = accounts[0];
      walletStore.setAddress(accounts[0])
    };

    const switchAccount = async () => {
      await wallet.switchAccounts();
      connect();
    };

    const isConnected = async () => {
      const accounts = await wallet.getAccounts();
      if (typeof accounts === "string") return false;
      return accounts.length > 0;
    };

    const handleConnect = async () => {
      if (await isConnected()) {
        await switchAccount();
      } else {
        await connect();
      }
    };

    return {
      isDark,
      toggleTheme,
      handleConnect,
      address,
    }
  },
  components: {
    ConnectWalletButton
  }
}
</script>

<style lang="scss">
#header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  transition: border-bottom 0.5s ease;

  padding: 1.3em 64px;
  border-bottom: 1px solid rgb(243, 244, 246);

  .header-title {
    h1 {
      font-size: 1.7rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #333;

      span.emoji {
        font-size: 1.6rem;
      }
    }

    span {
      font-size: .9rem;
    }
  }

  .header-navbar {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }

  .header-menu {
    display: flex;
    align-items: center;
    gap: 2em;

    nav {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: right;
      padding: 0.3em;
      gap: 1em;

      a {
        color: var(--contrast-color);
        margin-right: 16px;
        padding-bottom: 8px;
        text-decoration: none;

        border-bottom: 1px solid;
        cursor: pointer;

        &.active {
          font-weight: bold;
        }
      }

      svg {
        cursor: pointer;
        font-size: 2em;
      }
    }
  }
}

body.dark-theme {
  #header {
    border-bottom: 1px solid #1c2435;

    .header-title h1 {
      color: #ffffff;
    }
  }
}

.connect-wallet-button {
  border-radius: 20%;
}
</style>