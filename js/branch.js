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

    makeAxes( visible=false ) {
        const fwdGeo = new THREE.CylinderGeometry(0.01, 0.01, this.len, 8);
        const fwdMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const fwdMesh = new THREE.Mesh( fwdGeo, fwdMat );
        fwdMesh.name = 'fwd';
        fwdMesh.position.set( 0, this.len, 0 );

        const topGeo = new THREE.CylinderGeometry(0.01, 0.01, this.len, 8);
        const topMat = new THREE.MeshBasicMaterial({ color: 0x0000FF });
        const topMesh = new THREE.Mesh( topGeo, topMat );
        topMesh.name = 'top';
        topMesh.rotateX( Math.PI / 2 );
        topMesh.position.set( 0, this.len/2, this.len/2 );

        const sideGeo = new THREE.CylinderGeometry(0.01, 0.01, this.len, 8);
        const sideMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        const sideMesh = new THREE.Mesh( sideGeo, sideMat );
        sideMesh.name = 'side';
        sideMesh.rotateZ( Math.PI / 2 );
        sideMesh.position.set( this.len/2, this.len/2, 0 );

        const axes = new THREE.Object3D();
        axes.add(fwdMesh);
        axes.add(topMesh);
        axes.add(sideMesh);
        axes.name = 'axes';
        axes.visible = visible;

        return axes;
    }

    makeBranch( visibleAxes=false ) {
        // --- branch capsule ---
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
        this.capsule = new THREE.Object3D();
        this.capsule.add(cylinder);
        this.capsule.add(sphereLow);
        this.capsule.add(sphereHigh);
        this.capsule.name = 'branch-capsule';

        // --- branch axes ---
        // get branch axes
        this.axes = this.makeAxes( visibleAxes );

        // --- combined ---
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
        // x, y, z - are new width, length and depth
        this.obj.scale.set( x / this.wid0, y / this.len0, z / this.wid0 );
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