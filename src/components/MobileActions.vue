<template>
  <div>
    <div
      v-touch:tap="onRun"
      v-if="deviceType() !== 'desktop'"
      class="main-button"
    >
      <img src="../assets/icons/Running.svg" v-if="running" alt="enter" />
      <img src="../assets/icons/Walking.svg" v-else alt="enter" />
    </div>
    <div
      v-touch:tap="onInteract"
      v-if="interactHint && deviceType() !== 'desktop'"
      style="bottom: 110px; right: 20px"
      class="action-button"
    >
      <span>Buy</span>
    </div>
    <div
      v-touch:tap="onJump"
      v-if="deviceType() !== 'desktop'"
      style="bottom: 90px; right: 70px"
      class="action-button"
    >
      <img style="height: 25px" src="../assets/icons/Jump.svg" alt="enter" />
    </div>
    <div
      v-touch:tap="onReset"
      v-if="deviceType() !== 'desktop'"
      class="action-button"
    >
      <img src="../assets/icons/Reset.svg" alt="enter" />
    </div>
  </div>
</template>

<script>
import { deviceType } from "../experience/helper";
import { ref } from "vue";

export default {
  props: ["interactHint"],
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
      running.value = !running.value;
    };

    return { deviceType, onReset, onInteract, onRun, onJump, running };
  },
};
</script>

<style lang="scss" scoped>
.main-button {
  height: 60px;
  width: 60px;
  border-radius: 50%;
  position: absolute;
  bottom: 40px;
  right: 20px;
  background: linear-gradient(135deg, #ffffff 25%, #cacaca 86.25%);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    filter: invert(52%) sepia(40%) saturate(945%) hue-rotate(148deg)
      brightness(94%) contrast(100%);
  }
}
.action-button {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  position: absolute;
  bottom: 40px;
  right: 90px;
  background: linear-gradient(135deg, #ffffff 25%, #cacaca 86.25%);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #239eda;

  font-size: 14px;
  font-weight: bold;
  img {
    filter: invert(52%) sepia(40%) saturate(945%) hue-rotate(148deg)
      brightness(94%) contrast(100%);
  }
}
</style>
