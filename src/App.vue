<template>
  <div>
    <div class="joystick-container" ref="joystick"></div>
    <div
      v-if="loading"
      class="overlay"
      ref="overlayElement"
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
    <div v-if="houseDetails" class="house-wraper"></div>
    <div v-if="houseDetails" class="house-details">
      <img
        @click="houseDetails = false"
        src="./assets/icons/Close.svg"
        class="close-icon"
        alt="Close"
      />

      <div class="house-details-container">
        <div class="house-header">
          <img src="./assets/house.png" class="house-img" alt="house" />
          <div style="display: flex">
            <img
              src="./assets/icons/Bixos-light.svg"
              style="height: 32px; margin-right: 10px"
              alt="ixos-light"
            />

            <span>{{ house.price.toLocaleString("es-ES") }}</span>
          </div>
        </div>
        <div class="tabs">
          <div
            style="width: 30%"
            class="tab"
            @click="activeTab = 1"
            :class="activeTab === 1 ? 'active-tab' : ''"
          >
            <span class="tab-text">General</span>
          </div>
          <div
            style="width: 40%"
            class="tab"
            @click="activeTab = 2"
            :class="activeTab === 2 ? 'active-tab' : ''"
          >
            <span class="tab-text">Interior Detail</span>
          </div>
          <div
            style="width: 30%"
            class="tab"
            @click="activeTab = 3"
            :class="activeTab === 3 ? 'active-tab' : ''"
          >
            <span class="tab-text">Extra</span>
          </div>
        </div>
        <div class="house-body">
          <div class="house-features" v-if="activeTab === 1">
            <div class="row row-dark">
              <div class="details-label">
                <p>Listing No</p>
              </div>
              <div
                class="details-value"
                style="font-weight: 900; color: #239eda"
              >
                <p>: {{ house.number }}</p>
              </div>
            </div>
            <div class="row">
              <div class="details-label">
                <p>Announcement Date</p>
              </div>
              <div class="details-value">
                <p>: {{ house.date }}</p>
              </div>
            </div>
            <div class="row row-dark">
              <div class="details-label">
                <p>Property Type</p>
              </div>
              <div class="details-value">
                <p>: {{ house.type }}</p>
              </div>
            </div>
            <div class="row">
              <div class="details-label">
                <p>m² (Gross)</p>
              </div>
              <div class="details-value">
                <p>: {{ house.m2 }}</p>
              </div>
            </div>
            <div class="row row-dark">
              <div class="details-label">
                <p>Building Age</p>
              </div>
              <div class="details-value">
                <p>: {{ house.age }}</p>
              </div>
            </div>
          </div>
          <div class="house-features" v-if="activeTab === 2">
            <div class="row row-dark">
              <div class="details-label">
                <p>Number of Rooms</p>
              </div>
              <div class="details-value">
                <p>: {{ house.rooms }}</p>
              </div>
            </div>
            <div class="row">
              <div class="details-label">
                <p>Number of Floors</p>
              </div>
              <div class="details-value">
                <p>: {{ house.floors }}</p>
              </div>
            </div>
            <div class="row row-dark">
              <div class="details-label">
                <p>Heating</p>
              </div>
              <div class="details-value">
                <p>: {{ house.heating }}</p>
              </div>
            </div>
            <div class="row">
              <div class="details-label">
                <p>Number of Bathrooms</p>
              </div>
              <div class="details-value">
                <p>: {{ house.bathrooms }}</p>
              </div>
            </div>
            <div class="row row-dark">
              <div class="details-label">
                <p>Furnished</p>
              </div>
              <div class="details-value">
                <p>: {{ house.furnished }}</p>
              </div>
            </div>
          </div>
          <div class="house-features" v-if="activeTab === 3">
            <div class="row row-dark">
              <div class="details-label">
                <p>Usage Status</p>
              </div>
              <div class="details-value">
                <p>: {{ house.status }}</p>
              </div>
            </div>
            <div class="row">
              <div class="details-label">
                <p>Inside Cite</p>
              </div>
              <div class="details-value">
                <p>: {{ house.cite }}</p>
              </div>
            </div>
            <div class="row row-dark">
              <div class="details-label">
                <p>Dues (TL)</p>
              </div>
              <div class="details-value">
                <p>: {{ house.dues }}</p>
              </div>
            </div>
            <div class="row">
              <div class="details-label">
                <p>Deed Status</p>
              </div>
              <div class="details-value">
                <p>: {{ house.deed }}</p>
              </div>
            </div>
            <div class="row row-dark">
              <div class="details-label">
                <p>From</p>
              </div>
              <div
                class="details-value"
                style="font-weight: 900; color: #239eda"
              >
                <p>: {{ house.Owner }}</p>
              </div>
            </div>
          </div>
          <button
            :disabled="house.price > balance"
            @click="buyHouse"
            v-if="!house.sold"
            :class="house.price > balance ? 'disabled-buy-buttom' : ''"
            class="buy-house-button"
          >
            Buy as NFT
          </button>
          <button
            @click="sellHouse"
            v-if="house.sold"
            class="sell-house-button"
          >
            Sell as NFT
          </button>
        </div>
      </div>
    </div>

    <lottie-player
      v-if="celebrate"
      src="https://assets2.lottiefiles.com/packages/lf20_rovf9gzu.json"
      background="transparent"
      speed="1"
      class="CelebBuy"
      loop
      autoplay
    ></lottie-player>

    <div v-if="deviceType() === 'desktop'" class="logo-home">
      <a href="https://bixos.io/" target="_blank" rel="noopener noreferrer">
        <img
          src="./assets/icons/Bixos-light-text.svg"
          class="logo-home-icon"
          alt="logo-home"
        />
      </a>
    </div>
    <div v-else class="logo-home">
      <img
        src="./assets/icons/Bixos-light.svg"
        class="logo-home-icon"
        alt="logo-home"
      />
    </div>

    <Drawer
      v-if="deviceType() !== 'desktop'"
      :direction="'right'"
      :exist="true"
      ref="LeftDrawer"
    >
      <div class="logo-home">
        <img
          src="./assets/icons/Bixos-light-text.svg"
          class="logo-home-icon drawer-logo"
          alt="logo-home"
        />
      </div>
      <div class="nav">
        <div v-for="link in links" :key="link.path" class="linksContainer">
          <img :src="link.icon" class="link-icon" alt="link-icon" />
          <router-link class="link" :to="link.path">
            <a :href="link.link" target="_blank">{{
              link.title
            }}</a></router-link
          >
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
    <div class="balance">
      <img src="./assets/icons/Bixos.svg" class="logo" alt="bixos-logo" />
      <span>{{ balance.toLocaleString("es-ES") }}</span>
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

    <KeysHelper />

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
    <div
      style="
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -o-user-select: none;
      "
      unselectable="on"
      @click="interact()"
      v-if="interactHint && deviceType() !== 'desktop'"
      class="home-details-button"
    >
      <span>Open</span>
    </div>
    <div
      style="
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -o-user-select: none;
      "
      unselectable="on"
      @click="reset(camera, controls)"
      v-if="deviceType() !== 'desktop'"
      class="reset-button"
    >
      <span>Reset</span>
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
import { ref, defineComponent } from "vue";

