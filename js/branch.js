class Branch extends Part {
    constructor( len=1., wid=0.1, color=0xFFAA00 ) {
        super( len, wid, 0.1, color );
        
        /* 
        // recall: Part class contains the following attributes:
        this._len0 = len;
        this._wid0 = wid;
        this._dep0 = dep; NOT USED FOR BRANCH

        this._len = len;
        this._wid = wid;
        this._dep = dep; NOT USED FOR BRANCH
        this._color = color;

        this.mat;  // material
        this.capsule; // THREE.Object3D which contains mesh(es) of the actual part
        this.axes; // axes that show part's orientation (needed for aligning the object to vectors)
        this.obj;  // capsule + axes (use this to rescale/reposition/reorient)

        // additionally, the following methods are available:
        getters for all non-THREE attributes (len, wid, color..)
        fwd() - part's forward axis TRHEE.Vector3
        top() - part's top axis THREE.Vector3
        side() - part's side axis THREE.Vector3
        makeUnitLine()
        makeAxes() 
        makeCapsule() <-- NEEDS TO BE OVERWRITTEN!
        makePart() <-- REPLACED BY `makeBranch()`
        moveTo()
        orient()
        rescale() <-- NEEDS TO BE OVERWRITTEN
        recolor()
        */
    }

    makeCapsule() {
        // get branch cylinder
        this.mat = new THREE.MeshPhongMaterial( { color: this.color, shininess: 20, opacity: 1., transparent: false } );
        const cylinderGeo = new THREE.CylinderGeometry( this.wid, this.wid, this.len, 8);
        
        const cylinder = new THREE.Mesh( cylinderGeo, this.mat );
        cylinder.name = 'branch-cylinder';

        cylinder.position.set(0, this.len/2, 0);
        cylinder.castShadow = true;

        // get spherical branch edges (so that the final branch looks like a capsule)
        const sphereGeo = new THREE.SphereGeometry( this.wid, 8, 8);
        
        const sphereLow = new THREE.Mesh( sphereGeo, this.mat );
        sphereLow.name = 'branch-edge-low';
        sphereLow.position.set(0, 0, 0);
        
        const sphereHigh = new THREE.Mesh( sphereGeo, this.mat );
        sphereHigh.name = 'branch-edge-high'
        sphereHigh.position.set(0, this.len, 0);
        
        // combine cylinder + 2 spheres into a capsule (branch)
        const capsule = new THREE.Object3D();
        capsule.add(cylinder);
        capsule.add(sphereLow);
        capsule.add(sphereHigh);
        capsule.name = 'branch-capsule';

        return capsule
    }

    makeBranch( visibleAxes=false ) {
        // branch capsule
        this.capsule = this.makeCapsule();

        // branch axes        
        this.axes = this.makeAxes( visibleAxes ); // defined in Part class

        // combine capsule + axes into final object
        this.obj = new THREE.Object3D();
        this.obj.add(this.capsule);
        this.obj.add(this.axes);
        this.obj.name = 'branch';
        return this.obj;
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
        //   |     |-- 'branch-edge-high' [sphere] (THREE.Mesh)
        //   | 
        //   |-- 'axes' (THREE.Object3D())
        //         |-- 'fwd' (THREE.Mesh)
        //         |-- 'top' (THREE.Mesh)
        //         |-- 'side' (THREE.Mesh)
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
}