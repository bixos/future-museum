<template>
  <div>
    <div class="fullscreen-canvas" id="canvas" ref="container"></div>
    <div class="balance">{{ balance }} Ubxs</div>
    <div class="house-info" v-if="show">
      <div class="header">
        <span>Buy House with UBXS</span>
        <span @click="closeModel()">x</span>
      </div>
      <button class="buy-button" @click="buy()">Buy</button>
    </div>
    <div class="joystick-container" ref="joystick"></div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import Stats from "stats.js";
import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { Octree } from "three/examples/jsm/math/Octree.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import nipplejs from "nipplejs";

export default {
  name: "App",
  setup() {
    const container = ref({});
    const joystick = ref({});
    const show = ref(false);
    const balance = ref(7000000);
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

    const closeModel = () => {
      show.value = false;
      document.body.requestPointerLock();
    };
    const buy = () => {
      balance.value = 4000000;
      show.value = false;
      document.body.requestPointerLock();
    };
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
    onMounted(() => {
      if (deviceType() !== "desktop") {
        var options = {
          zone: joystick.value,
          mode: "static",
          position: {
            left: "50%",
            top: "50%",
          },
        };
        var manager = nipplejs.create(options);
      }

      const clock = new THREE.Clock();

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x88ccee);
      scene.fog = new THREE.Fog(0x88ccee, 0, 50);

      const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.rotation.order = "YXZ";

      const fillLight1 = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
      fillLight1.position.set(2, 1, 1);
      scene.add(fillLight1);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(-5, 25, -1);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.near = 0.01;
      directionalLight.shadow.camera.far = 500;
      directionalLight.shadow.camera.right = 30;
      directionalLight.shadow.camera.left = -30;
      directionalLight.shadow.camera.top = 30;
      directionalLight.shadow.camera.bottom = -30;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.radius = 4;
      directionalLight.shadow.bias = -0.00006;
      scene.add(directionalLight);

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

      const GRAVITY = 30;

      const NUM_SPHERES = 100;
      const SPHERE_RADIUS = 0.2;

      const STEPS_PER_FRAME = 5;

      const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 5);
      const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xbbbb44 });

      const spheres = [];
      let sphereIdx = 0;

      for (let i = 0; i < NUM_SPHERES; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        sphere.receiveShadow = true;

        scene.add(sphere);

        spheres.push({
          mesh: sphere,
          collider: new THREE.Sphere(
            new THREE.Vector3(0, -100, 0),
            SPHERE_RADIUS
          ),
          velocity: new THREE.Vector3(),
        });
      }

      const worldOctree = new Octree();

      const playerCollider = new Capsule(
        new THREE.Vector3(0, 0.35, 0),
        new THREE.Vector3(0, 1, 0),
        0.35
      );

      const playerVelocity = new THREE.Vector3();
      const playerDirection = new THREE.Vector3();

      let playerOnFloor = false;
      let mouseTime = 0;

      let keyStates = {};

      const vector1 = new THREE.Vector3();
      const vector2 = new THREE.Vector3();
      const vector3 = new THREE.Vector3();

      document.addEventListener("keydown", (event) => {
        keyStates[event.code] = true;
      });

      document.addEventListener("keyup", (event) => {
        keyStates[event.code] = false;
      });

      container.value.addEventListener("mousedown", () => {
        if (deviceType() === "desktop") {
          document.body.requestPointerLock();
        }
        mouseTime = performance.now();
      });

      document.addEventListener("mouseup", () => {
        if (document.pointerLockElement !== null) throwBall();
      });

      document.body.addEventListener("mousemove", (event) => {
        if (document.pointerLockElement === document.body) {
          camera.rotation.y -= event.movementX / 500;

          if (
            camera.rotation.x - event.movementY / 500 > -1.5 &&
            camera.rotation.x - event.movementY / 500 < 1.5
          )
            camera.rotation.x -= event.movementY / 500;
        }
      });
      let previousTouch;

      if (deviceType !== "desktop") {
        let currentTouches = new Array();
        const findCurrentTouchIndex = (id) => {
          for (let i = 0; i < currentTouches.length; i++) {
            if (currentTouches[i].id === id) {
              return i;
            }
          }

          // Touch not found! Return -1.
          return -1;
        };
        var canvas = document.getElementById("canvas");
        canvas.addEventListener("touchmove", (event) => {
          console.log("event :>> ", event);
          let isCavanMove = false;
          for (let index = 0; index < event.touches.length; index++) {
            const element = event.touches[index];
            if (element.target.nodeName == "CANVAS") {
              isCavanMove = element;
            }
          }
          if (isCavanMove || event.touches.length === 2) {
            const touch = event.touches[0];
            console.log("isCavanMove.movementX :>> ", isCavanMove.movementX);
            if (previousTouch) {
              isCavanMove.movementX = touch.pageX - previousTouch.pageX;
              isCavanMove.movementY = touch.pageY - previousTouch.pageY;

              camera.rotation.y -= isCavanMove.movementX / 500;
              if (
                camera.rotation.x - isCavanMove.movementY / 500 > -1.5 &&
                camera.rotation.x - isCavanMove.movementY / 500 < 1.5
              )
                camera.rotation.x -= isCavanMove.movementY / 500;
            }
            previousTouch = isCavanMove;
          }
        });
        document.body.addEventListener("touchend", (e) => {
          previousTouch = null;
        });
      }
      window.addEventListener("resize", onWindowResize);

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      function throwBall() {
        const sphere = spheres[sphereIdx];

        camera.getWorldDirection(playerDirection);

        sphere.collider.center
          .copy(playerCollider.end)
          .addScaledVector(playerDirection, playerCollider.radius * 1.5);

        // throw the ball with more force if we hold the button longer, and if we move forward

        const impulse =
          15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001));

        sphere.velocity.copy(playerDirection).multiplyScalar(impulse);
        sphere.velocity.addScaledVector(playerVelocity, 2);

        sphereIdx = (sphereIdx + 1) % spheres.length;
      }

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

        camera.position.copy(playerCollider.end);
      }

      function playerSphereCollision(sphere) {
        const center = vector1
          .addVectors(playerCollider.start, playerCollider.end)
          .multiplyScalar(0.5);

        const sphere_center = sphere.collider.center;

        const r = playerCollider.radius + sphere.collider.radius;
        const r2 = r * r;

        // approximation: player = 3 spheres

        for (const point of [
          playerCollider.start,
          playerCollider.end,
          center,
        ]) {
          const d2 = point.distanceToSquared(sphere_center);

          if (d2 < r2) {
            const normal = vector1.subVectors(point, sphere_center).normalize();
            const v1 = vector2
              .copy(normal)
              .multiplyScalar(normal.dot(playerVelocity));
            const v2 = vector3
              .copy(normal)
              .multiplyScalar(normal.dot(sphere.velocity));

            playerVelocity.add(v2).sub(v1);
            sphere.velocity.add(v1).sub(v2);

            const d = (r - Math.sqrt(d2)) / 2;
            sphere_center.addScaledVector(normal, -d);
          }
        }
      }

      function spheresCollisions() {
        for (let i = 0, length = spheres.length; i < length; i++) {
          const s1 = spheres[i];

          for (let j = i + 1; j < length; j++) {
            const s2 = spheres[j];

            const d2 = s1.collider.center.distanceToSquared(s2.collider.center);
            const r = s1.collider.radius + s2.collider.radius;
            const r2 = r * r;

            if (d2 < r2) {
              const normal = vector1
                .subVectors(s1.collider.center, s2.collider.center)
                .normalize();
              const v1 = vector2
                .copy(normal)
                .multiplyScalar(normal.dot(s1.velocity));
              const v2 = vector3
                .copy(normal)
                .multiplyScalar(normal.dot(s2.velocity));

              s1.velocity.add(v2).sub(v1);
              s2.velocity.add(v1).sub(v2);

              const d = (r - Math.sqrt(d2)) / 2;

              s1.collider.center.addScaledVector(normal, d);
              s2.collider.center.addScaledVector(normal, -d);
            }
          }
        }
      }

      function updateSpheres(deltaTime) {
        spheres.forEach((sphere) => {
          sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);

          const result = worldOctree.sphereIntersect(sphere.collider);

          if (result) {
            sphere.velocity.addScaledVector(
              result.normal,
              -result.normal.dot(sphere.velocity) * 1.5
            );
            sphere.collider.center.add(
              result.normal.multiplyScalar(result.depth)
            );
          } else {
            sphere.velocity.y -= GRAVITY * deltaTime;
          }

          const damping = Math.exp(-1.5 * deltaTime) - 1;
          sphere.velocity.addScaledVector(sphere.velocity, damping);

          playerSphereCollision(sphere);
        });

        spheresCollisions();

        for (const sphere of spheres) {
          sphere.mesh.position.copy(sphere.collider.center);
        }
      }

      function getForwardVector() {
        camera.getWorldDirection(playerDirection);
        playerDirection.y = 0;
        playerDirection.normalize();

        return playerDirection;
      }

      function getSideVector() {
        camera.getWorldDirection(playerDirection);
        playerDirection.y = 0;
        playerDirection.normalize();
        playerDirection.cross(camera.up);

        return playerDirection;
      }

      let speedAngle = { up: 1, down: 1, left: 1, right: 1 };
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
      function controls(deltaTime) {
        // gives a bit of air control
        const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

        if (keyStates["KeyW"]) {
          playerVelocity.add(
            getForwardVector().multiplyScalar(speedDelta * speedAngle.up)
          );
        }

        if (keyStates["KeyS"]) {
          playerVelocity.add(
            getForwardVector().multiplyScalar(-speedDelta * speedAngle.down)
          );
        }

        if (keyStates["KeyA"]) {
          playerVelocity.add(
            getSideVector().multiplyScalar(-speedDelta * speedAngle.left)
          );
        }

        if (keyStates["KeyD"]) {
          playerVelocity.add(
            getSideVector().multiplyScalar(speedDelta * speedAngle.right)
          );
        }

        if (playerOnFloor) {
          if (keyStates["Space"]) {
            playerVelocity.y = 15;
          }
        }
      }

      const loader = new GLTFLoader().setPath("./models/");

      loader.load("VillageUnity.glb", (gltf) => {
        scene.add(gltf.scene);

        worldOctree.fromGraphNode(gltf.scene);

        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material.map) {
              child.material.map.anisotropy = 4;
            }
          }
        });

        animate();
      });

      function teleportPlayerIfOob() {
        if (camera.position.y <= -25) {
          playerCollider.start.set(0, 0.35, 0);
          playerCollider.end.set(0, 1, 0);
          playerCollider.radius = 0.35;
          camera.position.copy(playerCollider.end);
          camera.rotation.set(0, 0, 0);
        }
      }

      function animate() {
        const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

        // we look for collisions in substeps to mitigate the risk of
        // an object traversing another too quickly for detection.

        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          controls(deltaTime);

          updatePlayer(deltaTime);

          updateSpheres(deltaTime);

          teleportPlayerIfOob();
        }

        renderer.render(scene, camera);

        stats.update();

        requestAnimationFrame(animate);
      }
    });
    return { container, joystick, show, closeModel, balance, buy };
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
.joystick-container {
  position: absolute;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  top: 80%;
  width: 100px;
  height: 100px;
}
</style>
