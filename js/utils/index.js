import * as THREE from 'three';

export function makeUnitLine() {
    // returns red vertical unit line
    const points = [
        new THREE.Vector3(0, -0.5, 0),
        new THREE.Vector3(0, 0.5, 0),
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    return new THREE.Line(geometry, material);
}

export function makeAxes(visible = false) {
    // create axes object (THREE.Object3D) containing initial fwd, top and side axes (each is THREE.Line)
    const fwd = makeUnitLine();
    fwd.position.set(0, 1, 0);
    fwd.name = 'fwd';

    const top = makeUnitLine();
    top.rotateX(Math.PI / 2);
    top.position.set(0, 0.5, 0.5);
    top.material.color.set(0x0000ff);
    top.name = 'top';

    const side = makeUnitLine();
    side.rotateZ(Math.PI / 2);
    side.position.set(0.5, 0.5, 0);
    side.material.color.set(0x00ff00);
    side.name = 'side';

    const axes = new THREE.Object3D();
    axes.add(fwd);
    axes.add(top);
    axes.add(side);
    axes.name = 'axes';
    axes.visible = visible;

    return axes;
}

export class Capsule {
    constructor(height, width, ratio, color, namePrefix = '') {
        this.height = height || 1;
        this.width = width || 1;
        this.ratio = ratio || 1;
        this.color = color = '#ff0000';
        this.namePrefix = namePrefix;

        // set material
        this.material = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 20,
        });

        // get branch cylinder
        const cylinder = this._getCylinder();
        cylinder.position.set(0, this.height / 2, 0);

        // get spherical branch edges (so that the final branch looks like a capsule)
        const sphereLower = this._getSphere(this.width, 'lower');
        sphereLower.position.set(0, 0, 0);

        const sphereUpper = this._getSphere(this.width * this.ratio, 'upper');
        sphereUpper.position.set(0, this.height, 0);

        // combine cylinder + 2 spheres into a capsule
        const capsule = new THREE.Object3D();
        capsule.add(cylinder);
        capsule.add(sphereLower);
        capsule.add(sphereUpper);
        capsule.name = `${namePrefix}${namePrefix ? '-' : ''}capsule`;

        return capsule;
    }

    _getCylinder() {
        const cylinderGeo = new THREE.CylinderGeometry(
            this.width * this.ratio,
            this.width,
            this.height,
            8
        );
        const cylinder = new THREE.Mesh(cylinderGeo, this.material);
        cylinder.name = `${this.namePrefix}${
            this.namePrefix ? '-' : ''
        }cylinder`;

        cylinder.castShadow = true;

        return cylinder;
    }

    _getSphere(diameter, name) {
        const sphereGeo = new THREE.SphereGeometry(diameter, 8, 8);
        const sphere = new THREE.Mesh(sphereGeo, this.material);
        sphere.name = `${this.namePrefix}${
            this.namePrefix ? '-' : ''
        }${name}-edge`;

        return sphere;
    }
}
