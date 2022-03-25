import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

export default (THREE, OrbitControls) => {
  /**
   * Renderer Setup
   */

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /**
   * Scene Setup
   */
  const scene = new THREE.Scene();

  const cubeTextureLoader = new THREE.CubeTextureLoader();
  const environmentMap = cubeTextureLoader.load([
    "/environmentMaps/Standard-Cube-Map/px.png",
    "/environmentMaps/Standard-Cube-Map/nx.png",
    "/environmentMaps/Standard-Cube-Map/py.png",
    "/environmentMaps/Standard-Cube-Map/ny.png",
    "/environmentMaps/Standard-Cube-Map/pz.png",
    "/environmentMaps/Standard-Cube-Map/nz.png",
  ]);
  scene.background = environmentMap;
  // scene.fog = new THREE.Fog(0xcccccc, 400, 0);
  /**
   * Lights
   */
  const light = new THREE.DirectionalLight(0xfdfbd3, 1);
  light.position.set(0, 50, 0);
  light.shadow.mapSize.set(1024 * 8, 1024 * 8);
  light.shadow.mapSize.width = light.shadow.mapSize.height = 1024 * 8;
  light.castShadow = true;
  light.shadow.camera.far = 1000;
  light.shadow.camera.left = -1000;
  light.shadow.camera.right = 1000;
  light.shadow.camera.top = 1000;
  light.shadow.camera.bottom = -1000;
  light.shadow.bias = -0.0001;
  // light.shadow.normalBias = 0.5;
  scene.add(light);

  var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
  hemiLight.color.setHSL(0.6, 0.75, 0.5);
  hemiLight.groundColor.setHSL(0.095, 0.5, 0.5);

  scene.add(hemiLight);

  /**
   * Camera Setup
   */
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    50
  );

  camera.far = 450000;
  camera.updateProjectionMatrix();
  window.camera = camera;

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
  let water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "/textures/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x00a3e0,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;
  water.position.y = -19;

  scene.add(water);

  // // Add Sky
  // let sky = new Sky();
  // sky.scale.setScalar(2000);
  // scene.add(sky);

  // let sun = new THREE.Vector3();

  // /// GUI

  // const effectController = {
  //   turbidity: 5,
  //   rayleigh: 2,
  //   mieCoefficient: 0.001,
  //   mieDirectionalG: 0.7,
  //   elevation: 30,
  //   azimuth: 0,
  //   exposure: 0.7,
  // };

  // function guiChanged() {
  //   const uniforms = sky.material.uniforms;
  //   uniforms["turbidity"].value = effectController.turbidity;
  //   uniforms["rayleigh"].value = effectController.rayleigh;
  //   uniforms["mieCoefficient"].value = effectController.mieCoefficient;
  //   uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

  //   const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
  //   const theta = THREE.MathUtils.degToRad(effectController.azimuth);

  //   sun.setFromSphericalCoords(1, phi, theta);

  //   uniforms["sunPosition"].value.copy(sun);

  //   renderer.toneMappingExposure = effectController.exposure;
  //   renderer.render(scene, camera);

  //   const pmremGenerator = new THREE.PMREMGenerator(renderer);

  //   sun.setFromSphericalCoords(1, phi, theta);

  //   sky.material.uniforms["sunPosition"].value.copy(sun);
  //   water.material.uniforms["sunDirection"].value.copy(sun).normalize();

  //   scene.environment = pmremGenerator.fromScene(sky).texture;
  // }

  // guiChanged();

  // const skyUniforms = sky.material.uniforms;

  // skyUniforms["turbidity"].value = 10;
  // skyUniforms["rayleigh"].value = 1;
  // skyUniforms["mieCoefficient"].value = 0.005;
  // skyUniforms["mieDirectionalG"].value = 0;

  // const parameters = {
  //   elevation: 30,
  //   azimuth: 0,
  // };

  // const pmremGenerator = new THREE.PMREMGenerator(renderer);

  // function updateSun() {
  //   const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
  //   const theta = THREE.MathUtils.degToRad(parameters.azimuth);

  //   sun.setFromSphericalCoords(1, phi, theta);

  //   sky.material.uniforms["sunPosition"].value.copy(sun);
  //   water.material.uniforms["sunDirection"].value.copy(sun).normalize();

  //   scene.environment = pmremGenerator.fromScene(sky).texture;
  // }

  // updateSun();

  // const gui = new GUI();

  // const folderSky = gui.addFolder("Sky");
  // folderSky.add(parameters, "elevation", 0, 90, 0.1).onChange(updateSun);
  // folderSky.add(parameters, "azimuth", -180, 180, 0.1).onChange(updateSun);
  // folderSky.open();

  const waterUniforms = water.material.uniforms;
  waterUniforms.size.value = 1;

  // const folderWater = gui.addFolder("Water");
  // folderWater
  //   .add(waterUniforms.distortionScale, "value", 0, 8, 0.1)
  //   .name("distortionScale");
  // folderWater.add(waterUniforms.size, "value", 0.1, 10, 0.1).name("size");
  // folderWater.open();

  let clock = new THREE.Clock();

  /**
   * Controls
   */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;

  window.addEventListener(
    "resize",
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );

  return { renderer, camera, scene, controls, clock, water };
};
