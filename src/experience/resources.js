import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import housesData from "../houses";

export default (loadingManager, THREE, MeshBVH, fn) => {
  const dracoLoader = new DRACOLoader(loadingManager);
  dracoLoader.setDecoderPath("/draco/");
  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load("/models/palmmap2.glb", (mapGLTF) => {
    /**
     * Map Setup
     */
    const Map = mapGLTF.scene;

    Map.scale.setScalar(20);
    Map.updateMatrixWorld(true);

    const geometries = [];
    const houses = [];
    const buyArea = [];
    const signs = [];
    Map.traverse((c) => {
      /**
       * Map Shadow Setup & save important 3Dobjects
       */
      c.castShadow = true;
      c.receiveShadow = true;
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
      /**
       * Get Geometries
       */
      if (
        c.name.indexOf("cloud") !== -1 ||
        (c.parent && c.parent.name.indexOf("cloud") !== -1)
      ) {
        Map.remove(c);
      }
      if (
        c.name.indexOf("ocean") !== -1 ||
        c.name.indexOf("cloud") !== -1 ||
        c.name.indexOf("area") !== -1 ||
        c.name.indexOf("token") !== -1 ||
        (c.parent && c.parent.name.indexOf("area") !== -1) ||
        (c.parent && c.parent.name.indexOf("token") !== -1)
      ) {
        return;
      } else if (c.geometry) {
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
      maxDepth: 60,
    });

    const collider = new THREE.Mesh(mergedGeometry);

    /**
     * Play Map Animations
     */
    const mapMixer = new THREE.AnimationMixer(Map);
    for (let index = 0; index < mapGLTF.animations.length; index++) {
      let animationName = mapGLTF.animations[index].name;
      if (
        animationName.indexOf("buy") === -1 &&
        animationName.indexOf("circle") === -1 &&
        animationName.indexOf("circle") === -1
      ) {
        const anim = mapMixer.clipAction(mapGLTF.animations[index]);
        // anim.timeScale *= 20;
        anim.play();
      }
    }

    var fbxLoader = new FBXLoader(loadingManager);
    fbxLoader.load("/avatar/FallingIdle.fbx", (fallingFbx) => {
      fbxLoader.load("/avatar/BreathingIdle.fbx", (BreathingIdleFbx) => {
        fbxLoader.load("/avatar/Running.fbx", (RunningFbx) => {
          fbxLoader.load("/avatar/Jump.fbx", (JumpFbx) => {
            fbxLoader.load("/avatar/Walking.fbx", (WalkingFbx) => {
              BreathingIdleFbx.animations[0].name = "stand";
              fallingFbx.animations[0].name = "falling";
              RunningFbx.animations[0].name = "running";
              JumpFbx.animations[0].name = "jumpForward";
              WalkingFbx.animations[0].name = "walking";
              fn({
                Map,
                collider,
                houses,
                buyArea,
                signs,
                mapMixer,
                gltfLoader,
                fallingFbx,
                BreathingIdleFbx,
                RunningFbx,
                JumpFbx,
                WalkingFbx,
              });
            });
          });
        });
      });
    });
  });
};
