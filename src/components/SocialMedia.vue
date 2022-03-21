<template>
  <div class="right-bottom">
    <div class="social-media">
      <a href="https://t.me/ubxscommunity" target="_blank">
        <img
          src="../assets/icons/Telegram.svg"
          class="social-media-icon"
          alt="telegram"
        />
      </a>
      <a href="https://discord.io/ubxs" target="_blank">
        <img
          src="../assets/icons/Discord.svg"
          class="social-media-icon"
          alt="discord"
        />
      </a>
      <a href="https://twitter.com/Bixosinc" target="_blank">
        <img
          src="../assets/icons/Twitter.svg"
          class="social-media-icon"
          alt="twitter"
        />
      </a>
      <a href="https://www.linkedin.com/company/bixosinc/" target="_blank">
        <img
          src="../assets/icons/LinkedIn.svg"
          class="social-media-icon"
          alt="linkedin"
        />
      </a>

      <a href="https://www.instagram.com/bixosinc" target="_blank">
        <img
          src="../assets/icons/Instagram.svg"
          class="social-media-icon mr-negative"
          alt="instagram"
        />
      </a>
    </div>
    <div class="controllers">
      <div class="key-helper">
        <div
          style="
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-right: 6px;
          "
        >
          <div
            style="display: flex; flex-direction: row align-items: center ; justify-contenr:center;"
          >
            <span class="walk-hint"> Walk </span>
            <div class="key">
              <span>W</span>
              <img
                style="transform: rotate(180deg)"
                src="../assets/icons/Arrow.svg"
                class="arrow"
                alt="arrow"
              />
            </div>
            <div class="key">
              <div class="key-mouse">
                <img
                  src="../assets/icons/Mouse.svg"
                  class="mouse"
                  alt="mouse"
                />
              </div>
            </div>
          </div>
          <div class="bottom-keys">
            <div class="key">
              <span>A</span>
              <img
                src="../assets/icons/Arrow.svg"
                style="transform: rotate(90deg)"
                class="arrow"
                alt="arrow"
              />
            </div>
            <div class="key">
              <span>S</span>
              <img src="../assets/icons/Arrow.svg" class="arrow" alt="arrow" />
            </div>
            <div class="key">
              <span>D</span>
              <img
                src="../assets/icons/Arrow.svg"
                style="transform: rotate(-90deg)"
                class="arrow"
                alt="arrow"
              />
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center">
          <div style="display: flex; align-items: center; width: 100%">
            <div class="key key-mouse restart-key">
              <span>R</span>
            </div>
            <span class="right-hint"> Restart </span>
          </div>
          <div style="display: flex; align-items: center; width: 100%">
            <div class="key left-key" style="width: 100%">
              <span>Shift</span>
            </div>
            <span class="walk-hint run"> Run </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SocialMedia",
  setup(_, { emit }) {
    return {};
  },
};
</script>

<style lang="scss" scoped>
.right-bottom {
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: -2px;
  right: 20px;
  width: 300px;

  .controllers {
    position: relative;
    left: 0px;
    bottom: 0px;
    background: #239eda;

    border: 1px solid #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 40px 40px 0px 0px;
    margin-top: 17px;
    padding: 15px 10px;
  }
  .key-helper {
    display: flex;
    align-items: flex-end;

    .walk-hint {
      font-size: 16px;
      font-style: normal;
      font-weight: normal;
      color: #ffffff;
      margin: auto;
    }
    .right-hint {
      margin-left: 20px;
      font-style: normal;
      font-weight: normal;
      font-size: 16px;
      color: #ffffff;
    }
  }
  .bottom-keys {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }
  .key {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    border-radius: 6px;
    margin: 5px;
    color: #0ca6d7;
    font-weight: bold;
    font-size: 14px;
    line-height: 20px;
    background: #ffffff;
    font-weight: bold;
    .arrow {
      height: 9px;
    }
  }
  .left-key {
    width: 100px;
  }
  .key-mouse {
    .mouse {
      height: 19.11px;
      width: 24.93px;
    }
  }
  .restart-key {
    background: #0ca6d7;
    color: #ffffff;
    margin-right: -15px;
  }
  .run {
    margin-right: 15px;
  }

  .social-media {
    position: relative;
    padding: 10px 0px;
    display: flex;
    background-color: #2a3869;
    justify-content: center;
    border-radius: 36px;
    .social-media-icon {
      height: 27px;
      width: 27px;
      color: #239eda !important;
      padding-right: 20px;
      cursor: pointer;
      filter: invert(48%) sepia(21%) saturate(923%) hue-rotate(160deg)
        brightness(100%) contrast(100%);
      &:hover {
        color: white;
      }
    }
  }
}
.mr-negative {
  margin-right: -20px;
}
</style>
