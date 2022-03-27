import { ref, onMounted, provide } from "vue";
import nipplejs from "nipplejs";
import nftPositions from "./nftPositions";
import TWEEN from "@tweenjs/tween.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

import { gsap } from "gsap";
import * as THREE from "three";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
  MeshBVH,
} from "three-mesh-bvh";
THREE.Mesh.prototype.raycast = acceleratedRaycast;
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { deviceType } from "./helper";
import loadResources from "./resources";
import init from "./init";

import { io } from "socket.io-client";

let id;
let room = ref(null);
let clients = new Object();

const globalSocket = ref(null);
THREE.Cache.enabled = true;
export default (overlayElement, joystick, loadingBarElement) => {
  /**
   * Interface variables
   */
  const typing = ref(false);
  const chatOpen = ref(false);
  const playerName = ref("Guest");
  playerName.value = localStorage.playerName
    ? localStorage.playerName
    : "Guest";
  /**
   * Ray Variables
   */
  let fallingFbx = null;
  let BreathingIdleFbx = null;
  let RunningFbx = null;
  let JumpFbx = null;
  let WalkingFbx = null;

  /**
   * Player Params
   */
  let playerDirection = {
    up: false,
    down: false,
    left: false,
    right: false,
  };
  let speedAngle = {};
  let radian = 0;

  let running = false;

  let firstPerson = false;
  let playerIsOnGround = false;
  let playerVelocity = new THREE.Vector3();
  let gravity = -30;

  const playerSpeed = 10;
  const physicsSteps = 4;

  let upVector = new THREE.Vector3(0, 1, 0);
  let tempVector = new THREE.Vector3();
  let tempVector2 = new THREE.Vector3();

  let tempBox = new THREE.Box3();
  let tempMat = new THREE.Matrix4();
  let tempSegment = new THREE.Line3();

  /**
   * Animations Variables
   */
  let playerMixer = null;
  let falling = null;
  let stand = null;
  let jumpForward = null;
  let runing = null;
  let wallk = null;
  let currentAction = null;
  let fadingSpeed = 0.2;
  let gltfLoader = null;

  /**
   * Setup Variables
   */

  let currentNft = ref(null);
  let playerNameMesh, player, Map, collider, mapMixer, mars;

  const handleTypingState = () => {
    typing.value = !typing.value;
  };

  const playJumpForward = () => {
    currentAction.fadeOut(fadingSpeed);
    jumpForward.reset().fadeIn(fadingSpeed).play();

    currentAction = jumpForward;
  };

  let controls = null;

  const playWallkingRunning = () => {
    if (
      currentAction !== falling &&
      currentAction !== jumpForward &&
      (playerDirection.up ||
        playerDirection.down ||
        playerDirection.right ||
        playerDirection.left)
    ) {
      if (running === true) {
        if (currentAction !== runing) {
          currentAction.fadeOut(fadingSpeed);
          runing.reset().fadeIn(fadingSpeed).play();
        }
        currentAction = runing;
      } else {
        if (currentAction !== wallk) {
          currentAction.fadeOut(fadingSpeed);
          wallk.reset().fadeIn(fadingSpeed).play();
        }
        currentAction = wallk;
      }
    }
    globalSocket.value.emit("move", {
      position: [player.position.x, player.position.y, player.position.z],
      rotation: [player.rotation.x, player.rotation.y, player.rotation.z],
      state: currentAction._clip.name,
      room: room.value,
    });
  };

  const stopState = () => {
    if (
      currentAction !== falling &&
      currentAction !== jumpForward &&
      !playerDirection.up &&
      !playerDirection.down &&
      !playerDirection.right &&
      !playerDirection.left
    ) {
      if (currentAction !== stand) {
        currentAction.fadeOut(fadingSpeed);
        stand.reset().fadeIn(fadingSpeed).play();
      }
      currentAction = stand;
    }
    globalSocket.value.emit("move", {
      position: [player.position.x, player.position.y, player.position.z],
      rotation: [player.rotation.x, player.rotation.y, player.rotation.z],
      state: currentAction._clip.name,
      room: room.value,
    });
  };

  const reset = (camera, controls) => {
    if (player) {
      playerVelocity.set(0, 0, 0);
      player.position.set(-13, -1.35, 0);

      camera.position.add(player.position);
      controls.update();

      currentAction.stop();
      stand.reset().play();
      currentAction = stand;
      setTimeout(() => {
        currentAction.fadeOut(0.05);
        stand.reset().fadeIn(0.05).play();
        currentAction = stand;
        playWallkingRunning();
        stopState();
      }, 2800);
    }
  };

  const triggerRun = () => {
    running = !running;
  };

  const triggerJump = () => {
    if (playerIsOnGround) {
      playerVelocity.y = 10.0;
      playJumpForward();
    }
    globalSocket.value.emit("move", {
      position: [player.position.x, player.position.y, player.position.z],
      rotation: [player.rotation.x, player.rotation.y, player.rotation.z],
      state: currentAction._clip.name,
      room: room.value,
    });
  };

  const rotateQuarternion = new THREE.Quaternion();
  const directionOffset = () => {
    var directionOffset = 0; // w

    if (playerDirection.up) {
      if (playerDirection.left) {
        directionOffset = Math.PI / 4; // w+a
      } else if (playerDirection.right) {
        directionOffset = -Math.PI / 4; // w+d
      }
    } else if (playerDirection.down) {
      if (playerDirection.left) {
        directionOffset = Math.PI / 4 + Math.PI / 2; // s+a
      } else if (playerDirection.right) {
        directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d
      } else {
        directionOffset = Math.PI; // s
      }
    } else if (playerDirection.left) {
      directionOffset = Math.PI / 2; // a
    } else if (playerDirection.right) {
      directionOffset = -Math.PI / 2; // d
    }

    return directionOffset;
  };

  const updatePlayer = (delta) => {
    // player y position
    playerVelocity.y += playerIsOnGround ? 0 : delta * gravity;
    player.position.addScaledVector(playerVelocity, delta);

    /**
     * move the player
     */

    //player speed
    let speedMultiplier = 0.25;
    if (running) {
      speedMultiplier = 0.75;
    }

    if (deviceType() === "desktop") {
      // player direction
      let angle = controls.getAzimuthalAngle();

      if (
        playerDirection.up ||
        playerDirection.down ||
        playerDirection.right ||
        playerDirection.left
      ) {
        const angleYCameraDirection = controls.getAzimuthalAngle();
        // rotate model
        rotateQuarternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          angleYCameraDirection + directionOffset()
        );
        player.quaternion.rotateTowards(rotateQuarternion, 0.05);
        const dirrr = new THREE.Euler().setFromQuaternion(
          player.quaternion,
          "YXZ"
        );

        tempVector.set(0, 0, -1).applyAxisAngle(upVector, dirrr.y);
        player.position.addScaledVector(
          tempVector,
          playerSpeed * speedMultiplier * delta
        );
      }
    } else {
      // radian - Math.PI;
      let angle = controls.getAzimuthalAngle() + radian;

      if (
        playerDirection.down ||
        playerDirection.left ||
        playerDirection.right ||
        playerDirection.up
      ) {
        const angleYCameraDirection = controls.getAzimuthalAngle();
        // rotate model
        rotateQuarternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          angleYCameraDirection + (radian - Math.PI / 2)
        );
        player.quaternion.rotateTowards(rotateQuarternion, 0.05);
        const dirrr = new THREE.Euler().setFromQuaternion(
          player.quaternion,
          "YXZ"
        );

        tempVector.set(0, 0, -1).applyAxisAngle(upVector, dirrr.y);
        player.position.addScaledVector(
          tempVector,
          playerSpeed * speedMultiplier * delta
        );
      }
    }

    player.updateMatrixWorld();

    // adjust player position based on collisions
    const playerInfo = player.playerInfo;
    tempBox.makeEmpty();
    tempMat.copy(collider.matrixWorld).invert();
    tempSegment.copy(playerInfo.segment);

    // get the position of the player in the local space of the collider
    tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);
    tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);

    // get the axis aligned bounding box of the player
    tempBox.expandByPoint(tempSegment.start);
    tempBox.expandByPoint(tempSegment.end);

    tempBox.min.addScalar(-playerInfo.radius);
    tempBox.max.addScalar(playerInfo.radius);

    collider.geometry.boundsTree.shapecast({
      intersectsBounds: (box) => box.intersectsBox(tempBox),

      intersectsTriangle: (tri) => {
        // check if the triangle is intersecting the player and adjust the
        // player position if it is.
        const triPoint = tempVector;
        const playerPoint = tempVector2;

        const distance = tri.closestPointToSegment(
          tempSegment,
          triPoint,
          playerPoint
        );
        if (distance < playerInfo.radius) {
          const depth = playerInfo.radius - distance;
          const direction = playerPoint.sub(triPoint).normalize();

          tempSegment.start.addScaledVector(direction, depth);
          tempSegment.end.addScaledVector(direction, depth);
        }
      },
    });

    // get the adjusted position of the player collider in world space after checking
    // triangle collisions and moving it. playerInfo.segment.start is assumed to be
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
      if (currentAction === jumpForward) {
        jumpForward.fadeOut(0.2);
        currentAction = stand;
        if (
          playerDirection.up ||
          playerDirection.down ||
          playerDirection.right ||
          playerDirection.left
        ) {
          playWallkingRunning();
        } else {
          stand.reset().fadeIn(0.2).play();
          currentAction = stand;
        }
      }
      playerVelocity.set(0, 0, 0);
    }

    // adjust the camera

    camera.position.sub(controls.target);
    controls.target.copy(player.position);
    camera.position.add(player.position);

    // if the player has fallen too far below the level reset their position to the start
    if (player.position.y < -25) {
      reset(camera, controls);
    }
  };

  /**
   * Render
   */

  let oldElapsedTime = 0;
  let previousPlayerPosition = new THREE.Vector3(0, 0, 0);

  const render = () => {
    TWEEN.update();
    // stats.update();
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    requestAnimationFrame(render);
    if (controls) {
      if (firstPerson) {
        controls.maxPolarAngle = Math.PI;
        controls.minDistance = 1e-4;
        controls.maxDistance = 1e-4;
      } else {
        controls.maxPolarAngle = Math.PI / 2;
        controls.minDistance = 1;
        controls.maxDistance = 2;
      }

      if (player && collider) {
        for (let i = 0; i < physicsSteps; i++) {
          if (player.position.y < -200) {
            reset(camera, controls);
          }

          updatePlayer(deltaTime / physicsSteps);

          if (playerNameMesh && playerNameMesh.position) {
            playerNameMesh.position.set(
              player.position.x,
              player.position.y + 0.05,
              player.position.z
            );
            playerNameMesh.quaternion.copy(camera.quaternion);
          }
        }
      }
    }

    if (player && !previousPlayerPosition.equals(player.position)) {
      if (globalSocket.value && id && (room.value || room.value === 0)) {
        globalSocket.value.emit("move", {
          position: [player.position.x, player.position.y, player.position.z],
          rotation: [player.rotation.x, player.rotation.y, player.rotation.z],
          state: currentAction._clip.name,
          room: room.value,
        });
        previousPlayerPosition.copy(player.position);
      }
    }

    if (playerMixer) {
      playerMixer.update(deltaTime);
    }

    for (let i = 0; i < Object.keys(clients).length; i++) {
      const key = Object.keys(clients)[i];
      if (key !== id) {
        clients[key].mixer.update(deltaTime);
      }
    }

    // Update mixer map
    if (mapMixer) {
      mapMixer.update(deltaTime);
    }
    if (player) {
      currentNft.value = null;
      for (let nftIndex = 0; nftIndex < nftPositions.length; nftIndex++) {
        const nft = nftPositions[nftIndex];
        if (
          player.position.x > nft.minX &&
          player.position.x < nft.maxX &&
          player.position.z > nft.minZ &&
          player.position.z < nft.maxZ
        ) {
          currentNft.value = nft.data;
          break;
        }
      }
    }
    if (mars) {
      // console.log("mars :>> ", mars);
      mars.rotation.y += 0.001;
    }
    renderer.render(scene, camera);
    // scene.traverse(darkenNonBloomed);
    // bloomComposer.render();
    // scene.traverse(restoreMaterial);
    // finalComposer.render();
  };

  window.addEventListener("keydown", (e) => {
    if (!typing.value) {
      switch (e.code) {
        case "KeyW":
          playerDirection.up = true;
          playWallkingRunning();
          break;
        case "KeyS":
          playerDirection.down = true;
          playWallkingRunning();
          break;
        case "KeyD":
          playerDirection.right = true;
          playWallkingRunning();
          break;
        case "KeyA":
          playerDirection.left = true;
          playWallkingRunning();
          break;
        case "ShiftLeft":
          running = true;
          playWallkingRunning();
          break;
        case "Space":
          if (playerIsOnGround) {
            playerVelocity.y = 10.0;
            playJumpForward();
          }
          break;
      }
    }
  });

  window.addEventListener("keyup", (e) => {
    if (!typing.value) {
      switch (e.code) {
        case "KeyW":
          playerDirection.up = false;
          break;
        case "KeyS":
          playerDirection.down = false;
          break;
        case "KeyD":
          playerDirection.right = false;
          break;
        case "KeyA":
          playerDirection.left = false;
          break;
        case "ShiftLeft":
          running = false;
          playWallkingRunning();
          break;
        case "KeyR":
          reset(camera, controls);
          break;
      }
      stopState();
    }
  });

  onMounted(() => {
    if (deviceType() !== "desktop") {
      speedAngle = { up: 1.5, down: 4.5, left: 3, right: 0 };

      const options = {
        zone: joystick.value,
        mode: "static",
        color: "#ffffff",
        position: {
          left: "50%",
          top: "50%",
        },
      };
      const manager = nipplejs.create(options);
      const anglesRadian = {
        right: 0,
        up: 1.5,
        left: 3,
        down: 4.5,
      };
      manager.on("move", (_, data) => {
        if (!chatOpen.value) {
          playerDirection = {
            up: false,
            down: false,
            left: false,
            right: false,
          };
          if (data.direction && data.direction.x && data.direction.y) {
            playerDirection[data.direction.x] = true;
            playerDirection[data.direction.y] = true;
            radian = data.angle.radian;
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
            playWallkingRunning();
          }
        }
      });
      manager.on("end", () => {
        if (!chatOpen.value) {
          playerDirection = {
            up: false,
            down: false,
            left: false,
            right: false,
          };
          speedAngle = { up: 1.5, down: 1.5, left: 1.5, right: 1.5 };
          stopState();
        }
      });
    }
  });

  const loading = ref(true);
  const gettingName = ref(false);

  window.addEventListener("touchstart", () => {
    var element = document.documentElement; // Make the body go full screen.
    var requestMethod =
      element.requestFullScreen ||
      element.webkitRequestFullScreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullScreen;
    if (requestMethod) {
      // Native full screen.
      requestMethod.call(element);
    }
  });
  window.addEventListener("touchmove", () => {
    var element = document.documentElement; // Make the body go full screen.
    var requestMethod =
      element.requestFullScreen ||
      element.webkitRequestFullScreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullScreen;
    if (requestMethod) {
      // Native full screen.
      requestMethod.call(element);
    }
  });

  const {
    renderer,
    camera,
    scene,
    clock,
    bloomComposer,
    finalComposer,
    darkenNonBloomed,
    restoreMaterial,
  } = init(THREE);

  const changeUser = () => {
    for (const key in clients) {
      scene.remove(clients[key].mesh);
      scene.remove(clients[key].nameMesh);

      delete clients[key];
    }

    globalSocket.value.disconnect();
    scene.remove(player);
    scene.remove(playerNameMesh);
    playerNameMesh = null;
    player = null;
    id = null;
    room.value = null;
    gettingName.value = true;
  };

  const loadingManager = new THREE.LoadingManager(
    () => {
      // overlayElement.value.classList.add("ended");
      loading.value = false;
      console.log("loading.value :>> ", loading.value);
      if (localStorage.avatarName) {
        gettingName.value = false;
        start();
      } else {
        gettingName.value = true;
      }
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
      if (loading.value) {
        const progressRatio = itemsLoaded / itemsTotal;
        loadingBarElement.value.style.transform = `scaleX(${progressRatio})`;
      }
    },
    () => {
      console.log("error");
    }
  );

  loadResources(loadingManager, THREE, MeshBVH, (data) => {
    Map = data.Map;
    collider = data.collider;
    mapMixer = data.mapMixer;
    gltfLoader = data.gltfLoader;
    fallingFbx = data.fallingFbx;
    BreathingIdleFbx = data.BreathingIdleFbx;
    RunningFbx = data.RunningFbx;
    JumpFbx = data.JumpFbx;
    WalkingFbx = data.WalkingFbx;
    mars = data.mars;
  });

  const start = () => {
    /**
     * Player Setup
     */
    gltfLoader.load(localStorage.avatarName, (readyPlayer) => {
      player = readyPlayer.scene;
      player.scale.set(0.5, 0.5, 0.5);
      player.playerInfo = {
        radius: 0.5,
        segment: new THREE.Line3(
          new THREE.Vector3(),
          new THREE.Vector3(0, -1.0, 0.0)
        ),
      };

      player.position.set(-13, -1.35, 0);
      player.children[0].translateY(-2.05);
      player.children[0].rotateY(Math.PI / 2);
      player.children[0].rotateZ(-Math.PI);
      player.rotation.y -= Math.PI / 2;
      const target = player.position.clone();
      target.y += 1;
      target.x -= 2;
      var tween = new TWEEN.Tween(camera.position).to(target, 3000);
      // tween.easing(TWEEN.Easing.Elastic.InOut);
      tween.onUpdate(function () {
        camera.lookAt(player.position);
      });
      tween.start();

      setTimeout(() => {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.target.copy(player.position);
        controls.update();
      }, 3000);

      playerMixer = new THREE.AnimationMixer(player);
      falling = playerMixer.clipAction(fallingFbx.animations[0]);
      stand = playerMixer.clipAction(BreathingIdleFbx.animations[0]);
      jumpForward = playerMixer.clipAction(JumpFbx.animations[0]);
      runing = playerMixer.clipAction(RunningFbx.animations[0]);
      wallk = playerMixer.clipAction(WalkingFbx.animations[0]);
      stand.play();
      currentAction = stand;
      const loader = new FontLoader();
      loader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        localStorage.playerName = playerName.value;

        const textGeometry = new TextGeometry(playerName.value, {
          font: font,
          size: 0.04,
          height: 0.01,
          curveSegments: 2,
          bevelEnabled: true,
          bevelThickness: 0.003,
          bevelSize: 0.002,
          bevelOffset: 0,
          bevelSegments: 1,
        });
        textGeometry.center();
        scene.add(Map);
        player.castShadow = true;
        player.receiveShadow = true;
        playerNameMesh = new THREE.Mesh(textGeometry, material);
        playerNameMesh.quaternion.copy(camera.quaternion);
        scene.add(playerNameMesh);
        scene.add(player);

        playerNameMesh.position.set(
          player.position.x,
          player.position.y + 0.05,
          player.position.z
        );

        // camera.position.add(player.position);
        // controls.update();
        // "http://localhost:3000",
        // "https://pacific-island-87082.herokuapp.com/",
        globalSocket.value = io("https://bixosverse.bixos.io/", {
          transports: ["websocket", "polling", "flashsocket"],
        });

        gettingName.value = false;
        gsap
          .timeline({
            paused: false,
            defaults: { duration: 2.23 },
          })
          .to(".overlay", { opacity: 0 })
          .then(() => {
            // falling.fadeOut(0.05);
            // stand.reset().fadeIn(0.05).play();
            currentAction = stand;
          });

        //
        globalSocket.value.emit("send-name", {
          playerName: playerName.value,
          avatarName: localStorage.avatarName,
        });

        //On connection server sends the client his ID
        globalSocket.value.on(
          "introduction",
          (_id, _clientNum, _ids, _clientProps, _room) => {
            for (let i = 0; i < _ids.length; i++) {
              let alreadyHasUser = false;
              for (
                let index = 0;
                index < Object.keys(clients).length;
                index++
              ) {
                if (Object.keys(clients)[index] == _ids[i]) {
                  alreadyHasUser = true;
                  break;
                }
              }
              if (
                _ids[i] != _id &&
                _clientProps[_ids[i]].avatar &&
                !alreadyHasUser
              ) {
                gltfLoader.load(
                  _clientProps[_ids[i]].avatar,
                  (newPlayerGltf) => {
                    const newPlayer = newPlayerGltf.scene;
                    newPlayer.scale.set(0.5, 0.5, 0.5);
                    newPlayer.playerInfo = {
                      radius: 0.5,
                      segment: new THREE.Line3(
                        new THREE.Vector3(),
                        new THREE.Vector3(0, -1.0, 0.0)
                      ),
                    };

                    newPlayer.position.set(-13, -1.35, 0);

                    newPlayer.children[0].translateY(-2.05);
                    newPlayer.children[0].rotateY(Math.PI / 2);

                    newPlayer.children[0].rotateZ(-Math.PI);
                    newPlayer.children[0].castShadow = true;
                    newPlayer.children[0].receiveShadow = true;

                    const newPlayertextGeometry = new TextGeometry(
                      _clientProps[_ids[i]].name,
                      {
                        font: font,
                        size: 0.04,
                        height: 0.01,
                        curveSegments: 2,
                        bevelEnabled: true,
                        bevelThickness: 0.003,
                        bevelSize: 0.002,
                        bevelOffset: 0,
                        bevelSegments: 1,
                      }
                    );
                    newPlayertextGeometry.center();

                    const newPlayerText = new THREE.Mesh(
                      newPlayertextGeometry,
                      material
                    );

                    clients[_ids[i]] = {
                      mesh: newPlayer,
                      nameMesh: newPlayerText,
                    };

                    clients[_ids[i]].mixer = new THREE.AnimationMixer(
                      clients[_ids[i]].mesh
                    );
                    clients[_ids[i]].falling = clients[
                      _ids[i]
                    ].mixer.clipAction(
                      fallingFbx.animations[0],
                      clients[_ids[i]].mesh
                    );
                    clients[_ids[i]].stand = playerMixer.clipAction(
                      BreathingIdleFbx.animations[0],
                      clients[_ids[i]].mesh
                    );
                    clients[_ids[i]].jumpForward = playerMixer.clipAction(
                      JumpFbx.animations[0],
                      clients[_ids[i]].mesh
                    );
                    clients[_ids[i]].runing = playerMixer.clipAction(
                      RunningFbx.animations[0],
                      clients[_ids[i]].mesh
                    );
                    clients[_ids[i]].wallk = playerMixer.clipAction(
                      WalkingFbx.animations[0],
                      clients[_ids[i]].mesh
                    );

                    //Add initial users to the scene
                    scene.add(clients[_ids[i]].mesh);
                    scene.add(clients[_ids[i]].nameMesh);
                  }
                );
              }
            }
            if (!id) {
              id = _id;
              room.value = _room;
            }
          }
        );

        globalSocket.value.on(
          "newUserConnected",
          (clientCount, _id, _ids, _clientProps) => {
            let alreadyHasUser = false;
            for (let i = 0; i < Object.keys(clients).length; i++) {
              if (Object.keys(clients)[i] == _id) {
                alreadyHasUser = true;
                break;
              }
            }
            if (_id != id && !alreadyHasUser) {
              gltfLoader.load(_clientProps[_id].avatar, (newPlayerGltf) => {
                const newPlayer = newPlayerGltf.scene;
                newPlayer.scale.set(0.5, 0.5, 0.5);
                newPlayer.playerInfo = {
                  radius: 0.5,
                  segment: new THREE.Line3(
                    new THREE.Vector3(),
                    new THREE.Vector3(0, -1.0, 0.0)
                  ),
                };

                newPlayer.position.set(-13, -1.35, 0);

                newPlayer.children[0].translateY(-2.05);
                newPlayer.children[0].rotateY(Math.PI / 2);
                newPlayer.children[0].rotateZ(-Math.PI);

                newPlayer.children[0].castShadow = false;
                newPlayer.children[0].receiveShadow = false;

                const newPlayertextGeometry = new TextGeometry(
                  _clientProps[_id].name,
                  {
                    font: font,
                    size: 0.04,
                    height: 0.01,
                    curveSegments: 2,
                    bevelEnabled: true,
                    bevelThickness: 0.003,
                    bevelSize: 0.002,
                    bevelOffset: 0,
                    bevelSegments: 1,
                  }
                );
                newPlayertextGeometry.center();
                const newPlayerText = new THREE.Mesh(
                  newPlayertextGeometry,
                  material
                );

                clients[_id] = {
                  mesh: newPlayer,
                  nameMesh: newPlayerText,
                };

                clients[_id].mixer = new THREE.AnimationMixer(
                  clients[_id].mesh
                );
                clients[_id].falling = clients[_id].mixer.clipAction(
                  fallingFbx.animations[0],
                  clients[_id].mesh
                );
                clients[_id].stand = playerMixer.clipAction(
                  BreathingIdleFbx.animations[0],
                  clients[_id].mesh
                );
                clients[_id].jumpForward = playerMixer.clipAction(
                  JumpFbx.animations[0],
                  clients[_id].mesh
                );
                clients[_id].runing = playerMixer.clipAction(
                  RunningFbx.animations[0],
                  clients[_id].mesh
                );
                clients[_id].wallk = playerMixer.clipAction(
                  WalkingFbx.animations[0],
                  clients[_id].mesh
                );

                //Add initial users to the scene
                scene.add(clients[_id].mesh);
                scene.add(clients[_id].nameMesh);
              });
            }
          }
        );

        globalSocket.value.on("userDisconnected", (clientCount, _id, _ids) => {
          //Update the data from the server
          // if (_id != id && clients[_id]) {
          if (clients[_id].mesh) scene.remove(clients[_id].mesh);
          if (clients[_id].nameMesh) scene.remove(clients[_id].nameMesh);

          delete clients[_id];
          // }
        });

        globalSocket.value.on("connect", () => {});

        //Update when one of the users moves in space
        globalSocket.value.on("userPositions", (_clientProps) => {
          for (let i = 0; i < Object.keys(_clientProps).length; i++) {
            if (
              Object.keys(_clientProps)[i] != id &&
              clients[Object.keys(_clientProps)[i]]
            ) {
              const otherPlayerState =
                _clientProps[Object.keys(_clientProps)[i]].state;

              if (otherPlayerState === "stand") {
                clients[Object.keys(_clientProps)[i]].falling.stop();
                clients[Object.keys(_clientProps)[i]].jumpForward.stop();
                clients[Object.keys(_clientProps)[i]].runing.stop();
                clients[Object.keys(_clientProps)[i]].wallk.stop();
                clients[Object.keys(_clientProps)[i]].stand.play();
              }

              if (otherPlayerState === "walking") {
                clients[Object.keys(_clientProps)[i]].falling.stop();
                clients[Object.keys(_clientProps)[i]].jumpForward.stop();
                clients[Object.keys(_clientProps)[i]].runing.stop();
                clients[Object.keys(_clientProps)[i]].wallk.play();
                clients[Object.keys(_clientProps)[i]].stand.stop();
              }

              if (otherPlayerState === "running") {
                clients[Object.keys(_clientProps)[i]].falling.stop();
                clients[Object.keys(_clientProps)[i]].jumpForward.stop();
                clients[Object.keys(_clientProps)[i]].runing.play();
                clients[Object.keys(_clientProps)[i]].wallk.stop();
                clients[Object.keys(_clientProps)[i]].stand.stop();
              }

              if (otherPlayerState === "falling") {
                clients[Object.keys(_clientProps)[i]].falling.play();
                clients[Object.keys(_clientProps)[i]].jumpForward.stop();
                clients[Object.keys(_clientProps)[i]].runing.stop();
                clients[Object.keys(_clientProps)[i]].wallk.stop();
                clients[Object.keys(_clientProps)[i]].stand.stop();
              }

              if (otherPlayerState === "jumpForward") {
                clients[Object.keys(_clientProps)[i]].falling.stop();
                clients[Object.keys(_clientProps)[i]].jumpForward.play();
                clients[Object.keys(_clientProps)[i]].runing.stop();
                clients[Object.keys(_clientProps)[i]].wallk.stop();
                clients[Object.keys(_clientProps)[i]].stand.stop();
              }

              //Store the position

              let oldPosition =
                clients[Object.keys(_clientProps)[i]].mesh.position;
              let newPosition =
                _clientProps[Object.keys(_clientProps)[i]].position;
              //Create a vector 3 and lerp the new position with the old position
              let lerpedPosition = new THREE.Vector3();
              lerpedPosition.x = THREE.Math.lerp(
                oldPosition.x,
                newPosition[0],
                0.3
              );
              lerpedPosition.y = THREE.Math.lerp(
                oldPosition.y,
                newPosition[1],
                0.3
              );
              lerpedPosition.z = THREE.Math.lerp(
                oldPosition.z,
                newPosition[2],
                0.3
              );

              //Set the position
              clients[Object.keys(_clientProps)[i]].mesh.position.set(
                lerpedPosition.x,
                lerpedPosition.y,
                lerpedPosition.z
              );

              clients[Object.keys(_clientProps)[i]].nameMesh.quaternion.copy(
                camera.quaternion
              );

              clients[Object.keys(_clientProps)[i]].nameMesh.position.set(
                clients[Object.keys(_clientProps)[i]].mesh.position.x,
                clients[Object.keys(_clientProps)[i]].mesh.position.y + 0.05,
                clients[Object.keys(_clientProps)[i]].mesh.position.z
              );

              //Store the rotation
              let oldRotation =
                clients[Object.keys(_clientProps)[i]].mesh.rotation;
              let newRotation =
                _clientProps[Object.keys(_clientProps)[i]].rotation;

              //Create a vector 3 and lerp the new rotation with the old rotation
              let lerpedRotation = new THREE.Vector3();
              lerpedRotation.x = THREE.Math.lerp(
                oldRotation.x,
                newRotation[0],
                0.3
              );
              lerpedRotation.y = THREE.Math.lerp(
                oldRotation.y,
                newRotation[1],
                0.3
              );
              lerpedRotation.z = THREE.Math.lerp(
                oldRotation.z,
                newRotation[2],
                0.3
              );
              //Set the position
              clients[Object.keys(_clientProps)[i]].mesh.rotation.set(
                lerpedRotation.x,
                lerpedRotation.y,
                lerpedRotation.z
              );
            }
          }
        });
      });
    });
  };
  render();

  return {
    loading,
    overlayElement,
    deviceType,
    loadingBarElement,
    reset,
    camera,
    controls,
    triggerRun,
    running,
    triggerJump,
    start,
    gettingName,
    playerName,
    globalSocket,
    handleTypingState,
    room,
    chatOpen,
    changeUser,
    currentNft,
  };
};
