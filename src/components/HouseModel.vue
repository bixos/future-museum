<template>
  <div style="z-index: 99999999999999999" class="house-wraper"></div>
  <div style="z-index: 99999999999999999" class="house-details">
    <img
      @click="onHideModel()"
      src="../assets/icons/Close.svg"
      class="close-icon"
      alt="Close"
    />

    <div class="house-details-container">
      <div class="house-header">
        <img src="../assets/house.png" class="house-img" alt="house" />
        <div style="display: flex">
          <img
            src="../assets/icons/Bixos-light.svg"
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
            <div class="details-value" style="font-weight: 900; color: #239eda">
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
            <div class="details-value" style="font-weight: 900; color: #239eda">
              <p>: {{ house.Owner }}</p>
            </div>
          </div>
        </div>
        <button
          :disabled="house.price > balance"
          @click="onBuyHouse()"
          v-if="!house.sold"
          :class="house.price > balance ? 'disabled-buy-buttom' : ''"
          class="buy-house-button"
        >
          Buy as NFT
        </button>
        <button
          @click="onSellHouse()"
          v-if="house.sold"
          class="sell-house-button"
        >
          Sell as NFT
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  props: ["house"],

  setup(_, { emit }) {
    const activeTab = ref(1);

    const onHideModel = () => {
      emit("onHideModel");
    };
    const onBuyHouse = () => {
      emit("onBuyHouse");
    };
    const onSellHouse = () => {
      emit("onSellHouse");
    };

    return { activeTab, onHideModel, onBuyHouse, onSellHouse };
  },
};
</script>

<style lang="scss" scoped>
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
</style>
