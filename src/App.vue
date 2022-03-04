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
    <div v-if="deviceType() === 'desktop'" class="key-helper">
      <div style="display: flex; flex-direction: column; align-items: center">
        <div class="key">
          <span>W</span>
          <img
            style="transform: rotate(180deg)"
            src="./assets/icons/Arrow.svg"
            class="arrow"
            alt="arrow"
          />
        </div>
        <div class="bottom-keys">
          <div class="key">
            <span>A</span>
            <img
              src="./assets/icons/Arrow.svg"
              style="transform: rotate(90deg)"
              class="arrow"
              alt="arrow"
            />
          </div>
          <div class="key">
            <span>S</span>
            <img src="./assets/icons/Arrow.svg" class="arrow" alt="arrow" />
          </div>
          <div class="key">
            <span>D</span>
            <img
              src="./assets/icons/Arrow.svg"
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
            <img src="./assets/icons/Mouse.svg" class="mouse" alt="mouse" />
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
          <span class="right-hint"> Run </span>
        </div>
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
      @click="reset()"
      v-if="deviceType() !== 'desktop'"
      class="reset-button"
    >
      <span>Reset</span>
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted } from "vue";
import * as THREE from "three";
import { gsap } from "gsap";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
  // CENTER,
  // SAH,
  // AVERAGE,
  MeshBVH,
} from "three-mesh-bvh";
// import Stats from "stats.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import nipplejs from "nipplejs";
import housesData from "./houses.js";
import Drawer from "./components/Drawer.vue";
import Telegram from "./assets/icons/Telegram.svg";
import BixosLight from "./assets/icons/Bixos-light.svg";
import Discord from "./assets/icons/Discord.svg";
import Twitter from "./assets/icons/Twitter.svg";
import LinkedIn from "./assets/icons/LinkedIn.svg";
import Instagram from "./assets/icons/Instagram.svg";

