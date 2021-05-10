class Brancher {
    constructor( len=1., wid=0.1, color=0xFFAA00 ) {
        this._len0 = len;
        this._wid0 = wid;

        this._len = len;
        this._wid = wid;
        this._color = color;

        this.mat;  // branch material
        this.capsule; // actual branch mesh (cylinder geo + mat & 2 edge spheres geo + mat)
        this.axes; // axes that show branch orientation (needed for aligning the object to vectors)
        this.obj;  // capsule + axes (use this to rescale/reposition/reorient)
    }

    get len0() { return this._len0; }
    get wid0() { return this._wid0; }
    get len() { return this._len; }
    get wid() { return this._wid; }
    get color() { return this._color; }

    // axes getter: (ax.position - capsule.position) normalized
    get fwd() {
        // get branch's 'fwd' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive y-axis at default branch orientation)
        let fwdPos = new THREE.Vector3();
        this.axes.children[0].getWorldPosition(fwdPos);
        return fwdPos.add( this.capsule.position.clone().multiplyScalar( -1 ) ).normalize();
    }

    get top() {
        // get branch's 'top' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive z-axis at default branch orientation)
        let topPos = new THREE.Vector3();
        this.axes.children[1].getWorldPosition(topPos);
        return topPos.add( this.capsule.position.clone().multiplyScalar( -1 ) ).normalize();
    }

    get side() {
        // get branch's 'side' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive x-axis at default branch orientation)
        let sidePos = new THREE.Vector3();
        this.axes.children[2].getWorldPosition(sidePos);
        return sidePos.add( this.capsule.position.clone().multiplyScalar( -1 ) ).normalize();
    }

    makeUnitLine() {
        // returns red vertical unit line 
        const points = [new THREE.Vector3( 0, -0.5, 0 ), new THREE.Vector3( 0, 0.5, 0 )];
        
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const material = new THREE.LineBasicMaterial({ color: 0xFF0000 });

        return new THREE.Line( geometry, material );
    }

    makeAxes( visible=false ) {     
        // create axes object (THREE.Object3D) containing initial fwd, top and side axes (each is THREE.Line)   
        const fwd = this.makeUnitLine();
        fwd.position.set(0, 1, 0);
        fwd.name = 'fwd';

        const top = this.makeUnitLine();
        top.rotateX( Math.PI / 2 );
        top.position.set(0, 0.5, 0.5);
        top.material.color.set(0x0000FF);
        top.name = 'top';

        const side = this.makeUnitLine();
        side.rotateZ( Math.PI / 2 );
        side.position.set(0.5, 0.5, 0);
        side.material.color.set(0x00FF00);
        side.name = 'side';

        const axes = new THREE.Object3D();
        axes.add(fwd);
        axes.add(top);
        axes.add(side);
        axes.name = 'axes';
        axes.visible = visible;

        return axes;
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
        this.axes = this.makeAxes( visibleAxes );

        // combine capsule + axes into final object
        this.obj = new THREE.Object3D();
        this.obj.add(this.capsule);
        this.obj.add(this.axes);
        this.obj.name = 'branch';
        return this.obj;
    }

    moveTo( position ) {
        // move branch to a specified position (THREE.Vector3)
        if ( !(position instanceof( THREE.Vector3 )) ) {
            throw new TypeError(`Argument of 'Branch.moveTo' should be of type 'THREE.Vector3' but got ${position}`);
        }
        this.obj.position.set( position.x, position.y, position.z );
    }

    orient( quaternion ) {
        // orient branch as specified by the quaternion (THREE.Quaternion);
        if ( !(quaternion instanceof( THREE.Quaternion )) ) {
            throw TypeError(`Argument for 'Turtle.orion' should be of type 'THREE.Quaternion' but got ${quaternion}`);
        }
        this.obj.setRotationFromQuaternion( quaternion );
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

    recolor( color ) {
        // color - is the new branch color
        this.obj.children.map( (child) => {
            if ( child.name === 'branch-capsule' ) {
                child.children.map( (primitive) => primitive.material.color.set(color) );
            }
        } )
    }
}