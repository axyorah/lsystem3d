class Part {
    constructor( len=1., wid=0.5, dep=0.5, color ) {
        this._len0 = len;
        this._wid0 = wid;
        this._dep0 = dep;

        this._len = len;
        this._wid = wid;
        this._dep = dep;
        this._color = color;

        this.mat;  // material
        this.capsule; // THREE.Object3D which contains mesh(es) of the actual part
        this.axes; // axes that show part's orientation (needed for aligning the object to vectors)
        this.obj;  // capsule + axes (use this to rescale/reposition/reorient)
    }

    get len0() { return this._len0; }
    get wid0() { return this._wid0; }
    get dep0() { return this._dep0; }
    get len() { return this._len; }
    get wid() { return this._wid; }
    get dep() { return this._dep; }
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

    setWid( wid ) { this._wid = wid; }
    setLen( len ) { this._len = len; }
    setDep( dep ) { this._dep = dep; }

    makeCapsule() {
        const capsule = new THREE.Object3D();

        return capsule;
    }

    makePart( visibleAxes=false ) {
        // capsule
        this.capsule = this.makeCapsule();

        // axes        
        this.axes = makeAxes( visibleAxes );

        // combine capsule + axes into final object
        this.obj = new THREE.Object3D();
        this.obj.add(this.capsule);
        this.obj.add(this.axes);
        this.obj.name = 'part';
        return this.obj;
    }

    moveTo( position ) {
        // move branch to a specified position (THREE.Vector3)
        if ( !(position instanceof( THREE.Vector3 )) ) {
            throw new TypeError(`Argument of 'moveTo' should be of type 'THREE.Vector3' but got ${position}`);
        }
        this.obj.position.set( position.x, position.y, position.z );
    }

    orient( quaternion ) {
        // orient branch as specified by the quaternion (THREE.Quaternion);
        if ( !(quaternion instanceof( THREE.Quaternion )) ) {
            throw TypeError(`Argument for 'orient' should be of type 'THREE.Quaternion' but got ${quaternion}`);
        }
        this.obj.setRotationFromQuaternion( quaternion );
    }

    rescale( x, y, z ) {
        // rescale the part to fit new dimensions
        this.obj.scale.set( x / this._wid0, y / this._len0, z / this._dep0 );
    }

    recolor( color ) {
        // recolor the object
        // (assumed that THREE.Mesh objects are stored in this.capsule)
        this.capsule.children.map( (primitive) => primitive.material.color.set(color) )
    }
}
