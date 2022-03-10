<template>
  <div v-if="deviceType() === 'desktop'" class="key-helper">
    <div style="display: flex; flex-direction: column; align-items: center">
      <div class="key">
        <span>W</span>
        <img
          style="transform: rotate(180deg)"
          src="../assets/icons/Arrow.svg"
          class="arrow"
          alt="arrow"
        />
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
      <span class="walk-hint"> Walk </span>
    </div>
    <div>
      <div style="display: flex; align-items: center">
        <div class="key key-mouse">
          <img src="../assets/icons/Mouse.svg" class="mouse" alt="mouse" />
        </div>
        <span class="right-hint"> Look </span>
      </div>
      <div style="display: flex; align-items: center">
        <div class="key key-mouse">
          <span>R</span>
        </div>
        <span class="right-hint"> Restart </span>
      </div>
      <div style="display: flex; align-items: center">
        <div class="key left-key">
          <span>Shift</span>
        </div>
        <span class="right-hint"> Walk </span>
      </div>
    </div>
  </div>
</template>

<script>
import { deviceType } from "../experience/helper";

export default {
  setup() {
    return { deviceType };
  },
};
</script>

<style lang="scss" scoped>
.key-helper {
  position: absolute;
  left: 40px;
  bottom: 50px;
  display: flex;
  align-items: flex-end;
  .walk-hint {
    position: absolute;
    bottom: -30px;
    font-size: 20px;
    font-style: normal;
    font-weight: normal;
    color: #ffffff;
  }
  .right-hint {
    margin-left: 20px;
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    color: #ffffff;
  }
}
.bottom-keys {
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 50px;
  width: 100%;
}

.key {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  margin: 5px;
  color: #0ca6d7;
  font-weight: bold;
  font-size: 20px;
  line-height: 20px;
  background: #ffffff;
  font-weight: bold;
}
.left-key {
  width: 100px;
}
.key-mouse {
  margin-left: 30px;
  .mouse {
    height: 19.11px;
    width: 24.93px;
  }
}
</style>