export default defineComponent({
  name: "App",
  components: { Drawer },

  setup() {
    /**
     * rayVariables
     */
    THREE.Mesh.prototype.raycast = acceleratedRaycast;
    THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
    THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
    let mixer = null;
    const container = ref({});
    const joystick = ref({});
    const loadingBarElement = ref({});
    const overlayElement = ref({});
    const loading = ref(true);
    const houseDetails = ref(false);
    const house = ref({});
    const balance = ref(1000000);
    const interactHint = ref(false);
    const celebrate = ref(false);
    const activeTab = ref(1);
    const run = ref(false);
    const hitSound = new Audio(require("./assets/AudioBuy.mp3"));

    const buyHouse = () => {
      var material2 = currentIntersect.children[1].material.clone();
      material2.color = new THREE.Color(0xff0000);
      currentIntersect.children[1].material = material2;
      const number = currentIntersect.name.replace(/^\D+/g, "");
      const sign = signs.find((sign) => {
        const signNumber = sign.name.replace(/^\D+/g, "");
        return number === signNumber;
      });
      signToFlip = sign;

      house.value.sold = true;
      house.value.Owner = "You";
      houseDetails.value = false;
      balance.value -= house.value.price;
      currentIntersect.userData.house = house.value;
      celebrate.value = true;
      hitSound.currentTime = 0;
      hitSound.volume = 1;
      hitSound.play();
      setTimeout(() => {
        celebrate.value = false;
      }, 3000);
    };
    const sellHouse = () => {
      var material2 = currentIntersect.children[1].material.clone();
      material2.color = new THREE.Color(0x1edaff);
      currentIntersect.children[1].material = material2;
      const number = currentIntersect.name.replace(/^\D+/g, "");

      const sign = signs.find((sign) => {
        const signNumber = sign.name.replace(/^\D+/g, "");
        return number === signNumber;
      });
      signToFlip = sign;
      house.value.sold = false;
      house.value.Owner = "Bixos Inc";
      houseDetails.value = false;
      balance.value += house.value.price;
      currentIntersect.userData.house = house.value;
      celebrate.value = true;
      hitSound.currentTime = 0;
      hitSound.volume = 1;
      hitSound.play();
      setTimeout(() => {
        celebrate.value = false;
      }, 3000);
    };

    const params = {
      firstPerson: true,

      displayCollider: false,
      displayBVH: false,
      visualizeDepth: 50,
      gravity: -30,
      playerSpeed: 10,
      physicsSteps: 5,

      reset: reset,
      // Ray Params
      raycasters: {
        count: 150,
      },
    };

    let renderer, camera, scene, clock, gui, stats;
    let environment, collider, player, controls;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let currentIntersect = null;
    let prevIntersect = null;
    const houses = [];
    const buyArea = [];
    const signs = [];
    let signToFlip = {};

    window.addEventListener("mousemove", (_event) => {
      mouse.x = (_event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(_event.clientY / window.innerHeight) * 2 + 1;
    });

    // window.addEventListener("click", (_event) => {
    //   if (currentIntersect) {
    //     console.log("clic :>> ");
    //   }
    // });
    let playerIsOnGround = false;
    let fwdPressed = false,
      bkdPressed = false,
      lftPressed = false,
      rgtPressed = false;
    let playerVelocity = new THREE.Vector3();
    let upVector = new THREE.Vector3(0, 1, 0);
    let tempVector = new THREE.Vector3();
    let tempVector2 = new THREE.Vector3();
    let tempBox = new THREE.Box3();
    let tempMat = new THREE.Matrix4();
    let tempSegment = new THREE.Line3();

    const loadingManager = new THREE.LoadingManager(
      () => {
        overlayElement.value.classList.add("ended");
        camera.position.add(player.position);
        controls.update();
        gsap
          .timeline({
            paused: false,
            defaults: { duration: 3 },
          })
          .to(".overlay", { opacity: 0 })
          .then(() => {
            loading.value = false;
          });
        // loadingBarElement.value.style.transform = "";
      },
      (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal;
        loadingBarElement.value.style.transform = `scaleX(${progressRatio})`;
        // console.log(itemsTotal, "/", itemsLoaded);
      },
      () => {
        console.log("error");
      }
    );

    const dracoLoader = new DRACOLoader(loadingManager);
    dracoLoader.setDecoderPath("/draco/");

    const gltfLoader = new GLTFLoader(loadingManager);
    gltfLoader.setDRACOLoader(dracoLoader);

    const deviceType = () => {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
      } else if (
        /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
          ua
        )
      ) {
        return "mobile";
      }
      return "desktop";
    };

    let keyStates = {};
    let speedAngle = { up: 1, down: 1, left: 1, right: 1 };
    onMounted(() => {
      if (deviceType() !== "desktop") {
        var options = {
          zone: joystick.value,
          mode: "static",
          color: "#239eda",
          position: {
            left: "50%",
            top: "50%",
          },
        };
        var manager = nipplejs.create(options);
      }
      const angles = {
        up: "KeyW",
        down: "KeyS",
        right: "KeyD",
        left: "KeyA",
      };
      const anglesRadian = {
        right: 0,
        up: 1.5,
        left: 3,
        down: 4.5,
      };
      if (deviceType() !== "desktop") {
        speedAngle = { up: 1.5, down: 4.5, left: 3, right: 0 };
        manager.on("move", function (evt, data) {
          keyStates = {};
          if (data.direction && data.direction.x && data.direction.y) {
            keyStates[angles[data.direction.x]] = true;
            keyStates[angles[data.direction.y]] = true;
            const radian = data.angle.radian;
            if (data.direction.x === "right" && data.direction.y === "down") {
              speedAngle[data.direction.x] = Math.abs(
                anglesRadian[data.direction.y] - radian
              );
              speedAngle[data.direction.y] =
                Math.abs(anglesRadian[data.direction.x] - radian) - 4.5;
            } else {
              speedAngle[data.direction.x] = Math.abs(
                anglesRadian[data.direction.y] - radian
              );
              speedAngle[data.direction.y] = Math.abs(
                anglesRadian[data.direction.x] - radian
              );
            }
          }
        });
        manager.on("end", function (evt, data) {
          keyStates = {};
          speedAngle = { up: 1.5, down: 1.5, left: 1.5, right: 1.5 };
        });
      }
    });

    init();

    render();

    loadColliderEnvironment();

    function init() {
      const bgColor = 0x00d4ff;

      // renderer setup
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
        alpha: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      // renderer.setClearColor(bgColor, 1);
      renderer.outputEncoding = THREE.sRGBEncoding;
      document.body.appendChild(renderer.domElement);

      // scene setup
      scene = new THREE.Scene();
      // scene.fog = new THREE.Fog(bgColor, 70, 200);

      // lights
      const light = new THREE.DirectionalLight(0xfdfbd3, 1);
      light.position.set(0, 20, 0);

      scene.add(light);
      // const helper = new THREE.DirectionalLightHelper(light, 5);
      // scene.add(helper);

      const pointLight = new THREE.PointLight(0xffffff, 0.4, 20);
      pointLight.position.set(0, 10, -170);
      scene.add(pointLight);

      // const sphereSize = 1;
      // const pointLightHelper = new THREE.PointLightHelper(
      //   pointLight,
      //   sphereSize
      // );
      // scene.add(pointLightHelper);

      const envlight = new THREE.HemisphereLight(0xffffff, bgColor, 1);
      scene.add(envlight);
      // camera setup
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        50
      );

      camera.far = 400;
      camera.updateProjectionMatrix();
      window.camera = camera;

      clock = new THREE.Clock();

      controls = new OrbitControls(camera, renderer.domElement);

      // stats setup
      // stats = new Stats();
      // document.body.appendChild(stats.dom);

      window.addEventListener(
        "resize",
        function () {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();

          renderer.setSize(window.innerWidth, window.innerHeight);
        },
        false
      );
    }

    function loadColliderEnvironment() {
      gltfLoader.load("/models/palmmap.glb", (res) => {
        // character
        player = new THREE.Mesh(
          new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5),
          new THREE.MeshStandardMaterial()
        );
        player.geometry.translate(0, -0.5, 0);
        player.capsuleInfo = {
          radius: 0.5,
          segment: new THREE.Line3(
            new THREE.Vector3(),
            new THREE.Vector3(0, -1.0, 0.0)
          ),
        };
        scene.add(player);
        player.position.set(0, 100, 120);

        // map
        const gltfScene = res.scene;
        gltfScene.scale.setScalar(20);
        mixer = new THREE.AnimationMixer(gltfScene);
        for (let index = 0; index < res.animations.length; index++) {
          let animationName = res.animations[index].name;
          if (
            animationName.indexOf("buy") === -1 &&
            animationName.indexOf("circle") === -1 &&
            animationName.indexOf("circle") === -1
          ) {
            const anim = mixer.clipAction(res.animations[index]);
            anim.timeScale *= 15;
            anim.play();
          }
        }

        const toMerge = {};
        gltfScene.traverse((c) => {
          if (c.name.indexOf("HOUSE") !== -1) {
            houses.push(c);
          }
          if (c.name.indexOf("area") !== -1) {
            c.userData.house = housesData[buyArea.length];
            buyArea.push(c);
          }
          if (c.name.indexOf("Sign") !== -1) {
            signs.push(c);
          }
        });
        const geometries = [];
        gltfScene.updateMatrixWorld(true);
        gltfScene.traverse((c) => {
          if (
            c.name.indexOf("ocean") !== -1 ||
            c.name.indexOf("area") !== -1 ||
            (c.parent && c.parent.name.indexOf("area") !== -1) ||
            c.name.indexOf("token") !== -1 ||
            (c.parent && c.parent.name.indexOf("token") !== -1)
          ) {
            return;
          } else if (c.geometry && c.name !== "cloud") {
            const cloned = c.geometry.clone();
            cloned.applyMatrix4(c.matrixWorld);
            for (const key in cloned.attributes) {
              if (key !== "position") {
                cloned.deleteAttribute(key);
              }
            }

            geometries.push(cloned);
          }
        });

        // create the merged geometry
        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
          geometries,
          false
        );
        mergedGeometry.boundsTree = new MeshBVH(mergedGeometry, {
          lazyGeneration: true,
        });

        collider = new THREE.Mesh(mergedGeometry);
        // collider.material.wireframe = true;
        // collider.material.opacity = 0.5;
        // collider.material.transparent = true;

        // scene.add(collider);
        scene.add(gltfScene);
      });

      // dat.gui
      // gui = new GUI();
      // gui.add(params, "firstPerson").onChange((v) => {
      //   if (!v) {
      //     camera.position
      //       .sub(controls.target)
      //       .normalize()
      //       .multiplyScalar(10)
      //       .add(controls.target);
      //   }
      // });

      // const physicsFolder = gui.addFolder("Player");
      // physicsFolder.add(params, "physicsSteps", 0, 30, 1);
      // physicsFolder.add(params, "gravity", -100, 100, 0.01).onChange((v) => {
      //   params.gravity = parseFloat(v);
      // });
      // physicsFolder.add(params, "playerSpeed", 1, 20);
      // physicsFolder.open();

      // gui.add(params, "reset");
      // gui.open();

      window.addEventListener("keydown", function (e) {
        switch (e.code) {
          case "KeyW":
            fwdPressed = true;
            break;
          case "KeyS":
            bkdPressed = true;
            break;
          case "KeyD":
            rgtPressed = true;
            break;
          case "KeyA":
            lftPressed = true;
            break;
          case "ShiftLeft":
            run.value = true;
            break;
          case "Space":
            if (playerIsOnGround) {
              playerVelocity.y = 10.0;
            }
            break;
        }
      });

      window.addEventListener("keyup", function (e) {
        switch (e.code) {
          case "KeyW":
            fwdPressed = false;
            break;
          case "KeyS":
            bkdPressed = false;
            break;
          case "KeyD":
            rgtPressed = false;
            break;
          case "KeyA":
            lftPressed = false;
            break;
          case "ShiftLeft":
            run.value = false;
            break;
          case "Enter":
            interact();
            break;
          case "KeyR":
            reset();
            break;
        }
      });
    }

    function interact() {
      if (currentIntersect && currentIntersect.name.indexOf("area") !== -1) {
        house.value = currentIntersect.userData.house;
        houseDetails.value = true;
      }
    }

    function reset() {
      playerVelocity.set(0, 0, 0);
      player.position.set(0, 100, 120);
      // camera.position.sub(controls.target);
      // controls.target.copy(player.position);
      camera.position.add(player.position);
      controls.update();
    }

    function updatePlayer(delta) {
      playerVelocity.y += playerIsOnGround ? 0 : delta * params.gravity;
      player.position.addScaledVector(playerVelocity, delta);

      // move the player
      if (deviceType() !== "desktop") {
        const angle = controls.getAzimuthalAngle();
        if (keyStates.KeyW) {
          tempVector.set(0, 0, -1).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            (params.playerSpeed * delta * speedAngle.up) / 2
          );
        }

        if (keyStates.KeyS) {
          tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            (params.playerSpeed * delta * speedAngle.down) / 2
          );
        }

        if (keyStates.KeyA) {
          tempVector.set(-1, 0, 0).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            (params.playerSpeed * delta * speedAngle.left) / 2
          );
        }

        if (keyStates.KeyD) {
          tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            (params.playerSpeed * delta * speedAngle.right) / 2
          );
        }
      } else {
        let speedMultiplier = 1;
        if (run.value) {
          speedMultiplier = 2.5;
        }
        const angle = controls.getAzimuthalAngle();
        if (fwdPressed) {
          tempVector.set(0, 0, -1).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta * speedMultiplier
          );
        }

        if (bkdPressed) {
          tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta * speedMultiplier
          );
        }

        if (lftPressed) {
          tempVector.set(-1, 0, 0).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta * speedMultiplier
          );
        }

        if (rgtPressed) {
          tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta * speedMultiplier
          );
        }
      }
      player.updateMatrixWorld();

      // adjust player position based on collisions
      const capsuleInfo = player.capsuleInfo;
      tempBox.makeEmpty();
      tempMat.copy(collider.matrixWorld).invert();
      tempSegment.copy(capsuleInfo.segment);

      // get the position of the capsule in the local space of the collider
      tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);
      tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);

      // get the axis aligned bounding box of the capsule
      tempBox.expandByPoint(tempSegment.start);
      tempBox.expandByPoint(tempSegment.end);

      tempBox.min.addScalar(-capsuleInfo.radius);
      tempBox.max.addScalar(capsuleInfo.radius);

      collider.geometry.boundsTree.shapecast({
        intersectsBounds: (box) => box.intersectsBox(tempBox),

        intersectsTriangle: (tri) => {
          // check if the triangle is intersecting the capsule and adjust the
          // capsule position if it is.
          const triPoint = tempVector;
          const capsulePoint = tempVector2;

          const distance = tri.closestPointToSegment(
            tempSegment,
            triPoint,
            capsulePoint
          );
          if (distance < capsuleInfo.radius) {
            const depth = capsuleInfo.radius - distance;
            const direction = capsulePoint.sub(triPoint).normalize();

            tempSegment.start.addScaledVector(direction, depth);
            tempSegment.end.addScaledVector(direction, depth);
          }
        },
      });

      // get the adjusted position of the capsule collider in world space after checking
      // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
      // the origin of the player model.
      const newPosition = tempVector;
      newPosition.copy(tempSegment.start).applyMatrix4(collider.matrixWorld);

      // check how much the collider was moved
      const deltaVector = tempVector2;
      deltaVector.subVectors(newPosition, player.position);

      // if the player was primarily adjusted vertically we assume it's on something we should consider ground
      playerIsOnGround =
        deltaVector.y > Math.abs(delta * playerVelocity.y * 0.25);

      const offset = Math.max(0.0, deltaVector.length() - 1e-5);
      deltaVector.normalize().multiplyScalar(offset);

      // adjust the player model
      player.position.add(deltaVector);
      if (!playerIsOnGround) {
        deltaVector.normalize();
        playerVelocity.addScaledVector(
          deltaVector,
          -deltaVector.dot(playerVelocity)
        );
      } else {
        playerVelocity.set(0, 0, 0);
      }

      // adjust the camera

      camera.position.sub(controls.target);
      controls.target.copy(player.position);
      camera.position.add(player.position);

      // if the player has fallen too far below the level reset their position to the start
      if (player.position.y < -25) {
        reset();
      }
    }
    let up = true;
    function render() {
      // stats.update();
      requestAnimationFrame(render);

      const delta = Math.min(clock.getDelta(), 0.1);
      if (params.firstPerson) {
        controls.maxPolarAngle = Math.PI;
        controls.minDistance = 1e-4;
        controls.maxDistance = 1e-4;
      } else {
        controls.maxPolarAngle = Math.PI / 2;
        controls.minDistance = 1;
        controls.maxDistance = 20;
      }

      if (collider && houseDetails.value === false) {
        const physicsSteps = params.physicsSteps;

        for (let i = 0; i < physicsSteps; i++) {
          updatePlayer(delta / physicsSteps);
        }
      }

      // TODO: limit the camera movement based on the collider
      // raycast in direction of camera and move it if it's further than the closest point

      if (player) {
        let DOWN_DIRECTION = new THREE.Vector3(0, -1, 0);
        raycaster.set(
          new THREE.Vector3(
            player.position.x,
            player.position.y,
            player.position.z
          ),
          DOWN_DIRECTION
        );
      }
      // const objectsToTest = [object1, object2, object3];
      const intersects = raycaster.intersectObjects(buyArea);
      if (
        currentIntersect &&
        !houseDetails.value &&
        currentIntersect.name.indexOf("area") !== -1
      ) {
        interactHint.value = true;
      } else {
        interactHint.value = false;
      }
      if (intersects.length) {
        if (!currentIntersect) {
          currentIntersect = intersects[0].object.parent;
        }
        currentIntersect = intersects[0].object.parent;
        if (currentIntersect.name.indexOf("area") !== -1) {
          currentIntersect.children[3].rotation.y += 0.05;
          if (currentIntersect.children[2].position.y < 5) {
            currentIntersect.children[2].position.y += 0.2;
            currentIntersect.children[3].position.y += 0.125;
          } else {
            if (up) {
              if (currentIntersect.children[2].position.y > 5.4) up = false;
              else currentIntersect.children[2].position.y += 0.01;
            } else {
              if (currentIntersect.children[2].position.y < 5.2) up = true;
              else currentIntersect.children[2].position.y -= 0.01;
            }
          }
        }
      } else {
        if (currentIntersect) {
          prevIntersect = currentIntersect;
        }
        currentIntersect = null;
      }
      if (prevIntersect && prevIntersect.name.indexOf("area") !== -1) {
        if (prevIntersect.children[2].position.y > 0) {
          prevIntersect.children[2].position.y -= 0.4;
          prevIntersect.children[3].position.y -= 0.25;
        } else prevIntersect = null;
      }
      // Update mixer
      if (mixer) {
        mixer.update(clock.getDelta());
      }
      if (signToFlip && signToFlip.rotation) {
        signToFlip.rotation.y -= Math.PI;
        signToFlip = {};
      }
      // controls.update();
      renderer.render(scene, camera);
    }
    return {
      container,
      joystick,
      loading,
      loadingBarElement,
      overlayElement,
      houseDetails,
      house,
      interactHint,
      celebrate,
      balance,
      buyHouse,
      sellHouse,
      deviceType,
      interact,
      reset,
      activeTab,
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
    top: 20vh;
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
    bottom: 30vh;
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
  top: 50%;

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