import Drawer from "./components/Drawer.vue";
import KeysHelper from "./components/KeysHelper.vue";
import Telegram from "./assets/icons/Telegram.svg";
import BixosLight from "./assets/icons/Bixos-light.svg";
import Discord from "./assets/icons/Discord.svg";
import Twitter from "./assets/icons/Twitter.svg";
import LinkedIn from "./assets/icons/LinkedIn.svg";
import Instagram from "./assets/icons/Instagram.svg";

import experience from "./experience/experience";

export default defineComponent({
  name: "App",
  components: { Drawer, KeysHelper },

  setup() {
    const overlayElement = ref({});
    const joystick = ref({});
    const loadingBarElement = ref({});

    const {
      loading,
      deviceType,
      houseDetails,
      house,
      activeTab,
      celebrate,
      balance,
      interactHint,
      interact,
      reset,
      buyHouse,
      sellHouse,
      camera,
      controls,
    } = experience(overlayElement, joystick, loadingBarElement);
    return {
      joystick,
      loading,
      overlayElement,
      deviceType,
      loadingBarElement,
      houseDetails,
      house,
      activeTab,
      celebrate,
      balance,
      interactHint,
      interact,
      reset,
      buyHouse,
      sellHouse,
      camera,
      controls,
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
    };
  },
  methods: {
    openMenu() {
      if (this.$refs.LeftDrawer.active) {
        this.$refs.LeftDrawer.close();
      } else {
        this.$refs.LeftDrawer.open();
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
});
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

.joystick-container {
  position: absolute;
  left: 40px;
  margin-left: auto;
  margin-right: auto;
  bottom: 40px;
  width: 100px;
  height: 100px;
}

.house-wraper {
  position: absolute;
  width: 100vw;
  height: 100vh;
  background: rgba(37, 55, 70, 0.75);
}
.house-details {
  width: 400px;
  height: 533px;
  max-height: 87vh;
  max-width: 90vw;
  position: absolute;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  top: calc((100vh - 533px) / 2);
  @media only screen and (max-width: 1250px) {
    top: 15vh;
  }
  .close-icon {
    position: absolute;
    top: -40px;
    right: 0;
    height: 25px;
    z-index: 10;
    cursor: pointer;
    &:active {
      animation: press 0.2s 1 linear;
    }
  }
  .house-details-container {
    height: 600px;
    max-height: 83vh;
    max-width: 90vw;
    width: 100%;
    .house-header {
      background: #68c2c4;
      height: 33%;
      width: 100%;
      border-top-left-radius: 35px;
      border-top-right-radius: 35px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
      display: flex;
      justify-content: center;
      align-items: flex-end;
      .house-img {
        position: absolute;
        top: -60px;
      }
      span {
        font-weight: 900;
        font-size: 30px;
        line-height: 35px;
        color: #ffffff;
        margin-bottom: 10px;
      }
    }
    .house-body {
      background: #ffffff;
      height: 60%;
      width: 100%;
      border-bottom-left-radius: 35px;
      border-bottom-right-radius: 35px;
      box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .house-features {
        max-width: 100%;
        @media only screen and (max-width: 1024px) {
          padding-top: 15px;
          max-height: 30vh;
          overflow-y: scroll;
        }
        .row {
          display: flex;

          padding: 15px 40px;
        }
        .row-dark {
          background: #f2f2f2;
        }
        p {
          margin: 0;
        }
        .details-label {
          font-size: 16px;
          line-height: 24px;
          color: #627d93;
          width: 60%;
        }
        .details-value {
          font-size: 16px;
          line-height: 24px;
          color: #627d93;
          width: 40%;
        }
      }
      .buy-house-button {
        margin-left: 40px;
        margin-right: 40px;
        margin-bottom: 20px;
        @media only screen and (max-width: 1024px) {
          margin-bottom: 20px;
        }
        background: #239eda;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
        border-radius: 16px;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 30px;
        line-height: 37px;
        text-align: center;
        color: #ffffff;
        cursor: pointer;
        translate: all 0.5s;
        outline: none;
        border: none;
        &:hover {
          background-color: #1f8ec4;
        }
        &:active {
          background-color: #1f8ec4;
          // box-shadow: 0 5px #666;
          // transform: translateY(4px);
          animation: press 0.2s 1 linear;
        }
      }

      .disabled-buy-buttom {
        background: #abc5d4;
        &:hover {
          background-color: #abc5d4;
          cursor: not-allowed;
        }
      }
      .sell-house-button {
        margin-left: 40px;
        margin-right: 40px;
        margin-bottom: 40px;
        background: #e5485b;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
        border-radius: 16px;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 30px;
        line-height: 37px;
        text-align: center;
        color: #ffffff;
        cursor: pointer;
        translate: all 0.5s;
        outline: none;
        border: none;
        &:hover {
          background-color: #e12d43;
        }
        &:active {
          background-color: #e12d43;
          // box-shadow: 0 5px #666;
          // transform: translateY(4px);
          animation: press 0.2s 1 linear;
        }
      }
    }
    .tabs {
      height: 10%;
      // width: 100%;
      max-width: 100%;
      background: #215670;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 17px;
      .tab {
        font-weight: 900;
        font-size: 16px;
        // line-height: 19px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        max-height: 60px;
        width: 100%;
        color: #ffffff;
        cursor: pointer;
      }
    }
  }
  @keyframes press {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(0.92);
    }
    to {
      transform: scale(1);
    }
  }
}
.active-tab {
  border-bottom: #68c2c4 4px solid;
  .tab-text {
    color: #68c2c4;
  }
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

.balance {
  width: 280px;
  height: 60px;

  position: absolute;
  right: 40px;
  top: 40px;
  @media only screen and (max-width: 1024px) {
    width: 200px;
    max-width: 40vw;
    height: 60px;
    right: 100px;
    top: 20px;
    font-size: 24px;

    margin-left: auto;
    margin-right: auto;
  }
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  color: #239eda;
  font-size: 30px;
  font-weight: bold;
  font-style: normal;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  .logo {
    height: 32px;
    width: 32px;
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
  top: 40px;
  left: 40px;
  @media only screen and (max-width: 1024px) {
    left: 20px;
    top: 20px;
  }
  .logo-home-icon {
    height: 60px;
  }
  cursor: pointer;
  &:hover {
    filter: invert(52%) sepia(40%) saturate(945%) hue-rotate(148deg)
      brightness(94%) contrast(100%);
  }
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
.home-details-button {
  position: absolute;
  right: 20px;
  bottom: 140px;
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
.reset-button {
  position: absolute;
  right: 20px;
  bottom: 40px;
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
  background-image: url("./assets/citybackground2.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
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
  background-image: url("./assets/a2mobileb.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  z-index: 999999999;
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
  right: 20px;
  width: 60px;
  height: 60px;
  cursor: pointer;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}
.hamburger {
  transition: all 0.4s ease-in-out;

  height: 28px;
  width: 33px;
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
        transform: translate(0, 12px) rotate(45deg);
      }
    }

    &--middle {
      .hamburger--is-open & {
        opacity: 0;
      }
    }

    &--last {
      .hamburger--is-open & {
        transform: translate(0, -12px) rotate(-45deg);
      }
    }
  }
}
.hamburger--is-open {
  // right: 250px;
  transition: all 0.4s ease-in-out;
}

.nav {
  padding-top: 120px;
  padding-left: 40px;
  .linksContainer {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    .link {
      font-size: 24px;
      margin-left: 10px;
    }
    .link-icon {
      filter: invert(52%) sepia(40%) saturate(945%) hue-rotate(148deg)
        brightness(94%) contrast(100%);
    }
  }
}
</style>
