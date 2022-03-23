<template>
  <div>
    <div
      v-touch:tap="onJump"
      v-if="deviceType() !== 'desktop'"
      class="main-button"
    >
      <div class="button-style">
        <img style="height: 25px" src="../assets/icons/Jump.svg" alt="enter" />
      </div>
    </div>
    <div
      v-touch:tap="onRun"
      v-if="deviceType() !== 'desktop'"
      style="bottom: 105px; right: 90px"
      class="action-button"
    >
      <div class="button-style">
        <img src="../assets/icons/Running.svg" v-if="running" alt="enter" />
        <img src="../assets/icons/Walking.svg" v-else alt="enter" />
      </div>
    </div>
    <div
      v-touch:tap="onInteract"
      v-if="interactHint && deviceType() !== 'desktop'"
      style="bottom: 130px; right: 20px"
      class="action-button"
    >
      <div class="button-style">
        <span>{{ currentIntersect.userData.house.sold ? "Sell" : "Buy" }}</span>
      </div>
    </div>

    <!-- v-touch:tap="onReset" -->
    <div
      v-touch:tap="openChat"
      v-if="deviceType() !== 'desktop'"
      class="action-button"
    >
      <div v-if="notification > 0" class="notification">
        {{ notification > 10 ? 10 : notification }}
      </div>
      <div class="button-style">
        <img style="height: 20px" src="../assets/icons/Chat.svg" alt="enter" />
      </div>
    </div>
  </div>
</template>

<script>
import { deviceType } from "../experience/helper";
import { ref } from "vue";

export default {
  props: ["interactHint", "currentIntersect", "notification"],
  setup(_, { emit }) {
    const running = ref(false);
    const onReset = () => {
      emit("onReset");
    };
    const onInteract = () => {
      emit("onInteract");
    };
    const onRun = (e) => {
      emit("onRun");
      running.value = !running.value;
    };
    const onJump = () => {
      emit("onJump");
    };
    const openChat = () => {
      emit("openChat");
    };

    return {
      deviceType,
      onReset,
      onInteract,
      onRun,
      onJump,
      openChat,
      running,
    };
  },
};
</script>

<style lang="scss" scoped>
.main-button {
  height: 80px;
  width: 80px;
  border-radius: 50%;
  position: absolute;
  bottom: 40px;
  right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  background: rgb(255, 255, 255, 0.25);
  border: 1px solid white;
  transform: all 0.5s;
  &:active {
    transform: scale(0.9, 0.9);
  }
  .button-style {
    height: 55px;
    width: 55px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #239eda;
    border: 1px solid #239eda;
    box-shadow: inset 0px -4px 10px rgb(0 27 121 / 50%),
      inset 0px 4px 11px #63f6ff;
  }
  img {
    filter: brightness(0) invert(1);
  }
}
.action-button {
  height: 58px;
  width: 58px;
  border-radius: 50%;
  position: absolute;
  bottom: 40px;
  right: 110px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 900;
  font-size: 14px;
  line-height: 16px;

  opacity: 1;
  background: rgb(255, 255, 255, 0.25);
  border: 1px solid white;
  transform: all 0.5s;
  &:active {
    transform: scale(0.9, 0.9);
  }
  img {
    filter: brightness(0) invert(1);
  }
  .button-style {
    height: 40px;
    width: 40px;
    background: #239eda;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #239eda;
    box-shadow: inset 0px -4px 10px rgb(0 27 121 / 50%),
      inset 0px 4px 11px #63f6ff;
  }
  .notification {
    position: absolute;
    top: -6px;
    left: -5px;
    background: #d13737;
    border: 1px solid white;
    width: 20px;
    height: 20px;
    display: flex;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
}
</style>
