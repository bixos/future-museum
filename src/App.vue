<template>
  <div>
    <div class="joystick-container" ref="joystick"></div>
    <div v-if="loading" class="overlay">
      <div class="loading-bar" ref="loadingBarElement"></div>
    </div>
    <div v-if="contactUs" @click="contactUs = false" class="contact-us">
      contact us
    </div>
    <div v-if="interactHint" class="interact-hint">Interact Hint</div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as THREE from "three";
import { gsap } from "gsap";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
  CENTER,
  SAH,
  AVERAGE,
  MeshBVH,
} from "three-mesh-bvh";
import Stats from "stats.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import nipplejs from "nipplejs";

export default {
  name: "App",
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
    const loading = ref(true);
    const contactUs = ref(false);
    const interactHint = ref(false);

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

    window.addEventListener("mousemove", (_event) => {
      mouse.x = (_event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(_event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener("click", (_event) => {
      if (currentIntersect) {
        console.log("clic :>> ");
      }
    });
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
        gsap
          .timeline({
            paused: false,
            defaults: { duration: 3 },
          })
          .to(".overlay", { opacity: 0 })
          .then(() => {
            loading.value = false;
          });
        loadingBarElement.value.classList.add("ended");
        loadingBarElement.value.style.transform = "";
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
          color: "red",
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
      const bgColor = 0x87cefa;

      // renderer setup
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(bgColor, 1);
      renderer.outputEncoding = THREE.sRGBEncoding;
      document.body.appendChild(renderer.domElement);

      // scene setup
      scene = new THREE.Scene();
      // scene.fog = new THREE.Fog(bgColor, 20, 70);

      // lights
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, 2, -2).multiplyScalar(100);
      light.castShadow = true;

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

      const envlight = new THREE.HemisphereLight(0xffffff, bgColor, 0.4);
      scene.add(envlight);
      // camera setup
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        50
      );

      camera.far = 500;
      camera.updateProjectionMatrix();
      window.camera = camera;

      clock = new THREE.Clock();

      controls = new OrbitControls(camera, renderer.domElement);

      // stats setup
      stats = new Stats();
      document.body.appendChild(stats.dom);

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
        player.position.set(0, 100, -150);

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
            buyArea.push(c);
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
            console.log("c :>> ", c);
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
        collider.material.wireframe = true;
        collider.material.opacity = 0.5;
        collider.material.transparent = true;

        scene.add(collider);
        scene.add(gltfScene);
      });

      // dat.gui
      gui = new GUI();
      gui.add(params, "firstPerson").onChange((v) => {
        if (!v) {
          camera.position
            .sub(controls.target)
            .normalize()
            .multiplyScalar(10)
            .add(controls.target);
        }
      });

      const physicsFolder = gui.addFolder("Player");
      physicsFolder.add(params, "physicsSteps", 0, 30, 1);
      physicsFolder.add(params, "gravity", -100, 100, 0.01).onChange((v) => {
        params.gravity = parseFloat(v);
      });
      physicsFolder.add(params, "playerSpeed", 1, 20);
      physicsFolder.open();

      gui.add(params, "reset");
      gui.open();

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
          case "Enter":
            interact();
            break;
        }
      });
    }

    function interact() {
      const x = player.position.x;
      const z = player.position.z;
      if (
        x > 4 &&
        x < 23.39 &&
        z > -191 &&
        z < -181 &&
        contactUs.value === false
      ) {
        contactUs.value = true;
      }
    }

    function reset() {
      playerVelocity.set(0, 0, 0);
      player.position.set(0, 100, 120);
      camera.position.sub(controls.target);
      controls.target.copy(player.position);
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
            params.playerSpeed * delta * speedAngle.up
          );
        }

        if (keyStates.KeyS) {
          tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta * speedAngle.down
          );
        }

        if (keyStates.KeyA) {
          tempVector.set(-1, 0, 0).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta * speedAngle.left
          );
        }

        if (keyStates.KeyD) {
          tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta * speedAngle.right
          );
        }
      } else {
        const angle = controls.getAzimuthalAngle();
        if (fwdPressed) {
          tempVector.set(0, 0, -1).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta
          );
        }

        if (bkdPressed) {
          tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta
          );
        }

        if (lftPressed) {
          tempVector.set(-1, 0, 0).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta
          );
        }

        if (rgtPressed) {
          tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
          player.position.addScaledVector(
            tempVector,
            params.playerSpeed * delta
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
      stats.update();
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

      if (collider) {
        const physicsSteps = params.physicsSteps;

        for (let i = 0; i < physicsSteps; i++) {
          updatePlayer(delta / physicsSteps);
        }
      }
      if (player) {
        const x = player.position.x;
        const z = player.position.z;
        if (
          x > 4 &&
          x < 23.39 &&
          z > -191 &&
          z < -181 &&
          contactUs.value === false
        ) {
          interactHint.value = true;
        } else {
          interactHint.value = false;
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

      if (intersects.length) {
        if (!currentIntersect) {
          console.log("mouse enter:>> ");
          currentIntersect = intersects[0];
        }
        currentIntersect = intersects[0];
        console.log("currentIntersect :>> ", currentIntersect);
        if (currentIntersect.object.name.indexOf("area") !== -1) {
          currentIntersect.object.children[1].rotation.y += 0.05;
          if (currentIntersect.object.children[0].position.y < 6) {
            currentIntersect.object.children[0].position.y += 0.2;
            currentIntersect.object.children[1].position.y += 0.125;
          } else {
            if (up) {
              if (currentIntersect.object.children[0].position.y > 6.4)
                up = false;
              else currentIntersect.object.children[0].position.y += 0.01;
            } else {
              if (currentIntersect.object.children[0].position.y < 6.2)
                up = true;
              else currentIntersect.object.children[0].position.y -= 0.01;
            }
          }
        }
      } else {
        if (currentIntersect) {
          console.log("mouse leave:>> ");
          prevIntersect = currentIntersect;
        }
        currentIntersect = null;
      }
      if (prevIntersect && prevIntersect.object.name.indexOf("area") !== -1) {
        if (prevIntersect.object.children[0].position.y > 0) {
          prevIntersect.object.children[0].position.y -= 0.4;
          prevIntersect.object.children[1].position.y -= 0.25;
        } else prevIntersect = null;
      }
      // Update mixer
      if (mixer) {
        mixer.update(clock.getDelta());
      }
      controls.update();
      renderer.render(scene, camera);
    }
    return {
      container,
      joystick,
      loading,
      loadingBarElement,
      contactUs,
      interactHint,
    };
  },
};
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
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
.overlay {
  width: 100vw;
  height: 100vh;
  position: absolute;
  opacity: 1;
  background: black;
  top: 0;
  left: 0;
}
.loading-bar {
  position: absolute;
  top: 50%;
  width: 100%;
  height: 2px;
  background: #ffffff;
  transform: scaleX(0);
  transform-origin: top left;
  transition: transform 0.5s;
}
.loading-bar.ended {
  transform: scaleX(0);
  transform-origin: 100% 0;
  transition: transform 1.5s ease-in-out;
}
.contact-us {
  width: 200px;
  height: 200px;
  background: grey;
  z-index: 99999;
  position: absolute;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  top: 50%;
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
</style>
