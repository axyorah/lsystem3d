class Brancher {
    constructor() {
        this._len = 1.;
        this._wid = 0.1;

        this.mat;  // branch material
        this.geo;  // branch geometry
        this.mesh; // actual branch mesh (geo + mat)
        this.axes; // axes that show branch orientation (needed for aligning the object to vectors)
        this.obj;  // mesh + axes (use this to rescale/reposition/reorient)
    }

    get len() { return this._len; }
    get wid() { return this._wid; }

    // axes getter: (ax.position - mesh.position) normalized
    get fwd() {
        // get branch's 'fwd' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive y-axis at default branch orientation)
        let fwdPos = new THREE.Vector3();
        this.axes.children[0].getWorldPosition(fwdPos);
        return fwdPos.add( this.mesh.position.clone().multiplyScalar( -1 ) ).normalize();
    }

    get top() {
        // get branch's 'top' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive z-axis at default branch orientation)
        let topPos = new THREE.Vector3();
        this.axes.children[1].getWorldPosition(topPos);
        return topPos.add( this.mesh.position.clone().multiplyScalar( -1 ) ).normalize();
    }

    get side() {
        // get branch's 'side' axis (THREE.Vector3) in World coordinates
        // (corresponds to unit-vector in positive x-axis at default branch orientation)
        let sidePos = new THREE.Vector3();
        this.axes.children[2].getWorldPosition(sidePos);
        return sidePos.add( this.mesh.position.clone().multiplyScalar( -1 ) ).normalize();
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
        // create branch object (THREE.Object3D) containing branch mesh (THREE.Mesh) 
        this.obj = new THREE.Object3D();

        this.mat = new THREE.MeshPhongMaterial( { color: 0xFFAA00, shininess: 20, opacity: 1., transparent: false } );
        this.geo = new THREE.CylinderGeometry( this.wid, this.wid, this.len, 8);
        this.mesh = new THREE.Mesh( this.geo, this.mat );
        this.mesh.name = 'branch';

        this.mesh.position.set(0, this.len/2, 0);
        this.mesh.castShadow = true;

        this.axes = this.makeAxes( visibleAxes );

        this.obj.add(this.mesh);
        this.obj.add(this.axes);
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
}

class LSystem {
    constructor( turtle ) {
        this.turtle = turtle;

        this._branchLen = 1;
        this._branchWid = 0.1;

        this._angleYaw = 25;   // - +
        this._anglePitch = 35; // ^ v
        this._angleRoll = 35;  // d b

        this._axiom = '[X]';
        this._steps = 0;
        this._states = [this.axiom];
        this._rules = {
            'X': '[^FF+X]b[^F+X]bv',
            'F': 'Fb+F[X]',
            '[': '[',
            ']': ']',
            '+': '+',
            '-': '-',
            '^': '^',
            'v': 'v',
            'd': 'd',
            'b': 'b'
        };

        this.obj = new THREE.Object3D();
    }

    get axiom() { return this._axiom; }
    get states() { return this._states; }
    get branchLen() { return this._branchLen; }
    get branchWid() { return this._branchWid; }
    get angleYaw() { return this._angleYaw; }
    get anglePitch() { return this._anglePitch; }
    get angleRoll() { return this._angleRoll; }
    get rules() { return this._rules; }

    set branchLen( val ) { this._branchLen = val; }
    set branchWid( val ) { this._branchWid = val; }
    set angleYaw( val ) { this._angleYaw = val; }
    set anglePitch( val ) { this._anglePitch = val; }
    set angleRoll( val ) { this._angleRoll = val; }
    set rules( keyval ) {
        // keyval: {key: <key>, val: <val>}
        this.rules[keyval.key] = keyval.val;
    }

    reset() {
        this.states = [this.axiom];
        this._steps = 0;
    }

    updateState( iters=1 ) {
        let state0, state;
        for (let i = 0; i < iters; i++) {
            state0 = this.states[this.states.length-1];
            state = "";
            for (let sym of state0) {
                state += this.rules[sym];
            }
            this._states.push(state);
            this._steps += 1;
        }
        return state;
    }

    undoState() {
        if ( this._states.length > 1 ) {
            this._states.pop();
        }
        return this._states[this._states.length - 1]
    }

    draw() {
        let branch, leaf; // TODO: leaf

        let pos_stack = [];
        let quaternion_stack = [];
        let yaw_stack = [];
        let pitch_stack = [];
        let roll_stack = [];

        const obj = new THREE.Object3D();
        for (let sym of this.states[this.states.length-1]) {
            if (sym === 'F') { 
                const brancher = new Brancher();
                brancher.makeBranch();
                branch = brancher.obj;
                brancher.moveTo( this.turtle.position );
                brancher.orient( this.turtle.obj.quaternion ); 
                obj.add( branch );
                this.turtle.forward( this.branchLen );
            }
            else if (sym === '+') this.turtle.yawBy( this.angleYaw * Math.PI / 180 )
            else if (sym === '-') this.turtle.yawBy(-this.angleYaw * Math.PI / 180 )
            else if (sym === '^') this.turtle.pitchBy( this.anglePitch * Math.PI / 180 )
            else if (sym === 'v') this.turtle.pitchBy(-this.anglePitch * Math.PI / 180 )
            else if (sym === 'd') this.turtle.rollBy( this.angleRoll * Math.PI / 180 )
            else if (sym === 'b') this.turtle.rollBy(-this.angleRoll * Math.PI / 180 )
            else if (sym === '[') {
                pos_stack.push( this.turtle.position );
                quaternion_stack.push( this.turtle.obj.quaternion.clone() );
                yaw_stack.push( this.turtle.yaw );
                pitch_stack.push( this.turtle.pitch );
                roll_stack.push( this.turtle.roll );
            }
            else if (sym === ']') {
                if ( pos_stack.length > 0 && quaternion_stack.length > 0 && yaw_stack.length > 0 && pitch_stack.length > 0 && roll_stack.length > 0) {
                    this.turtle.moveTo( pos_stack.pop() );
                    this.turtle.orient( quaternion_stack.pop(), yaw_stack.pop(), pitch_stack.pop(), roll_stack.pop() );
                }
            }
        }

        // modify lsystem object (this.obj should already be added to scene)
        this.obj.children.pop();
        this.obj.add(obj);
    }


}