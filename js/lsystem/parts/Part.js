import * as THREE from 'three';
import { makeAxes } from '../../utils';

export default class Part {
    constructor(
        len = 1,
        wid = 0.5,
        dep = 0.5,
        color = '#ff0000',
        visibleAxes = false
    ) {
        this._len0 = len;
        this._wid0 = wid;
        this._dep0 = dep;

        this._len = len;
        this._wid = wid;
        this._dep = dep;

        this._color = color;

        this.mat; // material
        this.capsule; // THREE.Object3D which contains mesh(es) of the actual part
        this.axes; // axes that show part's orientation (needed for aligning the object to vectors)
        this.obj; // capsule + axes (use this to rescale/reposition/reorient)

        this._create(visibleAxes); // set
    }

    get set() {
        return new PartBuilder();
    }

    get len0() {
        return this._len0;
    }
    get wid0() {
        return this._wid0;
    }
    get dep0() {
        return this._dep0;
    }
    get len() {
        return this._len;
    }
    get wid() {
        return this._wid;
    }
    get dep() {
        return this._dep;
    }
    get scale() {
        return [
            this._wid / this._wid0,
            this._len / this._len0,
            this._dep / this._dep0,
        ];
    }

    get roll() {
        return this._roll;
    }
    get pitch() {
        return this._pitch;
    }
    get yaw() {
        return this._yaw;
    }

    get color() {
        return this._color;
    }

    get position() {
        return this.obj.position.clone();
    }

    get orientation() {
        return this.obj.quaternion.clone();
    }

    // axes getter: (ax.position - capsule.position) normalized
    get fwd() {
        // get branch's 'fwd' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive y-axis at default branch orientation)
        let fwdPos = new THREE.Vector3();
        this.axes.children[0].getWorldPosition(fwdPos);
        return fwdPos
            .add(this.capsule.position.clone().multiplyScalar(-1))
            .normalize();
    }

    get top() {
        // get branch's 'top' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive z-axis at default branch orientation)
        let topPos = new THREE.Vector3();
        this.axes.children[1].getWorldPosition(topPos);
        return topPos
            .add(this.capsule.position.clone().multiplyScalar(-1))
            .normalize();
    }

    get side() {
        // get branch's 'side' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive x-axis at default branch orientation)
        let sidePos = new THREE.Vector3();
        this.axes.children[2].getWorldPosition(sidePos);
        return sidePos
            .add(this.capsule.position.clone().multiplyScalar(-1))
            .normalize();
    }

    set wid(val) {
        this._wid = val;
        this.obj.scale.set(val / this._wid0, 1, 1);
    }
    set len(val) {
        this._len = val;
        this.obj.scale.set(1, val / this._len0, 1);
    }
    set dep(val) {
        this._dep = val;
        this.obj.scale.set(1, 1, val / this._dep0);
    }
    set scale(args) {
        const [x, y, z] = args;
        this._wid = x * this._wid0;
        this._len = y * this._len0;
        this._dep = z * this._dep0;
        this.obj.scale.set(x, y, z);
    }
    set color(val) {
        this._color = val;
        this.capsule.children.map((primitive) =>
            primitive.material.color.set(val)
        );
    }

    set position(val) {
        if (!(val instanceof THREE.Vector3)) {
            throw new TypeError(
                `Argument for 'Turtle.moveTo' should be of type 'THREE.Vector3' but got ${val}`
            );
        }
        this.obj.position.set(val.x, val.y, val.z);
    }

    set orientation(val) {
        if (!(val instanceof THREE.Quaternion)) {
            throw TypeError(
                `Argument for 'Turtle.orientation' should be of type 'THREE.Quaternion' but got ${val}`
            );
        }
        this.obj.setRotationFromQuaternion(val);
    }

    _create(visibleAxes) {
        // capsule
        this.capsule = new THREE.Object3D();

        // axes
        this.axes = makeAxes(visibleAxes);

        // combine capsule + axes into final object
        this.obj = new THREE.Object3D();
        this.obj.add(this.capsule);
        this.obj.add(this.axes);
        this.obj.name = 'part';
        return this.obj;
    }

    static create(
        len = 1,
        wid = 0.5,
        dep = 0.5,
        color = '#ff0000',
        visibleAxes = false
    ) {
        return new Part(len, wid, dep, color, visibleAxes);
    }

    /**
     * creates a new part with geometry, color, position and orientation
     * copied from the reference and scaled based on the `lvl`
     * ("distance" from lsystem root)
     * @param {*} ref [Part] instance of `Part` class used as a reference
     * @param {*} lvl [number] indicates "distance" from lsystem root
     */
    static copy(ref) {
        return new Part(ref.len, ref.wid, ref.dep, ref.color, ref.visibleAxes);
    }

    /**
     * updates 'this' part geometry, color, position and orientation
     * based from `ref` and scales it based on `lvl` ("distance" from lsystem root)
     * @param {*} ref [Part] instance of `Part` class used as a reference
     * @param {*} lvl [number] indicates "distance" from lsystem root
     */
    update(ref, lvl = 0) {
        throw new Error('Not implemented');
    }

    moveTo(position) {
        // move branch to a specified position (THREE.Vector3)
        if (!(position instanceof THREE.Vector3)) {
            throw new TypeError(
                `Argument of 'moveTo' should be of type 'THREE.Vector3' but got ${position}`
            );
        }
        this.obj.position.set(position.x, position.y, position.z);
    }

    orient(quaternion) {
        // orient branch as specified by the quaternion (THREE.Quaternion);
        if (!(quaternion instanceof THREE.Quaternion)) {
            throw TypeError(
                `Argument for 'orient' should be of type 'THREE.Quaternion' but got ${quaternion}`
            );
        }
        this.obj.setRotationFromQuaternion(quaternion);
    }

    rescale(x, y, z) {
        // rescale the part to fit new dimensions
        this.obj.scale.set(x / this._wid0, y / this._len0, z / this._dep0);
    }

    recolor(color) {
        // recolor the object
        // (assumed that THREE.Mesh objects are stored in this.capsule)
        this.capsule.children.map((primitive) =>
            primitive.material.color.set(color)
        );
    }
}

export class PartBuilder {
    constructor() {
        this.wid = 1;
        this.len = 1;
        this.dep = 1;
        this.col = '#ff0000';
    }

    width(wid) {
        this.wid = wid;
    }

    length(len) {
        this.len = len;
    }

    depth(dep) {
        this.dep = dep;
    }

    color(col) {
        this.col = col;
    }

    build() {
        return new Part(this.wid, this.len, this.dep, this.color);
    }
}
