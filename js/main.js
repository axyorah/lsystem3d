// imports
import * as THREE from 'three';
import LSystem from './lsystem/LSystem';
import { Setup } from './setup';
import { GUI } from './gui';
import { getGrid, getSkybox } from './background';

// DOM
const container = document.querySelector('#container');

// constants
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

// globals
let scene;
const lsys = new LSystem();
const clock = new THREE.Clock();
const setup = new Setup(CANVAS_WIDTH, CANVAS_HEIGHT); // setup camera, renderer and cameraControls
const gui = new GUI(lsys);

function fillScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xa030f0, 50, 90);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0x555555);

    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(-500, 0, 500);
    light1.castShadow = true;

    const light2 = new THREE.DirectionalLight(0xffffff, 0.6);
    light2.position.set(0, 0, 500);
    light2.castShadow = true;

    scene.add(ambientLight);
    scene.add(light1);
    scene.add(light2);

    // SKYBOX
    scene.background = getSkybox();

    // GROUND
    const ground = getGrid();
    scene.add(ground);

    // LSYSTEM
    scene.add(lsys.obj);
}

function addToDOM() {
    // there should only be one canvas - current renderer.domElement
    const canvas = container.getElementsByTagName('canvas');
    if (canvas.length > 0) {
        container.removeChild(canvas[0]);
    }
    container.prepend(setup.renderer.domElement); // prepending, so that gui is on top
}

function render() {
    let delta = clock.getDelta();
    setup.cameraControls.update(delta);

    setup.renderer.render(scene, setup.camera);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

window.addEventListener('resize', () => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    setup.camera.aspect = canvasRatio;
    setup.camera.updateProjectionMatrix();
    setup.renderer.setSize(canvasWidth, canvasHeight);
});

// run all
function main() {
    // connect gui
    gui.connect();

    fillScene(); // lights and shell are added here
    addToDOM(); // adds rendered scene back to html
    animate(); // updates frames when camera changes position or controls are toggled
}

main();
