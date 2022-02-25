<template>
  <div>
    <div class="fullscreen-canvas" ref="container"></div>
    <div class="balance">{{ balance }} Ubxs</div>
    <div class="house-info" v-if="show">
      <div class="header">
        <span>Buy House with UBXS</span>
        <span @click="closeModel()">x</span>
      </div>
      <button class="buy-button" @click="buy()">Buy</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import Stats from "stats.js";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { Octree } from "three/examples/jsm/math/Octree.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

export default {
  name: "App",
  setup() {
    const container = ref({});
    const show = ref(false);
    const balance = ref(7000000);
    const closeModel = () => {
      show.value = false;
      document.body.requestPointerLock();
    };
    const buy = () => {
      balance.value = 4000000;
      show.value = false;
      document.body.requestPointerLock();
    };
    onMounted(() => {
      const clock = new THREE.Clock();

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x88ccee);

      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.rotation.order = "YXZ";

      // var geometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2);
      // var material = new THREE.MeshNormalMaterial();
      let avatar;
      // const avatar = new THREE.Mesh(geometry, material);
      // scene.add(avatar);
      // avatar.rotation.order = "YXZ";
      /**
       * Light
       */
      const fillLight1 = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
      fillLight1.position.set(2, 1, 1);
      scene.add(fillLight1);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(-5, 25, -1);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.near = 0.01;
      directionalLight.shadow.camera.far = 500;
      directionalLight.shadow.camera.right = 30;
      camera;
      directionalLight.shadow.camera.left = -30;
      directionalLight.shadow.camera.top = 30;
      directionalLight.shadow.camera.bottom = -30;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.radius = 4;
      directionalLight.shadow.bias = -0.00006;
      scene.add(directionalLight);

      /**
       * Renderer
       */
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.VSMShadowMap;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      container.value.appendChild(renderer.domElement);

      const stats = new Stats();
      stats.domElement.style.position = "absolute";
      stats.domElement.style.top = "0px";
      container.value.appendChild(stats.domElement);

      window.addEventListener("resize", onWindowResize);

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      const loader = new GLTFLoader().setPath("./models/");
      /**
       * Raycaster
       */
      const raycaster = new THREE.Raycaster();
      raycaster.far = 4;

      /**
       * Mouse
       */
      let mixer;
      let animations = {};
      const mouse = new THREE.Vector2();
      let walk;
      let run;
      let idle;
      let dance;
      const loaderFBX = new FBXLoader();
      loaderFBX.setPath("./resources/zombie/");
      loaderFBX.load("mremireh_o_desbiens.fbx", (fbx) => {
        fbx.scale.setScalar(0.01);
        fbx.traverse((c) => {
          c.castShadow = true;
        });

        avatar = fbx;
        avatar.rotation.order = "YXZ";

        scene.add(avatar);

        mixer = new THREE.AnimationMixer(avatar);

        const OnLoad = (animName, anim) => {
          const clip = anim.animations[0];
          const action = mixer.clipAction(clip);

          animations[animName] = {
            clip: clip,
            action: action,
          };
        };

        const animationLoader = new FBXLoader();
        animationLoader.setPath("./resources/zombie/");
        animationLoader.load("walk.fbx", (a) => {
          OnLoad("walk", a);
          walk = mixer.clipAction(animations.walk.clip);
        });
        animationLoader.load("run.fbx", (a) => {
          OnLoad("run", a);
          run = mixer.clipAction(animations.run.clip);
        });
        animationLoader.load("idle.fbx", (a) => {
          OnLoad("idle", a);
          idle = mixer.clipAction(animations.idle.clip);
        });
        animationLoader.load("dance.fbx", (a) => {
          OnLoad("dance", a);
          dance = mixer.clipAction(animations.dance.clip);
        });
        console.log("animations :>> ", animations);
      });

      loader.load("VillageUnity.glb", (gltf) => {
        scene.add(gltf.scene);
        worldOctree.fromGraphNode(scene);
        idle.play();
        animate();
      });

      const GRAVITY = 30;

      const STEPS_PER_FRAME = 5;

      const worldOctree = new Octree();

      const playerCollider = new Capsule(
        new THREE.Vector3(0, 0.35, 0),
        new THREE.Vector3(0, -5, 0),
        0.1
      );

      const playerVelocity = new THREE.Vector3();
      const playerDirection = new THREE.Vector3();
      // playerVelocity.y = 30;
      // camera.rotation.x = -0.44;
      let playerOnFloor = false;

      const keyStates = {};
      let state = "";

      mixer = new THREE.AnimationMixer(avatar);
      document.addEventListener("keydown", (event) => {
        keyStates[event.code] = true;
        if (keyStates["KeyW"]) {
          if (state !== "run") {
            run.time = 0.0;
            run.setEffectiveTimeScale(1.0);
            run.setEffectiveWeight(1.0);
            run.crossFadeFrom(idle, 0.5, true);
            run.play();
            state = "run";
          }
        }
      });

      document.addEventListener("keyup", (event) => {
        keyStates[event.code] = false;
        if (!keyStates["KeyW"]) {
          // idle.timeScale = 500;
          idle.time = 0.0;
          idle.crossFadeFrom(run, 0.1, true);
          idle.play();
          state = "";
        }
      });

      container.value.addEventListener("mousedown", () => {
        document.body.requestPointerLock();
      });

      document.addEventListener("mouseup", () => {
        if (document.pointerLockElement !== null) {
          if (currentIntersect) {
            show.value = true;
            document.exitPointerLock();
          }
        }
      });

      document.body.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement === document.body) {
          avatar.rotation.y -= event.movementX / 500;
          if (
            avatar.rotation.x - event.movementY / 500 > -0.2 &&
            avatar.rotation.x - event.movementY / 500 < 0.2
          )
            avatar.rotation.x -= event.movementY / 500;
        }
      });

      function playerCollisions() {
        const result = worldOctree.capsuleIntersect(playerCollider);

        playerOnFloor = false;

        if (result) {
          playerOnFloor = result.normal.y > 0;

          if (!playerOnFloor) {
            playerVelocity.addScaledVector(
              result.normal,
              -result.normal.dot(playerVelocity)
            );
          }

          playerCollider.translate(result.normal.multiplyScalar(result.depth));
        }
      }

      function updatePlayer(deltaTime) {
        let damping = Math.exp(-4 * deltaTime) - 1;

        if (!playerOnFloor) {
          playerVelocity.y -= GRAVITY * deltaTime;

          // small air resistance
          damping *= 0.1;
        }

        playerVelocity.addScaledVector(playerVelocity, damping);

        const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
        playerCollider.translate(deltaPosition);

        playerCollisions();

        avatar.position.copy(playerCollider.end);
      }

      function getForwardVector() {
        avatar.getWorldDirection(playerDirection);
        playerDirection.y = 0;
        playerDirection.normalize();

        return playerDirection;
      }

      function getSideVector() {
        avatar.getWorldDirection(playerDirection);
        playerDirection.y = 0;
        playerDirection.normalize();
        playerDirection.cross(avatar.up);

        return playerDirection;
      }

      function controls(deltaTime) {
        // gives a bit of air control
        const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

        if (keyStates["KeyW"]) {
          playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
        }

        // if (keyStates["KeyS"]) {
        //   playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
        // }

        // if (keyStates["KeyA"]) {
        //   playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
        // }

        // if (keyStates["KeyD"]) {
        //   playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
        // }
        if (playerOnFloor) {
          if (keyStates["Space"]) {
            playerVelocity.y = 15;
          }
        }
      }

      function teleportPlayerIfOob() {
        if (avatar.position.y <= -25) {
          playerCollider.start.set(0, 0.35, 0);
          playerCollider.end.set(0, 1, 0);
          playerCollider.radius = 0.35;
          avatar.position.copy(playerCollider.end);
          avatar.rotation.set(0, 0, 0);
        }
      }
      let currentIntersect = null;

      function CalculateIdealOffset() {
        const idealOffset = new THREE.Vector3(0, 1.5, -3);
        idealOffset.applyQuaternion(avatar.quaternion);
        idealOffset.add(avatar.position);
        return idealOffset;
      }
      function CalculateIdealLookat() {
        const idealLookat = new THREE.Vector3(0, 0, 5);
        idealLookat.applyQuaternion(avatar.quaternion);
        idealLookat.add(avatar.position);
        return idealLookat;
      }

      function animate() {
        const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          controls(deltaTime);

          updatePlayer(deltaTime);

          teleportPlayerIfOob();
          const currentPosition = new THREE.Vector3();
          const currentLookat = new THREE.Vector3();
          const idealOffset = CalculateIdealOffset();
          const idealLookat = CalculateIdealLookat();
          const t = 1.0 - Math.pow(0.001, clock.getElapsedTime());
          currentPosition.lerp(idealOffset, t);
          currentLookat.lerp(idealLookat, t);

          camera.position.copy(currentPosition);
          camera.lookAt(currentLookat);
        }
        mouse.x = (window.innerWidth / 2 / window.innerWidth) * 2 - 1;
        mouse.y = -(window.innerHeight / 2 / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        if (scene.children[2] && scene.children[2].children[6]) {
          const intersects = raycaster.intersectObjects([
            scene.children[2].children[6],
          ]);
          if (intersects.length) {
            if (!currentIntersect) {
              console.log("mouse enter:>> ");
              scene.children[2].children[6].scale.x = 2;
            }
            currentIntersect = intersects[0];
          } else {
            if (currentIntersect) {
              console.log("mouse leave:>> ");
              scene.children[2].children[6].scale.x = 1;
            }
            currentIntersect = null;
          }
        }

        renderer.render(scene, camera);
        if (mixer) {
          mixer.update(clock.getDelta());
        }
        stats.update();

        requestAnimationFrame(animate);
      }
    });
    return { container, show, closeModel, balance, buy };
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

html,
body {
  overflow: hidden;
}

.fullscreen-canvas {
  position: fixed;
  top: 0;
  left: 0;
  outline: none;
  width: 100%;
}

.house-info {
  position: absolute;
  top: 25vh;
  left: 20vw;
  height: 50vh;
  width: 50vw;
  border-radius: 10px;
  background: gray;

  padding: 30px;
}
.header {
  display: flex;
  justify-content: space-between;
}
.balance {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 150px;
  height: 50px;
  background: gray;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
}
.buy-button {
  width: 150px;
  height: 50px;
  border-radius: 10px;
  font-size: 16px;
}
</style>
