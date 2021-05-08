class Turtle {
    constructor () {
        // initially turtle is located at the origin and is looking upwards: 
        // its 'fwd' axis is along Oy, its 'top' is along Oz and its 'side' is along Ox
        this.obj;  // THREE.Object3D containing turtle's local axes (assigned by makeTurtle())
        this.axes; // turtle's axes: fwd, top and side (THREE.Vector3), orientation is given in World coordinates (assigned in makeTurtle())
        this.makeTurtle();

        // initially turtle's yaw/pitch/roll angles are set to 0
        this._yaw = 0.;
        this._pitch = 0.;
        this._roll = 0.;
    }

    get position() {
        // get current turtle's position (THREE.Vector3)
        return this.obj.position.clone();
    }

    get yaw() {
        // get current turtle's yaw angle (Number)
        return this._yaw;
    }

    get pitch() {
        // get current turtle's pitch angle (Number)
        return this._pitch;
    }

    get roll() {
        // get current turtle's roll angle (Number)
        return this._roll;
    }
    
    get fwd() {
        // get turtle's 'fwd' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive y-axis at default turtle's orientation)
        let fwdPos = new THREE.Vector3();
        this.axes.children[0].getWorldPosition(fwdPos);
        return fwdPos.add( this.position.multiplyScalar( -1 ) ).normalize();
    }

    get top() {
        // get turtle's 'top' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive z-axis at default turtle's orientation)
        let topPos = new THREE.Vector3();
        this.axes.children[1].getWorldPosition(topPos);
        return topPos.add( this.position.multiplyScalar( -1 ) ).normalize();
    }

    get side() {
        // get turtle's 'side' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive x-axis at default turtle's orientation)
        let sidePos = new THREE.Vector3();
        this.axes.children[2].getWorldPosition(sidePos);
        return sidePos.add( this.position.multiplyScalar( -1 ) ).normalize();
    }

    yawBy( angle ) {
        // change turtle's yaw angle by rotating turtle around 'top' axis by a given angle (Number, radians)
        this._yaw += angle;
        this.obj.rotateOnWorldAxis( this.top, angle );
    }

    pitchBy( angle ) {
        // change turtle's pitch angle by rotating turtle around 'side' axis by a given angle (Number, radians)
        this._pitch += angle;
        this.obj.rotateOnWorldAxis( this.side, angle );
    }

    rollBy( angle ) {
        // change turtle's roll angle by rotating turtle around 'fwd' axis by a given angle (Number, radians)
        this._roll += angle;
        this.obj.rotateOnWorldAxis( this.fwd, angle );
    }

    makeAxes( visible=false ) {
        // create axes object (THREE.Object3D) containing initial fwd, top and side axes (each is THREE.Mesh)
        const fwdGeo = new THREE.CylinderGeometry(0.01, 0.01, 1., 8);
        const fwdMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
        const fwdMesh = new THREE.Mesh( fwdGeo, fwdMat );
        fwdMesh.name = 'fwd';
        fwdMesh.position.set( 0, 0.5, 0 );

        const topGeo = new THREE.CylinderGeometry(0.01, 0.01, 1., 8);
        const topMat = new THREE.MeshBasicMaterial({ color: 0x0000FF });
        const topMesh = new THREE.Mesh( topGeo, topMat );
        topMesh.name = 'top';
        topMesh.rotateX( Math.PI / 2 );
        topMesh.position.set( 0, 0, 0.5 );

        const sideGeo = new THREE.CylinderGeometry(0.01, 0.01, 1., 8);
        const sideMat = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        const sideMesh = new THREE.Mesh( sideGeo, sideMat );
        sideMesh.name = 'side';
        sideMesh.rotateZ( Math.PI / 2 );
        sideMesh.position.set( 0.5, 0, 0 );

        const axes = new THREE.Object3D();
        axes.add(fwdMesh);
        axes.add(topMesh);
        axes.add(sideMesh);
        axes.visible = visible;

        return axes;
    }

    makeTurtle( visibleAxes=false ) {
        // create turtle object (THREE.Object3D) with axes (THREE.Object3D with 3 THREE.Mesh objects)
        this.obj = new THREE.Object3D();

        this.axes = this.makeAxes( visibleAxes );

        this.obj.add(this.axes);
        return this.obj;
    }

    forward( distance ) {
        // move turtle some distance (Number) in the direction that the turtle in facing (fwd axis)
        this.obj.position.add(this.fwd.multiplyScalar( distance ));
        return this.position;        
    }

    moveTo( position ) {
        // move turtle to a specific position (THREE.Vector3)
        if ( !(position instanceof( THREE.Vector3 )) ) {
            throw new TypeError(`Argument for 'Turtle.moveTo' should be of type 'THREE.Vector3' but got ${position}`);
        }
        this.obj.position.set( position.x, position.y, position.z );
    }

    orient( quaternion, yaw, pitch, roll ) {
        // orient the object as specified by the quaternion (THREE.Quaternion);
        // as a fugly temp(!!!) fix - also pass yaw/pitch/roll (each is a Number)
        if ( !(quaternion instanceof( THREE.Quaternion )) ) {
            throw TypeError(`Argument for 'Turtle.orion' should be of type 'THREE.Quaternion' but got ${quaternion}`);
        }
        this.obj.setRotationFromQuaternion( quaternion );
        
        // TODO: adjust yaw/pitch/roll (fugly storing of yaw/pitch/roll for now... should be derived from quaternion)
        this._yaw = yaw; 
        this._pitch = pitch;
        this._roll = roll;
    }
}