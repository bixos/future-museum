import { ref, onMounted, provide } from "vue";
import nipplejs from "nipplejs";
import Stats from "stats.js";

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
// stats setup
let stats;
stats = new Stats();
document.body.appendChild(stats.dom);

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { deviceType } from "./helper";
import loadResources from "./resources";
import init from "./init";

export default (overlayElement, joystick, loadingBarElement) => {
  /**
   * Interface variables
   */
  const houseDetails = ref(false);
  const interactHint = ref(false);
  const house = ref({});

  /**
   * Ray Variables
   */
  let currentIntersect = null;
  let prevIntersect = null;
  let signToFlip = null;

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
  const physicsSteps = 20;

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

  /**
   * Setup Variables
   */
  let player, Map, collider, houses, signs, mapMixer;
  let buyArea = [];

  const playJumpForward = () => {
    currentAction.fadeOut(fadingSpeed);
    jumpForward.reset().fadeIn(fadingSpeed).play();

    currentAction = jumpForward;
  };

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
  };

  const reset = (camera, controls) => {
    if (player) {
      playerVelocity.set(0, 0, 0);
      player.position.set(0, 100, 120);

      camera.position.add(player.position);
      controls.update();

      currentAction.stop();
      falling.reset().play();
      currentAction = falling;
      setTimeout(() => {
        console.log("currentAction :>> ", currentAction);
        currentAction.fadeOut(0.05);
        stand.reset().fadeIn(0.05).play();
        currentAction = stand;
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
  };

  const interact = () => {
    if (currentIntersect && currentIntersect.name.indexOf("area") !== -1) {
      house.value = currentIntersect.userData.house;
      houseDetails.value = true;
    }
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
        player.quaternion.rotateTowards(rotateQuarternion, 0.005);
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
        player.quaternion.rotateTowards(rotateQuarternion, 0.005);
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

  let up = true;
  const raycaster = new THREE.Raycaster();
  let DOWN_DIRECTION = new THREE.Vector3(0, -1, 0);
  let oldElapsedTime = 0;

  const render = () => {
    stats.update();
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    requestAnimationFrame(render);

    // const delta = Math.min(clock.getDelta(), 0.1);
    if (firstPerson) {
      controls.maxPolarAngle = Math.PI;
      controls.minDistance = 1e-4;
      controls.maxDistance = 1e-4;
    } else {
      controls.maxPolarAngle = Math.PI / 2;
      controls.minDistance = 2;
      controls.maxDistance = 10;
    }

    if (collider && houseDetails.value === false) {
      for (let i = 0; i < physicsSteps; i++) {
        updatePlayer(deltaTime / physicsSteps);
      }
    }

    if (playerMixer) {
      playerMixer.update(deltaTime);
    }

    // Update mixer map
    if (mapMixer) {
      mapMixer.update(deltaTime);
    }
    if (player) {
      raycaster.set(
        new THREE.Vector3(
          player.position.x,
          player.position.y,
          player.position.z
        ),
        DOWN_DIRECTION
      );
    }

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
        currentIntersect.children[3].rotation.y += 0.02;
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

    if (signToFlip) {
      signToFlip.rotation.y -= Math.PI;
      signToFlip = null;
    }

    renderer.render(scene, camera);
  };
  window.addEventListener(
    "drag",
    function (event) {
      console.log("event :>> ", event);
    },
    false
  );
  window.addEventListener("keydown", (e) => {
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
  });

  window.addEventListener("keyup", (e) => {
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
      case "Enter":
        interact();
        break;
      case "KeyR":
        reset(camera, controls);
        break;
    }
    stopState();
  });

  onMounted(() => {
    if (deviceType() !== "desktop") {
      speedAngle = { up: 1.5, down: 4.5, left: 3, right: 0 };

      const options = {
        zone: joystick.value,
        mode: "static",
        color: "#239eda",
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
      });
      manager.on("end", () => {
        playerDirection = { up: false, down: false, left: false, right: false };
        speedAngle = { up: 1.5, down: 1.5, left: 1.5, right: 1.5 };
        stopState();
      });
    }
  });

  const container = ref({});
  const loading = ref(true);
  const balance = ref(1000000);
  const celebrate = ref(false);
  const hitSound = new Audio(require("../assets/AudioBuy.mp3"));
  let defaultMaterial = null;

  const buyHouse = () => {
    if (!defaultMaterial) {
      defaultMaterial = currentIntersect.children[1].material.clone();
    }
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
    // var material2 = currentIntersect.children[1].material.clone();
    // material2.color = new THREE.Color(0x00a3e0);
    currentIntersect.children[1].material = defaultMaterial;
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

  const requestFullScreen = () => {
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
  };

  const { renderer, camera, scene, controls, clock } = init(
    THREE,
    OrbitControls
  );

  const loadingManager = new THREE.LoadingManager(
    () => {
      scene.add(player);
      scene.add(Map);
      renderer.shadowMap.autoUpdate = false;
      renderer.shadowMap.needsUpdate = true;

      overlayElement.value.classList.add("ended");
      camera.position.add(player.position);
      controls.update();
      gsap
        .timeline({
          paused: false,
          defaults: { duration: 2.23 },
        })
        .to(".overlay", { opacity: 0 })
        .then(() => {
          loading.value = false;
          falling.fadeOut(0.05);
          stand.reset().fadeIn(0.05).play();
          currentAction = stand;
        });
      // loadingBarElement.value.style.transform = "";
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
      const progressRatio = itemsLoaded / itemsTotal;
      console.log("progressRatio :>> ", progressRatio);
      loadingBarElement.value.style.transform = `scaleX(${progressRatio})`;
    },
    () => {
      console.log("error");
    }
  );
  loadResources(loadingManager, THREE, MeshBVH, (data) => {
    console.log("data :>> ", data);
    player = data.player;
    Map = data.Map;
    collider = data.collider;
    houses = data.houses;
    buyArea = data.buyArea;
    signs = data.signs;
    mapMixer = data.mapMixer;
    playerMixer = data.playerMixer;
    falling = data.falling;
    stand = data.stand;
    jumpForward = data.jumpForward;
    runing = data.runing;
    wallk = data.wallk;
    currentAction = data.currentAction;
  });

  render();

  return {
    loading,
    overlayElement,
    deviceType,
    loadingBarElement,
    houseDetails,
    house,
    celebrate,
    balance,
    interactHint,
    interact,
    reset,
    buyHouse,
    sellHouse,
    camera,
    controls,
    triggerRun,
    running,
    triggerJump,
  };
};

// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

// let gui;

// dat.gui
//   gui = new GUI();
//   gui.add(params, "firstPerson").onChange((v) => {
//     if (!v) {
//       camera.position
//         .sub(controls.target)
//         .normalize()
//         .multiplyScalar(10)
//         .add(controls.target);
//     }
//   });
// const physicsFolder = gui.addFolder("Player");
// physicsFolder.add(params, "physicsSteps", 0, 30, 1);
// physicsFolder.add(params, "gravity", -100, 100, 0.01).onChange((v) => {
//   params.gravity = parseFloat(v);
// });
// physicsFolder.add(params, "playerSpeed", 1, 20);
// physicsFolder.open();

// gui.add(params, "reset");
// gui.open();

// const params = {
//   firstPerson: false,

//   displayCollider: false,
//   displayBVH: false,
//   visualizeDepth: 50,
//   gravity: -30,
//   playerSpeed: 10,
//   physicsSteps: 20,

//   reset: reset,
//   // Ray Params
//   raycasters: {
//     count: 150,
//   },
// };

// let stand = null;
// let wallk = null;
// let runing = null;
// let backward = null;
// let leftwallk = null;
// let rightwallk = null;
// let falling = null;
// let jumpForward = null;
// let jumpBackward = null;
