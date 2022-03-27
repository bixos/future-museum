import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export default (loadingManager, THREE, MeshBVH, fn) => {
  const dracoLoader = new DRACOLoader(loadingManager);
  dracoLoader.setDecoderPath("/draco/");
  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load("/models/spacemuseum.glb", (mapGLTF) => {
    /**
     * Map Setup
     */
    const Map = mapGLTF.scene;
    let mars = null;
    Map.scale.setScalar(20);
    Map.updateMatrixWorld(true);

    const geometries = [];
    Map.traverse((c) => {
      /**
       * Map Shadow Setup & save important 3Dobjects
       */
      c.castShadow = true;
      c.receiveShadow = true;
      if (c.name.indexOf("MARS") !== -1) {
        c.roughness = 1;
        c.lightMapIntensity = 0;
        mars = c;
        console.log("mars :>> ", mars);
      }
      if (
        c.name.indexOf("Cube024") !== -1 ||
        c.name.indexOf("Cube020") !== -1 ||
        c.name.indexOf("Cube017") !== -1 ||
        c.name.indexOf("Cube016") !== -1 ||
        (c.parent && c.parent.name.indexOf("Cube024") !== -1) ||
        (c.parent && c.parent.name.indexOf("Cube020") !== -1) ||
        (c.parent && c.parent.name.indexOf("Cube017") !== -1) ||
        (c.parent && c.parent.name.indexOf("Cube016") !== -1)
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
      const anim = mapMixer.clipAction(mapGLTF.animations[index]);
      if (
        mapGLTF.animations[index].name.indexOf("Cube.024") !== -1 ||
        mapGLTF.animations[index].name.indexOf("Cube.020") !== -1 ||
        mapGLTF.animations[index].name.indexOf("Cube.017") !== -1 ||
        mapGLTF.animations[index].name.indexOf("Cube.016") !== -1
      ) {
        anim.timeScale *= 3;
        anim.clampWhenFinished = true;
        anim.loop = THREE.LoopOnce;
      }
      if (mapGLTF.animations[index].name.indexOf("Sphere") === -1) anim.play();
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
                mapMixer,
                gltfLoader,
                fallingFbx,
                BreathingIdleFbx,
                RunningFbx,
                JumpFbx,
                WalkingFbx,
                mars,
              });
            });
          });
        });
      });
    });
  });
};
