<template>
  <div>
    <div class="chat">
      <div
        v-if="deviceType() !== 'desktop'"
        v-touch:tap="closeChat"
        class="close-chat"
      >
        <span>Close</span>
        <img src="../assets/icons/Arrow.svg" alt="" />
      </div>
      <div ref="chatContainer" class="chat-container">
        <p
          v-for="message in messages"
          :key="`${message.name}-${Math.random()}`"
          class="message-container"
        >
          <span
            class="chat-time"
            :style="playerName === message.name ? '' : 'color:#2A3869'"
            >[15:31]
          </span>
          <span
            class="chat-name"
            :style="playerName === message.name ? '' : 'color:#2A3869'"
            >{{ message.name }}:
          </span>
          <span class="chat-message">{{ message.msg }}</span>
        </p>
      </div>
      <div class="texting-container">
        <div class="chat-channel">
          <span>Room {{ room }}</span>
        </div>
        <div class="chat-input">
          <input
            v-on:keyup.enter="sendMessage()"
            v-model="inputMessage"
            type="text"
            @focus="handleTypingState()"
            @blur="handleTypingState()"
            maxlength="100"
          />
        </div>
      </div>
    </div>

    <!-- <div class="key-helper"> 
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
    <div style="display: flex; flex-direction: column; align-items: center">
      <div style="display: flex; align-items: center; width: 100%">
        <div class="key key-mouse">
          <img src="../assets/icons/Mouse.svg" class="mouse" alt="mouse" />
        </div>
        <span class="right-hint"> Look </span>
      </div>
      <div style="display: flex; align-items: center; width: 100%">
        <div class="key key-mouse">
          <span>R</span>
        </div>
        <span class="right-hint"> Restart </span>
      </div>
      <div style="display: flex; align-items: center; width: 100%">
        <div class="key left-key" style="width: 100%">
          <span>Shift</span>
        </div>
      </div>
      <span class="walk-hint"> Run </span>
    </div>
    </div> -->
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { deviceType } from "../experience/helper";

export default {
  props: ["socket", "room"],
  setup(props, { emit }) {
    const messages = ref([]);
    const inputMessage = ref("");
    const chatContainer = ref("");
    const playerName = ref("Guest");
    playerName.value = localStorage.playerName;
    onMounted(() => {
      console.log("props.socket :>> ", props.socket);
      if (props.socket) {
        props.socket.on("chat message", (message) => {
          messages.value.push(message);
          chatContainer.value.scrollTo(0, chatContainer.value.scrollHeight);
        });
      }
    });

    const sendMessage = () => {
      console.log("props.room :>> ", props.room);
      props.socket.emit("chat message", {
        msg: inputMessage.value,
        room: props.room,
      });
      inputMessage.value = "";
    };
    const handleTypingState = () => {
      emit("handleTypingState");
    };
    const closeChat = () => {
      emit("closeChat");
    };
    return {
      messages,
      inputMessage,
      sendMessage,
      handleTypingState,
      chatContainer,
      playerName,
      closeChat,
      deviceType,
    };
  },
};
</script>
<style lang="scss">
.nipple {
  opacity: 1 !important;
}

.nipple > div.back {
  opacity: 1 !important;
  background: rgb(255, 255, 255, 0.25) !important;
  border: 1px solid white !important;
}

.nipple > div.front {
  background: url("../assets/icons/Controller.svg") !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-size: contain !important;
  opacity: 1 !important;
}
</style>
<style lang="scss" scoped>
.chat {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.25);
  color: white;
  max-width: calc(100vw - 20px);
  width: 500px;
  font-size: 14px;
  backdrop-filter: blur(40px);
  font-weight: 600;
  border: 1px solid #ffffff;
  border-radius: 40px;
  padding-top: 20px;
  @media only screen and (max-width: 1024px) {
    left: 10px;
    right: 10px;
    bottom: 30vh;
  }
  .close-chat {
    position: absolute;
    right: 50px;
    top: 5px;
    span {
      margin-right: 5px;
    }
    img {
      filter: brightness(0) invert(1);
    }
  }
  .chat-container {
    margin: 0px 20px;
    height: 150px;
    overflow-y: scroll;
    @media only screen and (max-width: 1024px) {
      height: 200px;
    }
    /* width */
    &::-webkit-scrollbar {
      width: 11px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.25);
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.75);
    }

    /* Handle on hover */
    &::-webkit-scrollbar-thumb:hover {
      // background: #555;
    }
    .message-container {
      margin: 0;
      line-height: 1.5;
      margin-bottom: 5px;
      .chat-time {
        color: #239eda;
      }
      .chat-name {
        color: #239eda;
      }
      .chat-message {
        word-break: break-all;
      }
    }
  }

  .texting-container {
    height: 40px;
    display: flex;
    justify-content: center;
    padding-bottom: 20px;
    padding-top: 20px;
    .chat-channel {
      width: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      background: #2a3869;
      font-size: 16px;
      border: 1px solid #239eda;
      box-shadow: inset 0px 4px 4px rgb(0 0 0 / 25%);
      border-radius: 40px 0px 0px 40px;
    }
    .chat-input {
      display: flex;
      width: 75%;
      justify-content: center;
      input {
        background: #239eda;
        border: 1px solid #239eda;
        box-shadow: inset 0px 4px 4px rgb(0 0 0 / 25%);
        border-radius: 0px 40px 40px 0px;
        width: 100%;
        outline: none;
        color: white;
        font-size: 14px;
        padding-left: 10px;
        font-weight: 600;
      }
    }
  }
}

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
