<template>
  <div>
    <div class="chat">
      <div class="chat-container">
        <p
          v-for="message in messages"
          :key="`${message.name}-${Math.random()}`"
          class="message-container"
        >
          <span class="chat-time">[15:31]</span>
          <span class="chat-name"> {{ message.name }}: </span>
          <span class="chat-message">{{ message.msg }}</span>
        </p>
      </div>
      <div class="texting-container">
        <div class="chat-channel"><span>Local</span></div>
        <div class="chat-input">
          <input
            v-on:keyup.enter="sendMessage()"
            v-model="inputMessage"
            type="text"
            @focus="handleTypingState()"
            @blur="handleTypingState()"
            maxlength="100"
          />

          <div>&#128515;</div>
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
export default {
  props: ["socket"],
  setup(props, { emit }) {
    const messages = ref([]);
    const inputMessage = ref("");
    onMounted(() => {
      console.log("props.socket :>> ", props.socket);
      if (props.socket) {
        props.socket.on("chat message", (message) => {
          messages.value.push(message);
          // window.scrollTo(0, document.body.scrollHeight);
        });
      }
    });

    const sendMessage = () => {
      props.socket.emit("chat message", inputMessage.value);
      inputMessage.value = "";
    };
    const handleTypingState = () => {
      emit("handleTypingState");
    };
    return { messages, inputMessage, sendMessage, handleTypingState };
  },
};
</script>

<style lang="scss" scoped>
.chat {
  position: absolute;
  bottom: 20px;
  left: 20px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
  // color: #1d221c;
  color: white;
  max-width: 100vw;
  width: 500px;
  font-size: 14px;
  font-weight: 600;
  .chat-container {
    display: flex;
    flex-direction: column-reverse;
    padding: 20px 20px;
    height: 150px;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      display: none;
    }
    .message-container {
      margin: 0;
      line-height: 1.5;
      margin-bottom: 5px;
      .chat-time {
        color: #60caca;
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
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    border-top: 1px solid white;
    .chat-channel {
      width: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      background: #239eda;
      border-bottom-left-radius: 6px;
    }
    .chat-input {
      display: flex;
      width: 100%;
      input {
        width: 100%;
        background: transparent;
        border: 0;
        width: calc(100% - 40px);
        outline: none;
        // color: #1d221c;
        color: white;
        font-size: 14px;
        padding-left: 10px;
        font-weight: 600;
      }
      div {
        position: absolute;
        right: 10px;
        bottom: 11.5px;
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
