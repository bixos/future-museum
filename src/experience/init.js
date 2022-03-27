import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const ENTIRE_SCENE = 0,
  BLOOM_SCENE = 1;

export default (THREE, OrbitControls) => {
  const bloomLayer = new THREE.Layers();
  bloomLayer.set(BLOOM_SCENE);
  const params = {
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: 0,
    enableSSR: true,
    autoRotate: true,
    otherMeshes: true,
    groundReflector: true,
  };
  const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
  const materials = {};

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    // alpha: true,
  });
  document.body.appendChild(renderer.domElement);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // renderer.toneMapping = THREE.ReinhardToneMapping;
  // renderer.toneMappingExposure = 1;

  /**
   * Scene Setup
   */
  const scene = new THREE.Scene();

  /**
   * Camera Setup
   */
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.01,
    500
  );

  camera.far = 500;
  camera.updateProjectionMatrix();
  camera.position.set(-200, 25, -200);
  camera.lookAt(scene.position);
  scene.add(camera);

  const light1 = new THREE.AmbientLight(0xffffff, 2);
  light1.name = "ambient_light";
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0x2bffff, 1 * Math.PI);
  light2.position.set(0, 1, 0); // ~60º
  light2.name = "main_light";
  scene.add(light2);

  let clock = new THREE.Clock();

  function darkenNonBloomed(obj) {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
      materials[obj.uuid] = obj.material;
      obj.material = darkMaterial;
    }
  }

  function restoreMaterial(obj) {
    if (materials[obj.uuid]) {
      obj.material = materials[obj.uuid];
      delete materials[obj.uuid];
    }
  }

  const cubeTextureLoader = new THREE.CubeTextureLoader();
  cubeTextureLoader.load(
    [
      "/environmentMaps/Standard-Cube-Map/px.png",
      "/environmentMaps/Standard-Cube-Map/nx.png",
      "/environmentMaps/Standard-Cube-Map/py.png",
      "/environmentMaps/Standard-Cube-Map/ny.png",
      "/environmentMaps/Standard-Cube-Map/pz.png",
      "/environmentMaps/Standard-Cube-Map/nz.png",
    ],
    (environmentMapTexture) => {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      const envMap = pmremGenerator.fromEquirectangular(
        environmentMapTexture
      ).texture;
      pmremGenerator.dispose();
      scene.environment = envMap;
      scene.background = environmentMapTexture;
    }
  );

  scene.add(new THREE.AmbientLight(0x404040));

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);
  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
      },
      vertexShader: document.getElementById("vertexshader").textContent,
      fragmentShader: document.getElementById("fragmentshader").textContent,
      defines: {},
    }),
    "baseTexture"
  );
  finalPass.needsSwap = true;

  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(finalPass);

  /**
   * Controls
   */

  window.addEventListener(
    "resize",
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      bloomComposer.setSize(window.innerWidth, window.innerHeight);
      finalComposer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );
  renderer.capabilities.maxTextureSize / 4;

  return {
    renderer,
    camera,
    scene,
    clock,
    bloomComposer,
    finalComposer,
    darkenNonBloomed,
    restoreMaterial,
  };
};
