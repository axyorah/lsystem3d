class Brancher {
    constructor( len=1., wid=0.1, color=0xFFAA00 ) {
        this._len = len;
        this._wid = wid;
        this._color = color;

        this.mat;  // branch material
        this.capsule; // actual branch mesh (cylinder geo + mat & 2 edge spheres geo + mat)
        this.axes; // axes that show branch orientation (needed for aligning the object to vectors)
        this.obj;  // capsule + axes (use this to rescale/reposition/reorient)
    }

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
}

class LSystem {
    constructor( turtle ) {
        this.turtle = turtle;
        
        this._branchLen0 = 1;
        this._branchWid0 = 0.1;
        this._branchLen = 1;
        this._branchWid = 0.1;
        this._branchColor = 0xFFAA00;

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
    get branchLen0() { return this._branchLen0; }
    get branchWid0() { return this._branchWid0; }
    get branchColor() { return this._branchColor; }
    get angleYaw() { return this._angleYaw; }
    get anglePitch() { return this._anglePitch; }
    get angleRoll() { return this._angleRoll; }
    get rules() { return this._rules; }

    setBranchLen( val ) { this._branchLen = val; }
    setBranchWid( val ) { this._branchWid = val; }
    setBranchLen0( val ) { this._branchLen0 = val; }
    setBranchWid0( val ) { this._branchWid0 = val; }
    setBranchColor( val ) {
        this._branchColor = val;
        for ( let segment of this.obj.children[0].children ) {
            if ( segment.name === 'branch' ) {
                for ( let child of segment.children ) { 
                    if ( child.name === 'branch-capsule' ) {
                        for ( let primitive of child.children ) {
                            primitive.material.color.set(val);
                        }
                    }
                }
            }
        }
    }
    setAngleYaw( val ) { this._angleYaw = val; }
    setAnglePitch( val ) { this._anglePitch = val; }
    setAngleRoll( val ) { this._angleRoll = val; }
    setRules( keyval ) {
        // keyval: {key: <key>, val: <val>}
        this._rules[keyval.key] = keyval.val;
    }

    reset() {
        this._states = [this.axiom];
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
        // creates new geometry;
        // use it if lsystem state has been incremented or rules have been changed
        let branch, leaf; // TODO: leaf
        
        // reset turtle
        this.turtle.reset();

        // initiate position/orientation stacks
        let pos_stack = [];
        let quaternion_stack = [];
        let yaw_stack = [];
        let pitch_stack = [];
        let roll_stack = [];
        
        // make temp Object3D to store geometry
        const obj = new THREE.Object3D();
        // make new geometries
        for (let sym of this.states[this.states.length-1]) {
            if (sym === 'F') { 
                // we need to make a default(!) branch and move/orient/scale(!!!)/color it later
                // otherwise scale references for 'updateConfig()' become a bit less straightforward...
                const brancher = new Brancher( );// 1, 0.1, this.branchColor );//this.branchLen, this.branchWid, this.branchColor );
                brancher.makeBranch();
                brancher.moveTo( this.turtle.position );
                brancher.orient( this.turtle.obj.quaternion );
                brancher.obj.scale.set( this.branchWid / this.branchWid0, this.branchLen / this.branchLen0, this.branchWid / this.branchWid0 );
                brancher.obj.children.map( (child) =>  {
                    // ignore axes, color only capsule
                    if ( child.name === 'branch-capsule' ) {
                        child.children.map( (primitive) => primitive.material.color.set(this.branchColor) );
                    }
                });

                obj.add( brancher.obj );
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

        // reset turtle
        this.turtle.reset();
    }

    updateConfig() {
        // updates the existing geometry;
        // use it if dimensions were changed

        // if there's nothing to update - exit
        if ( !this.obj.children.length ) {
            return;
        }

        // reset turtle
        this.turtle.reset();

        // initiate position/orientation stacks
        let pos_stack = [];
        let quaternion_stack = [];
        let yaw_stack = [];
        let pitch_stack = [];
        let roll_stack = [];

        let segments = this.obj.children[0].children; // each segment: branch + axes
        let iBranch = 0;

        console.log(segments[0].scale.x, segments[0].scale.y, segments[0].scale.z);

        //const obj = new THREE.Object3D();
        for (let sym of this.states[this.states.length-1]) {
            if (sym === 'F') { 
                if ( segments[iBranch].name === 'branch' ) {
                    const p = this.turtle.position.clone();
                    const q = this.turtle.obj.quaternion.clone();
                    
                    segments[iBranch].scale.set( this.branchWid / this.branchWid0, this.branchLen / this.branchLen0, this.branchWid / this.branchWid0 )
                    segments[iBranch].quaternion.set( q.x, q.y, q.z, q.w );
                    segments[iBranch].position.set( p.x, p.y, p.z );
                    iBranch += 1;
                }
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
        
        // reset turtle
        this.turtle.reset();
    }
}