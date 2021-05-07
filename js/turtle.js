

class Turtle {
    constructor () {
        // initially turtle is located at origin
        this._pos = new THREE.Vector3(0,0,0);
        
        // initially turtle is looking upwards (along Oy), 
        // its 'top' is along Oz and its 'side' is along Ox
        this.turtle;
        this.makeTurtle(true);
        this._fwd = new THREE.Vector3(0,1,0);
        this._top = new THREE.Vector3(0,0,1);
        this._side = new THREE.Vector3(1,0,0);

        // initially turtle's yaw/pitch/roll are set to 0
        this._yaw = 0.;
        this._pitch = 0.;
        this._roll = 0;
    }

    get position() {
        //return this._pos;
        return this.turtle.position;
    }

    get yaw() {
        return this._yaw;
    }

    get pitch() {
        return this._pitch;
    }

    get roll() {
        return this._roll;
    }

    get fwd() {
        return this._fwd;
        //this.turtle.children[0];
    }

    get top() {
        return this._top;
    }

    get side() {
        return this._side;
    }

    set position( pos ) {
        // pos: THREE.Vector3
        this._pos = pos;
    }

    set yaw( angle ) {
        // yaw wrt 'up' axis by a given angle (in radians)
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle( this._top, angle );

        this._fwd.applyQuaternion( quaternion );
        this._side.applyQuaternion( quaternion );
    }

    set pitch( angle ) {
        // pitch wrt 'right' axis by a given angle (in radians)
        const quaternion = new TRHEE.Quaternion();
        quaternion.setFromAxisAngle( this._side, angle );

        this._fwd.applyQuaternion( quaternion );
        this._top.applyQuaternion( quaternion );
    }

    set roll( angle ) {
        // roll about 'fwd' axis by a given angle (in radians)
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle( this._fwd, angle );

        this._side.applyQuaternion( quaternion );
        this._top.applyQuaternion( quaternion );
    }

    set fwd( val ) {
        // val: THREE.Vector3
        // TODO: check if val is Vector3
        this._fwd = val;
    }

    set top( val ) {
        this._top = val;
    }

    set side( val ) {
        this._side = val;
    }

    makeAxes( visible=false ) {
        const fwdGeo = new THREE.CylinderGeometry(0.01, 0.01, 1., 8);
        const fwdMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const fwdMesh = new THREE.Mesh( fwdGeo, fwdMat );
        fwdMesh.name = 'fwd';
        fwdMesh.position.set( 0, 1., 0 );

        const topGeo = new THREE.CylinderGeometry(0.01, 0.01, 1., 8);
        const topMat = new THREE.MeshBasicMaterial({ color: 0x0000FF });
        const topMesh = new THREE.Mesh( topGeo, topMat );
        topMesh.name = 'top';
        topMesh.rotateX( Math.PI / 2 );
        topMesh.position.set( 0, 0.5, 0.5 );

        const sideGeo = new THREE.CylinderGeometry(0.01, 0.01, 1., 8);
        const sideMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        const sideMesh = new THREE.Mesh( sideGeo, sideMat );
        sideMesh.name = 'side';
        sideMesh.rotateZ( Math.PI / 2 );
        sideMesh.position.set( 0.5, 0.5, 0 );

        const axes = new THREE.Object3D();
        axes.add(fwdMesh);
        axes.add(topMesh);
        axes.add(sideMesh);
        axes.visible = visible;

        return axes;
    }

    makeTurtle( visibleAxes=false ) {
        this.turtle = new THREE.Object3D();

        const axes = this.makeAxes( visibleAxes );
        //this._fwd = axes.children[0];
        //this._top = axes.children[1];
        //this._side = axes.children[2];

        this.turtle.add(axes);
        return this.turtle;
    }

    move( distance ) {
        // move some distance in the direction that the turtle in facing 
        this.turtle.position.add(this._fwd.multiplyScalar( distance ));
        this._pos.add(this._fwd.multiplyScalar( distance ));
        return this._pos;        
    }
}