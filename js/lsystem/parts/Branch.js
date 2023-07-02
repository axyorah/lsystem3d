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
        const branch = this.obj;
        const capsule = branch.children[0];

        const cylinder = capsule.children[0];
        const sphere1 = capsule.children[1];
        const sphere2 = capsule.children[2];

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
        // branch is a THREE.Object3D() with the following structure:
        // 'branch' (THREE.Object3D())
        //   |-- 'branch-capsule' (THREE.Object3D())
        //   |     |-- 'branch-cylinder' (THREE.Mesh) oriented along y-axis
        //   |     |-- 'branch-edge-low' [sphere] (THREE.Mesh)
        //   |     +-- 'branch-edge-high' [sphere] (THREE.Mesh)
        //   | 
        //   +-- 'axes' (THREE.Object3D())
        //         |-- 'fwd' (THREE.Line)
        //         |-- 'top' (THREE.Line)
        //         |-- 'side' (THREE.Line)
        // To rescale branch we could do something like:
        //     this.obj.scale.set( x / this.wid0, y / this.len0, z / this.wid0 );
        // but this distorts the edges;
        // we want the edges to remain perfect spheres at all scales,
        // so we only rescale the cylinder

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

    static copy(part, lvl=0) {
        // lvl indicates how "far" is branch from root;
        // if ratio is not 1 - it would affect the width (and in the future maybe len too)
        const wid = part.wid * Math.pow(part.ratio, lvl);
        const branch = new Branch(part.len, wid, part.color, part.ratio, part.visibleAxes);
        branch.color = part.color; // this needs to be set explicitly... :/
        return branch;
    }

    update(part, lvl) {
        // Updates geometry (with rescale based on lvl), position and orientation
        // based to reference part.
        // To rescale branch we could do something like:
        //     this.obj.scale.set( part.wid / part.wid0, part.len / part.len0, part.wid / part.wid0 );
        // but this distorts the edges;
        // we want the edges to remain perfect spheres at all scales,
        // so we deconstruct the capsule the scale individual parts separately
        const [cylinder, sphere1, sphere2] = this.obj.children[0].children;
        
        // change geometry for primitives
        cylinder.geometry = new THREE.CylinderGeometry(
            part.wid * part.ratio * Math.pow(part.ratio, lvl), 
            part.wid * Math.pow(part.ratio, lvl), 
            part.len, 
            8
        );
        sphere1.geometry = new THREE.SphereGeometry(part.wid * Math.pow(part.ratio, lvl), 8);
        sphere2.geometry = new THREE.SphereGeometry(part.wid * this.ratio * Math.pow(part.ratio, lvl), 8);

        // rearrange primitives within this.obj
        cylinder.position.set(0, part.len/2, 0);
        sphere2.position.set(0, part.len, 0);

        // update color
        this.color = part.color;

        // update position and orientation
        this.position = part.position;
        this.orientation = part.orientation;
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
    }

    width(val) {
        this._wid = val;
    }

    depth(val) {
        this._dep = val;
    }

    color(val) {
        this._col = val;
    }

    ratio(val) {
        this._rat = val;
    }

    visibleAxes(val) {
        this._visibleAxes = val;
    }

    build() {
        return new Branch(this._len, this._wid, this._col, this._rat, this._visibleAxes);
    }
}