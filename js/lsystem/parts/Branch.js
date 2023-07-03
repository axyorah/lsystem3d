/**
 * Branch wrapper for a THREE.Object3D with some handy methods.
 * `this.obj` is a THREE.Object3D() with name `branch` and the following structure:
 *  ```
 * 'branch' (THREE.Object3D())
 *   |-- 'branch-capsule' (THREE.Object3D())
 *   |     |-- 'branch-cylinder' (THREE.Mesh) oriented along y-axis
 *   |     |-- 'branch-edge-low' [sphere] (THREE.Mesh)
 *   |     +-- 'branch-edge-high' [sphere] (THREE.Mesh)
 *   | 
 *   +-- 'axes' (THREE.Object3D())
 *         |-- 'fwd' (THREE.Line)
 *         |-- 'top' (THREE.Line)
 *         +-- 'side' (THREE.Line)
 *   ```
 * 
 *  - branch's core is not a "true" cylinder, but rather a bisected cone
 *  - in default state branch is oriented 'along' the y-axis
 *  - branch object's (0,0,0) is at the center of its "lower" edge (lower in default state)
 */
class Branch extends Part {
    constructor( len=1., wid=0.1, color='#FFAA00', ratio=1., visibleAxes=false) {
        super( len, wid, wid, color, visibleAxes );
        this._ratio = ratio;
        this._create(visibleAxes);
    }

    get set() {
        return new BranchBuilder();
    }

    get ratio() { return this._ratio; }

    get color() { return this._color; }

    set ratio(val) {
        // change branch's top-to-bottom width ratio
        // recall: branch's core is not a "true" cylinder, but rather a bisected cone 
        // with bottom base larger than the upper base;
        // when top-to-bottom base ratio is changed we need to 
        // replace cylinder geometry and rescale the top sphere

        this._ratio = val;
        const capsule = this.obj.children[0];
        const [cylinder, sphere1, sphere2] = capsule.children;

        // replace cylinder geometry entirely...
        cylinder.geometry = new THREE.CylinderGeometry(this.wid * val, this.wid, this.len, 8);

        // rescale top sphere
        sphere2.geometry = new THREE.SphereGeometry(this.wid * val);
    }

    set color (val) {
        this._color = val;
        const segments = this.obj.children;
        segments.forEach((segment) => {
            if (segment.name !== 'branch-capsule') {
                return;
            }

            segment.children.forEach((primitive) => {
                primitive.material.color.set(val);
            })
        });
    }

    get scale() {
        return super.scale;
    }

    set scale (xyz) {
        const [x, y, z] = xyz;
        const cylinder = this.obj.children[0].children[0];
        const sphere1 = this.obj.children[0].children[1];
        const sphere2 = this.obj.children[0].children[2];
        
        cylinder.scale.set(x, y, z);
        sphere1.scale.set(x, x, z);
        sphere2.scale.set(x, x, z);
    }

    makeCapsule() {
        return new Capsule(this.len, this.wid, this.ratio, this.color, 'branch');
    }

    rescale( x, y, z ) {
        // rescale the branch to fit new dimensions:
        // x, y, z - are new width, length and depth
        // recall: in default state branch is oriented 'along' the y-axis
        // To rescale branch we could do something like:
        //     this.obj.scale.set( x / this.wid0, y / this.len0, z / this.wid0 );
        // but this distorts the edges;
        // we want the edges to remain perfect spheres at all scales,
        // so we rescale spheres and cylinder separately

        const branch = this.obj;

        const cylinder = branch.children[0].children[0];
        const sphere1 = branch.children[0].children[1];
        const sphere2 = branch.children[0].children[2];

        cylinder.scale.set( x / this.wid0, y / this.len0, z / this.wid0 );
        sphere1.scale.set( x / this.wid0, x / this.wid0, x / this.wid0 );
        sphere2.scale.set( x / this.wid0, x / this.wid0, x / this.wid0 );

        cylinder.position.set(0, y/2, 0);
        sphere2.position.set(0, y, 0);
    }

    _create(visibleAxes = false) {
        // branch capsule
        this.capsule = this.makeCapsule();

        // branch axes        
        this.axes = makeAxes( visibleAxes ); // defined in Part class

        // combine capsule + axes into final object
        this.obj = new THREE.Object3D();
        this.obj.add(this.capsule);
        this.obj.add(this.axes);
        this.obj.name = 'branch';
        return this.obj;
    }

    static create(len=1., wid=0.1, color=0xFFAA00, ratio=1., visibleAxes=false) {
        return new Branch(len, wid, color, ratio, visibleAxes);
    }

    static copy(ref, lvl=0) {
        // lvl indicates how "far" is branch from root;
        // if ratio is not 1 - it would affect the width (and in the future maybe len too)
        const wid = ref.wid * Math.pow(ref.ratio, lvl);
        const branch = new Branch(ref.len, wid, ref.color, ref.ratio, ref.visibleAxes);
        branch.color = ref.color; // this needs to be set explicitly... :/

        // set position and orientation
        branch.position = ref.position;
        branch.orientation = ref.orientation;
        return branch;
    }

    update(ref, lvl=0) {
        // Updates geometry (with rescale based on lvl), position and orientation
        // based to reference ref.
        // To rescale branch we could do something like:
        //     this.obj.scale.set( ref.wid / ref.wid0, ref.len / ref.len0, ref.wid / ref.wid0 );
        // but this distorts the edges;
        // we want the edges to remain perfect spheres at all scales,
        // so we deconstruct the capsule the scale individual parts separately
        const [cylinder, sphere1, sphere2] = this.obj.children[0].children;

        // udpate ratio
        this.ratio = ref.ratio;
        
        // change geometry for primitives
        // (for cylinder we need to redefine geometry, 
        // because its top and bottom can scale differently depending on ratio;
        // for spheres it's sufficient just to scale)
        cylinder.geometry = new THREE.CylinderGeometry(
            ref.wid * ref.ratio * Math.pow(ref.ratio, lvl), 
            ref.wid * Math.pow(ref.ratio, lvl), 
            ref.len, 
            8
        );
        // sphere1.geometry = new THREE.SphereGeometry(ref.wid * Math.pow(ref.ratio, lvl), 8);
        // sphere2.geometry = new THREE.SphereGeometry(ref.wid * ref.ratio * Math.pow(ref.ratio, lvl), 8);
        const scale = ref.wid / this.wid * Math.pow(this.ratio, lvl);
        sphere1.scale.set(scale, scale, scale);        
        sphere2.scale.set(scale, scale, scale);

        // rearrange primitives within this.obj
        cylinder.position.set(0, ref.len/2, 0);
        sphere2.position.set(0, ref.len, 0);

        // update color
        this.color = ref.color;

        // update position and orientation
        this.position = ref.position;
        this.orientation = ref.orientation;
    }
}

class BranchBuilder {
    constructor() {
        this._len = 1.;
        this._wid = 1.;
        this._dep = 1.;
        this._col = '#ff0000';
        this._rat = 1.;
        this._visibleAces = false;
    }

    length(val) {
        this._len = val;
        return this;
    }

    width(val) {
        this._wid = val;
        return this;
    }

    depth(val) {
        this._dep = val;
        return this;
    }

    color(val) {
        this._col = val;
        return this;
    }

    ratio(val) {
        this._rat = val;
        return this;
    }

    visibleAxes(val) {
        this._visibleAxes = val;
        return this;
    }

    build() {
        return new Branch(this._len, this._wid, this._col, this._rat, this._visibleAxes);
    }
}