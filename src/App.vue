<template>
  <div>
    <div class="joystick-container" ref="joystick"></div>
    <div
      v-if="loading"
      class="overlay"
      :class="
        deviceType() === 'desktop'
          ? 'desktop-background-loading'
          : 'mobile-background-loading'
      "
    >
      <img
        src="./assets/loading-text.png"
        class="loading-text"
        alt="loading-text"
      />
      <div class="loading-bar-container">
        <div class="loading-bar" ref="loadingBarElement"></div>
        <span class="loading-span">LOADING</span>
      </div>
    </div>
    <div
      ref="overlayElement"
      class="overlay"
      :class="
        deviceType() === 'desktop'
          ? 'desktop-background-loading'
          : 'mobile-background-loading'
      "
      v-if="gettingName"
    >
      <div class="name-container">
        <input v-model="playerName" type="text" />
        <button @click="start()">Jump</button>
      </div>
    </div>

    <iframe
      ref="frameContainer"
      class="frame"
      allow="camera *; microphone *"
      v-show="gettingName"
    ></iframe>

    <div class="logo-home">
      <div class="logo-home-bg"></div>
      <a href="https://bixos.io/" target="_blank" rel="noopener noreferrer">
        <img
          src="./assets/palmislands.png"
          class="logo-home-icon"
          alt="logo-home"
        />
      </a>
    </div>

    <Drawer
      v-if="deviceType() !== 'desktop'"
      :direction="'right'"
      :exist="true"
      ref="LeftDrawer"
    >
      <div class="nav">
        <div class="nav-box-container">
          <div class="nav-box" style="margin-bottom: 20px">
            <img src="./assets/icons/Bixos-light.svg" width="80" />
            <div class="nav-box-user">
              <span> {{ playerName }}</span>
              <span class="nav-box-user-price">{{
                balance.toLocaleString("es-ES")
              }}</span>
            </div>
          </div>
          <div class="nav-box">
            <img src="./assets/icons/Setting-dark.svg" />
            Profile Settings
          </div>
          <div class="nav-box">
            <img src="./assets/icons/Reset-dark.svg" />
            Restart Game
          </div>
        </div>
        <div class="link-container">
          <img
            v-for="link in links"
            :key="link.path"
            :src="link.icon"
            class="link-icon"
            alt="link-icon"
          />
        </div>
      </div>
    </Drawer>
    <div
      class="humburger-container"
      @click="openMenu"
      v-if="deviceType() !== 'desktop'"
    >
      <div class="hamburger" :class="hamburgerOpen ? 'hamburger--is-open' : ''">
        <div class="hamburger__item hamburger__item--first"></div>
        <div class="hamburger__item hamburger__item--middle"></div>
        <div class="hamburger__item hamburger__item--last"></div>
      </div>
    </div>

    <div class="actions-container">
      <div class="balance" :class="{ 'hide-balance': drawerIsActive }">
        <img
          v-if="deviceType() === 'desktop'"
          src="./assets/icons/Bixos-light.svg"
          class="logo"
          alt="bixos-logo"
        />
        <img
          v-else
          src="./assets/icons/Bixos.svg"
          class="logo"
          alt="bixos-logo"
        />
        <span>{{ balance.toLocaleString("es-ES") }}</span>
      </div>

      <div class="user-button">
        <img src="./assets/icons/Setting.svg" class="logo" alt="bixos-logo" />
        <span class="player-name">{{ playerName }}</span>
      </div>
    </div>

    <div v-if="deviceType() === 'desktop'" class="social-media">
      <a href="https://t.me/ubxscommunity" target="_blank">
        <img
          src="./assets/icons/Telegram.svg"
          class="social-media-icon"
          alt="telegram"
        />
      </a>
      <a href="https://discord.io/ubxs" target="_blank">
        <img
          src="./assets/icons/Discord.svg"
          class="social-media-icon"
          alt="discord"
        />
      </a>
      <a href="https://twitter.com/Bixosinc" target="_blank">
        <img
          src="./assets/icons/Twitter.svg"
          class="social-media-icon"
          alt="twitter"
        />
      </a>
      <a href="https://www.linkedin.com/company/bixosinc/" target="_blank">
        <img
          src="./assets/icons/LinkedIn.svg"
          class="social-media-icon"
          alt="linkedin"
        />
      </a>

      <a href="https://www.instagram.com/bixosinc" target="_blank">
        <img
          src="./assets/icons/Instagram.svg"
          class="social-media-icon"
          alt="instagram"
        />
      </a>
    </div>

    <HouseModel
      v-if="houseDetails"
      :house="house"
      @onHideModel="houseDetails = false"
      @onBuyHouse="buyHouse()"
      @onSellHouse="sellHouse()"
    />
    <lottie-player
      v-if="celebrate"
      src="https://assets2.lottiefiles.com/packages/lf20_rovf9gzu.json"
      background="transparent"
      speed="1"
      class="CelebBuy"
      loop
      autoplay
    ></lottie-player>

    <KeysHelper
      v-if="deviceType() === 'desktop' && globalSocket"
      :socket="globalSocket"
      @handleTypingState="handleTypingState()"
    />
    <MobileActions
      :interactHint="interactHint"
      @onReset="reset(camera, controls)"
      @onInteract="interact()"
      @onRun="triggerRun()"
      @onJump="triggerJump()"
    />

    <div
      style="
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -o-user-select: none;
      "
      unselectable="on"
      v-if="interactHint && deviceType() === 'desktop'"
      class="hint"
    >
      <img src="./assets/icons/Enter.svg" class="enter-icon" alt="enter" />
      <span>Press <strong>Enter</strong> to see Mansion Features.</span>
    </div>

    <!-- <div
      style="
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -o-user-select: none;
      "
      unselectable="on"
      @click="requestFullScreen()"
      v-if="deviceType() !== 'desktop'"
      class="full-button"
    >
      <span>Full Screen</span>
    </div> -->
  </div>
