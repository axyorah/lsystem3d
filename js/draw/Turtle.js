class Turtle {
    constructor () {
        // initially turtle is located at the origin and is looking upwards: 
        // its 'fwd' axis is along Oy, its 'top' is along Oz and its 'side' is along Ox
        this.obj;  // THREE.Object3D containing turtle's local axes (assigned by makeTurtle())
        this.axes; // turtle's axes: fwd, top and side (THREE.Line)
        this.makeTurtle();
    }

    get position() {
        // get current turtle's position (THREE.Vector3)
        return this.obj.position.clone();
    }

    get orientation() {
        return this.obj.quaternion.clone();
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
        // this._yaw += angle;
        this.obj.rotateOnWorldAxis( this.top, angle );
    }

    pitchBy( angle ) {
        // change turtle's pitch angle by rotating turtle around 'side' axis by a given angle (Number, radians)
        // this._pitch += angle;
        this.obj.rotateOnWorldAxis( this.side, angle );
    }

    rollBy( angle ) {
        // change turtle's roll angle by rotating turtle around 'fwd' axis by a given angle (Number, radians)
        // this._roll += angle;
        this.obj.rotateOnWorldAxis( this.fwd, angle );
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
        fwd.position.set(0, 0.5, 0);
        fwd.name = 'fwd';

        const top = this.makeUnitLine();
        top.rotateX( Math.PI / 2 );
        top.position.set(0, 0, 0.5);
        top.material.color.set(0x0000FF);
        top.name = 'top';

        const side = this.makeUnitLine();
        side.rotateZ( Math.PI / 2 );
        side.position.set(0.5, 0, 0);
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

    makeTurtle( visibleAxes=false ) {
        // create turtle object (THREE.Object3D) with axes (THREE.Object3D with 3 THREE.Line objects)
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

    orient( quaternion ) { //, yaw, pitch, roll ) {
        // orient the object as specified by the quaternion (THREE.Quaternion);
        // as a fugly temp(!!!) fix - also pass yaw/pitch/roll (each is a Number)
        if ( !(quaternion instanceof( THREE.Quaternion )) ) {
            throw TypeError(`Argument for 'Turtle.orion' should be of type 'THREE.Quaternion' but got ${quaternion}`);
        }
        this.obj.setRotationFromQuaternion( quaternion );
    }

    reset () {
        this.obj.position.set(0,0,0);
        this.obj.quaternion.set(0,0,0,1);
    }
}