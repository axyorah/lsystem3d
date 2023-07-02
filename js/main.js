let camera, scene, renderer, cameraControls, skyTexture;
let turtle, lsys;
const clock = new THREE.Clock();
const container = document.querySelector("#container");

function getSkybox() {

    const loader = new THREE.CubeTextureLoader();
    loader.setPath( '../imgs/skybox/' );

    const textureCube = loader.load( [
	    'px.png', 'nx.png',
	    'py.png', 'ny.png',
	    'pz.png', 'nz.png'
    ] );

    return textureCube;
}

function fillScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xA030F0, 50, 90);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0x555555);

    const light1 = new THREE.DirectionalLight(0xFFFFFF, 1);
    light1.position.set(-500, 0, 500);
    light1.castShadow = true;

    const light2 = new THREE.DirectionalLight(0xFFFFFF, 0.6);
    light2.position.set(0, 0, 500);
    light2.castShadow = true;

    scene.add(ambientLight);
    scene.add(light1);
    scene.add(light2);

    // SKYBOX
    scene.background = skyTexture;

    // GROUND
    const ground = getGrid();
    scene.add(ground);
    //addFloatingRocktToScene( scene ); // alternatively place a floating rock underneath the plant

    // LSYSTEM
    lsys = new LSys();
    scene.add( lsys.obj );

}

function setRenderer(w, h) {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.domElement.setAttribute("id", "renderer");
    renderer.setClearColorHex;
}

function setCamera(ratio) {
    camera = new THREE.PerspectiveCamera(40, ratio, 1, 10000);
    camera.position.set(0, 7, 40); // 30?
}

function setControls() {
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 9, -5);
}

function init() {
    skyTexture = getSkybox();

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    setRenderer(canvasWidth, canvasHeight);
    setCamera(canvasRatio);
    setControls();
}

function addToDOM() {
    // there should only be one canvas - current renderer.domElement
    const canvas = container.getElementsByTagName("canvas");
    if (canvas.length > 0) {
        container.removeChild(canvas[0]);
    }
    container.prepend(renderer.domElement); // prepending, so that gui is on top
}

function render() {

    let delta = clock.getDelta();
    cameraControls.update(delta);

    renderer.render(scene, camera);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

window.addEventListener('resize', () => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    camera.aspect = canvasRatio; 
    camera.updateProjectionMatrix();
    renderer.setSize(canvasWidth, canvasHeight); 
});

// run all
function main() {
    init();      // sets up camera, controls and renderer, as well as preloads all textures
    fillScene(); // lights and shell are added here
    addToDOM();  // adds rendered scene back to html
    animate();   // updates frames when camera changes position or controls are toggled    
}

main();