</template>

<script>
import { ref, onMounted, defineComponent } from "vue";

import Drawer from "./components/Drawer.vue";
import KeysHelper from "./components/KeysHelper.vue";
import MobileActions from "./components/MobileActions.vue";
import HouseModel from "./components/HouseModel.vue";

import Telegram from "./assets/icons/Telegram.svg";
import BixosLight from "./assets/icons/Bixos-light.svg";
import Discord from "./assets/icons/Discord.svg";
import Twitter from "./assets/icons/Twitter.svg";
import LinkedIn from "./assets/icons/LinkedIn.svg";
import Instagram from "./assets/icons/Instagram.svg";

import experience from "./experience/experience";

export default {
  name: "App",
  components: { Drawer, KeysHelper, MobileActions, HouseModel },

  setup() {
    const subdomain = "bixosio"; // Replace with your custom subdomain
    const frameContainer = ref(null);

    const overlayElement = ref({});
    const joystick = ref({});
    const loadingBarElement = ref({});
    onMounted(() => {
      // https://bixosio.readyplayer.me/
      frameContainer.value.src = `https://${subdomain}.readyplayer.me/avatar?frameApi=true`;
      window.addEventListener("message", subscribe);
      document.addEventListener("message", subscribe);

      function subscribe(event) {
        const json = parse(event);
        if (json?.source !== "readyplayerme") {
          return;
        }

        // Susbribe to all events sent from Ready Player Me once frame is ready
        if (json.eventName === "v1.frame.ready") {
          frameContainer.value.contentWindow.postMessage(
            JSON.stringify({
              target: "readyplayerme",
              type: "subscribe",
              eventName: "v1.**",
            }),
            "*"
          );
        }

        // Get avatar GLB URL
        if (json.eventName === "v1.avatar.exported") {
          localStorage.avatarName = json.data.url;
          start();
        }

        // Get user id
        if (json.eventName === "v1.user.set") {
          console.log(
            `User with id ${json.data.id} set: ${JSON.stringify(json)}`
          );
        }
      }

      function parse(event) {
        try {
          return JSON.parse(event.data);
        } catch (error) {
          return null;
        }
      }

      function displayIframe() {
        console.log("frame.value :>> ", frameContainer.value);
        frameContainer.value.hidden = false;
      }
      displayIframe();
    });

    const {
      loading,
      deviceType,
      houseDetails,
      house,
      celebrate,
      balance,
      interactHint,
      interact,
      reset,
      buyHouse,
      sellHouse,
      camera,
      controls,
      triggerRun,
      triggerJump,
      start,
      gettingName,
      playerName,
      globalSocket,
      handleTypingState,
    } = experience(overlayElement, joystick, loadingBarElement);

    return {
      joystick,
      loading,
      overlayElement,
      deviceType,
      loadingBarElement,
      houseDetails,
      house,
      celebrate,
      balance,
      interactHint,
      interact,
      reset,
      buyHouse,
      sellHouse,
      camera,
      controls,
      triggerRun,
      triggerJump,
      start,
      gettingName,
      playerName,
      frameContainer,
      globalSocket,
      handleTypingState,
    };
  },
  data() {
    return {
      isMounted: false,
      links: [
        {
          icon: BixosLight,
          title: "Bixos.io",
          link: "https://bixos.io/",
        },
        {
          icon: Telegram,
          title: "Telegram",
          link: "https://t.me/ubxscommunity",
        },
        {
          icon: Discord,
          title: "Discord",
          link: "https://discord.io/ubxs",
        },
        {
          icon: Twitter,
          title: "Twitter",
          link: "https://twitter.com/Bixosinc",
        },
        {
          icon: LinkedIn,
          title: "LinkedIn",
          link: "https://www.linkedin.com/company/bixosinc/",
        },
        {
          icon: Instagram,
          title: "Instagram",
          link: "https://www.instagram.com/bixosinc",
        },
      ],
      drawerIsActive: false,
    };
  },
  methods: {
    openMenu() {
      if (this.$refs.LeftDrawer.active) {
        this.$refs.LeftDrawer.close();
        this.drawerIsActive = false;
      } else {
        this.$refs.LeftDrawer.open();
        this.drawerIsActive = true;
      }
    },
  },
  computed: {
    hamburgerOpen() {
      if (!this.isMounted) return false;
      if (this.$refs.LeftDrawer.active) {
        return true;
      } else {
        return false;
      }
    },
  },
  mounted() {
    this.isMounted = true;
  },
};
</script>

