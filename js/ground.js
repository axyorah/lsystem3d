import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

export function getGrid() {
    const size = 100;
    const divisions = 100;

    return new THREE.GridHelper(size, divisions, 0x49e6ff, 0x49e6ff);
}

export function addFloatingRocktToScene(scene) {
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    loader.load(
        '../imgs/ground/floating-rock.glb',
        function (gltf) {
            gltf.scene.traverse(function (obj) {
                if (obj instanceof THREE.Mesh) {
                    textureLoader.load(
                        '../imgs/ground/floating-rock.png',
                        function (texture) {
                            texture.flipY = false;
                            obj.material = new THREE.MeshBasicMaterial({
                                map: texture,
                            });
                        }
                    );
                    obj.name = 'floating-rock';
                }
            });

            gltf.name = 'floating-rock-glb';
            gltf.scene.name = 'floating-rock-scene';

            gltf.scene.position.set(0, -1, 0);
            gltf.scene.scale.set(5, 5, 5);
            scene.add(gltf.scene);
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );
}
