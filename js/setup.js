import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

export class Setup {
    constructor(w, h) {
        this.w = w; // canvas width
        this.h = h; // canvas height
        this.camera = this._setCamera();
        this.renderer = this._setRenderer();
        this.cameraControls = this._setCameraControls();
    }

    _setCamera() {
        const ratio = this.w / this.h;
        const camera = new THREE.PerspectiveCamera(40, ratio, 1, 10000);
        camera.position.set(0, 7, 40); // 30?
        return camera;
    }

    _setRenderer() {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(this.w, this.h);
        renderer.domElement.setAttribute('id', 'renderer');
        renderer.setClearColorHex;
        return renderer;
    }

    _setCameraControls() {
        if (!this.camera) {
            throw new Error('Cannot set camera controls, camera is not set');
        }
        if (!this.renderer) {
            throw new Error('Cannot set camera controls, renderer is not set');
        }
        const cameraControls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        cameraControls.target.set(0, 9, -5);
        return cameraControls;
    }
}