<style lang="scss">
html,
body {
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-family: "Montserrat", sans-serif;
}
body {
  // background: black;
  background: rgb(235, 252, 255);
  background: linear-gradient(
    0deg,
    rgba(235, 252, 255, 1) 0%,
    rgba(191, 244, 255, 1) 54%,
    rgba(0, 212, 255, 1) 100%
  );
  margin: 0px;
  overflow: hidden;
}
canvas {
  width: 100%;
  height: 100%;
}
.frame {
  width: 100vw;
  height: 80vh;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  font-size: 14px;
  border: none;
  position: absolute;
  top: 20vh;
  z-index: 9999999999999;
}
.name-container {
  height: 20vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  input {
    height: 30px;
    border-radius: 6px;
    outline: none;
    border: solid 1px #00e8da;
    color: #1d221c;
    font-size: 14px;
    padding-left: 20px;
    font-weight: 500;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  }
  button {
    height: 34px;
    border-radius: 6px;
    outline: none;
    border: solid 1px #00e8da;
    color: #1d221c;
    font-size: 14px;
    padding-left: 20px;
    margin-left: 5px;
    padding-right: 20px;
    background: #00e8da;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);

    &:active {
      background: #239eda;
      color: white;
    }
  }
}
.warning {
  background-color: #df68a2;
  padding: 3px;
  border-radius: 5px;
  color: white;
}

.joystick-container {
  position: absolute;
  left: 40px;
  margin-left: auto;
  margin-right: auto;
  bottom: 40px;
  width: 100px;
  height: 100px;
}

.interact-hint {
  width: 200px;
  height: 100px;
  background: grey;
  z-index: 99999;
  position: absolute;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  top: 10%;
}

.actions-container {
  display: flex;
  position: absolute;
  right: 40px;
  top: 40px;
  font-size: 30px;
  font-weight: bold;
  font-style: normal;
  gap: 15px;
  @media only screen and (max-width: 1024px) {
    top: 20px;
    right: 70px;
  }
}

.balance {
  min-width: 250px;
  max-width: 350px;
  height: 60px;
  @media only screen and (max-width: 1024px) {
    width: 30px;
    min-width: 155px;
    max-width: 30vw;
    height: 50px;
    font-size: 24px;
    gap: 5px;
    border-radius: 16px;
    background: #fff;
    color: #239eda;
    font-weight: 900;
    display: flex;
    align-items: center;
    box-shadow: 0px 10px 30px rgba(28, 56, 63, 0.75);
    padding: 0 5px;
    transition: all 0.3s ease;
    opacity: 1;
    .logo {
      height: 32px;
      width: 32px;
    }
  }
  @media only screen and (max-width: 320px) {
    min-width: 125px;
    font-size: 20px;
    .logo {
      height: 24px;
      width: 24px;
    }
  }
}
.hide-balance {
  opacity: 0;
}

.user-button {
  min-width: 250px;
  max-width: 350px;
  height: 60px;
  @media only screen and (max-width: 1024px) {
    display: none;
  }
  background: #239eda;
  border-radius: 50px;
  box-shadow: 0px 10px 30px rgba(28, 56, 63, 0.75);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 0 15px;
  .logo {
    height: 32px;
    width: 32px;
  }
  .player-name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}

