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
  document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  /**
   * Scene Setup
   */
  const scene = new THREE.Scene();
  // scene.fog = new THREE.Fog(0xcccccc, 400, 0);
  /**
   * Lights
   */
  const light = new THREE.DirectionalLight(0xfdfbd3, 1, 100);
  light.position.set(0, 1, 0);
  light.position.multiplyScalar(50);
  light.shadow.camera.far = 90;
  light.shadow.mapSize.set(1024, 1024);
  light.shadowMapWidth = light.shadowMapHeight = 1024 * 2;
  light.castShadow = true;
  light.shadowCameraLeft = -200;
  light.shadowCameraRight = 200;
  light.shadowCameraTop = 150;
  light.shadowCameraBottom = -300;
  light.shadowBias = -0.0001;
  light.shadowDarkness = 3.5;
  light.shadow.normalBias = 0.5;
  scene.add(light);

  var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
  hemiLight.color.setHSL(0.6, 0.75, 0.5);
  hemiLight.groundColor.setHSL(0.095, 0.5, 0.5);
  hemiLight.position.set(0, 500, 0);
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

  camera.far = 400;
  camera.updateProjectionMatrix();
  window.camera = camera;

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

  return { renderer, camera, scene, controls, clock };
};
