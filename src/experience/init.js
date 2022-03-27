export default (THREE, OrbitControls) => {
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
    50000
  );

  camera.far = 50000;
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

  /**
   * Controls
   */

  window.addEventListener(
    "resize",
    () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );
  renderer.capabilities.maxTextureSize / 4;

  return {
    renderer,
    camera,
    scene,
    clock,
  };
};