.social-media {
  position: absolute;
  bottom: 40px;
  right: 40px;
  display: flex;
  .social-media-icon {
    height: 32px;
    width: 32px;
    margin: 0 10px;
    cursor: pointer;
    &:hover {
      filter: invert(52%) sepia(40%) saturate(945%) hue-rotate(148deg)
        brightness(94%) contrast(100%);
    }
  }
}
.logo-home {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 99999;
  .logo-home-icon {
    height: 120px;
  }
  @media only screen and (max-width: 1024px) {
    .logo-home-icon {
      height: 55px;
    }
  }
  @media only screen and (max-width: 320px) {
    left: 5px;
  }
  cursor: pointer;
  //   &:hover {
  //     filter: invert(52%) sepia(40%) saturate(945%) hue-rotate(148deg)
  //       brightness(94%) contrast(100%);
  //   }
}
.drawer-logo {
  filter: invert(52%) sepia(40%) saturate(945%) hue-rotate(148deg)
    brightness(94%) contrast(100%);
}
.hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 40px;
  margin-left: auto;
  margin-right: auto;
  width: 400px;
  height: 120px;
  background: linear-gradient(
    263.11deg,
    #64ccc9 5.68%,
    #00a3e0 94.89%,
    #00a3e0 94.89%
  );
  border: 1px solid #ffffff;
  box-sizing: border-box;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  span {
    font-size: 20px;
    line-height: 23px;
    max-width: 270px;
    margin-left: 10px;
    color: #ffffff;
  }
  img {
    width: 60px;
  }
}
.CelebBuy {
  position: absolute;
  right: 0;
  top: 00vh;
  margin-left: auto;
  margin-right: auto;
  width: 100vw;
  z-index: 100;
}

.full-button {
  position: absolute;
  right: 20px;
  bottom: 90px;
  padding: 10px 20px;
  border-radius: 6px;
  background: white;
  color: #0ca6d7;
  font-weight: bold;
  font-size: 20px;
  line-height: 20px;
  background: #ffffff;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  &:active {
    animation: press 0.2s 1 linear;
  }
}

.desktop-background-loading {
  background: white;
  background-image: url("./assets/citybackground2.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  z-index: 999999999;
  .loading-text {
    position: absolute;
    top: 0;
    right: 0;
  }
  .loading-bar-container {
    top: auto;
    right: 30vh;
    bottom: 20vh;
  }
}
.mobile-background-loading {
  background: white;
  background-image: url("./assets/a2mobileb.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 999999999;
  .loading-text {
    max-width: 100vw;
  }
  .loading-bar-container {
    top: auto;
    bottom: 10vh;
  }
}
.overlay {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: absolute;
  opacity: 1;
  top: 0;
  left: 0;
  filter: blur(0);
  img {
    max-width: 90vw;
  }
}
.loading-bar-container {
  border: #239eda 6px solid;
  background: #1c7eae;
  border-radius: 20px;
  z-index: 2;
  position: absolute;
  top: 30%;

  height: 50px;
  width: 255px;
  .loading-span {
    position: absolute;
    top: 8px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    font-weight: 900;
    font-size: 30px;
    text-align: center;
    color: #ffffff;
  }
}
.loading-bar {
  position: absolute;
  top: 0;
  background-image: url("./assets/loading-bar.png");
  height: 50px;
  width: 255px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  // background: #ffffff;
  transform: scaleX(0);
  transform-origin: top left;
  transition: transform 0.5s;
}
.overlay.ended {
  filter: blur(1.5rem);
  transition: filter 1s ease-in-out;
}

.humburger-container {
  background: #ffffff;
  border-radius: 16px;
  position: absolute;
  top: 20px;
  right: 10px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hamburger {
  transition: all 0.4s ease-in-out;
  height: 22px;
  width: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    cursor: pointer;
  }

  &__item {
    height: 4px;
    width: 100%;
    background: #239eda;
    transition: transform 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95),
      opacity 300ms linear;

    &--first {
      .hamburger--is-open & {
        transform: translate(0, 9px) rotate(45deg);
      }
    }

    &--middle {
      .hamburger--is-open & {
        opacity: 0;
      }
    }

    &--last {
      .hamburger--is-open & {
        transform: translate(0, -9px) rotate(-45deg);
      }
    }
  }
}
.hamburger--is-open {
  // right: 250px;
  transition: all 0.4s ease-in-out;
}

.nav {
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  .nav-box-container {
    margin-top: 80px;
  }
  .nav-box {
    background: #239eda;
    border-radius: 20px;
    width: calc(80vw - 30px);
    min-height: 17px;
    display: flex;
    align-items: center;
    gap: 20px;
    margin: 10px auto;
    padding: 20px 30px;
    font-size: 22px;
    font-weight: 700;
    color: #2a3869;
    .nav-box-user {
      display: flex;
      flex-direction: column;
      .nav-box-user-price {
        font-size: 33px;
        color: white;
      }
    }
  }
  .link-container {
    width: calc(80vw - 30px);
    padding: 10px 30px;
    height: 50px;
    bottom: 50px;
    background: #ffffff;
    border-radius: 50px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 45px;
    .link {
      font-size: 22px;
      margin-left: 10px;
    }
    .link-icon {
      filter: invert(52%) sepia(40%) saturate(945%) hue-rotate(148deg)
        brightness(94%) contrast(100%);
    }
  }
}
</style>
