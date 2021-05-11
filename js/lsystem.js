class LSystem {
    constructor( turtle ) {
        this.turtle = turtle;
        
        this._branchLen0 = 1;
        this._branchWid0 = 0.1;
        this._branchLen = 1;
        this._branchWid = 0.1;
        this._branchColor = 0x006D70;

        this._leafLen0 = 1; // should be the same as default in Leaf constructor
        this._leafWid0 = 0.25;
        this._leafDep0 = 0.1;
        this._leafLen = 2;
        this._leafWid = 0.25;
        this._leafDep = 0.1;
        this._leafColor = 0xFE04C6;

        this._angleYaw = 25;   // - +
        this._anglePitch = 35; // ^ v
        this._angleRoll = 35;  // d b

        this._axiom = '[X]';
        this._steps = 0;
        this._states = [this.axiom];
        this._rules = {
            'X': '[^F[^+L][^-L]F+X]b[^F+X]bv',
            'F': 'Fb+F[X]',
            'L': 'L',
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

    get leafLen() { return this._leafLen; }
    get leafWid() { return this._leafWid; }
    get leafDep() { return this._leafDep; }
    get leafLen0() { return this._leafLen0; }
    get leafWid0() { return this._leafWid0; }
    get leafDep0() { return this._leafDep0; }    
    get leafColor() { return this._leafColor; }
    
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
        const segments = this.obj.children[0].children;
        segments.map( (segment) => {
            if ( segment.name === 'branch' ) {
                segment.children.map( (child) => {
                    if ( child.name === 'branch-capsule' ) { 
                        child.children.map( (primitive) => primitive.material.color.set(val) );
                    }
                } )
            }
        } )
    }

    setLeafLen( val ) { this._leafLen = val; }
    setLeafWid( val ) { this._leafWid = val; }
    setLeafDep( val ) { this._leafDep = val; }
    setLeafLen0( val ) { this._leafLen0 = val; }
    setLeafWid0( val ) { this._leafWid0 = val; }
    setLeafDep0( val ) { this._leafDep0 = val; }
    setLeafColor( val ) {
        this._leafColor = val;
        const segments = this.obj.children[0].children;
        segments.map( (segment) => {
            if ( segment.name === 'leaf' ) {
                segment.children.map( (child) => {
                    if ( child.name === 'leaf-capsule' ) { 
                        child.children.map( (primitive) => primitive.material.color.set(val) );
                    }
                } )
            }
        } )
    }

    setAngleYaw( val ) { this._angleYaw = val; }
    setAnglePitch( val ) { this._anglePitch = val; }
    setAngleRoll( val ) { this._angleRoll = val; }
    setRules( key, val ) { this._rules[key] = val; }

    reset() {
        this._states = [this.axiom];
        this._steps = 0;
    }

    incrementState( iters=1 ) {
        // "grows" (increments) the LSystem for `iters` steps and 
        // appends the resulting states to the `this._states` array
        let state0, state;
        for ( let i = 0; i < iters; i++ ) {
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
        // removes the last state unless it's an axiom
        if ( this._states.length > 1 ) {
            this._states.pop();
        }
        return this._states[this._states.length - 1]
    }

    getNewBranch() {
        // creates new branch with dimensions specified by 'this' parameters;
        // we first make a default(!) branch and move/orient/scale(!!!)/color it later
        // otherwise scale references for 'updateConfig()' become a bit less straightforward...
        // returns THREE.Object3D() with name 'branch'
        // consisting of 'branch-capsule' (THREE.Object3D()) and 'axes' (THREE.Object3D())
        // 'branch-capsule' consists of cylinder mesh and two sphere meshes
        const brancher = new Branch( );
        brancher.makeBranch();
        brancher.rescale( this.branchWid, this.branchLen, this.branchWid );
        brancher.orient( this.turtle.obj.quaternion );
        brancher.moveTo( this.turtle.position );
        brancher.recolor( this.branchColor );

        return brancher.obj;
    }

    updateExistingBranch( branch ) {
        // branch is a THREE.Object3D() with the following structure:
        // 'branch' (THREE.Object3D())
        //   |-- 'branch-capsule' (THREE.Object3D())
        //   |     |-- 'branch-cylinder' (THREE.Mesh) oriented along y-axis
        //   |     |-- 'branch-edge-low' [sphere] (THREE.Mesh)
        //   |     +-- 'branch-edge-high' [sphere] (THREE.Mesh)
        //   | 
        //   |-- 'axes' (THREE.Object3D())
        //         |-- 'fwd' (THREE.Line)
        //         |-- 'top' (THREE.Line)
        //         +-- 'side' (THREE.Line)
        // To rescale branch we could do something like:
        //     this.obj.scale.set( this.branchWid / this.branchWid0, this.branchLen / this.branchLen0, this.branchWid / this.branchWid0 );
        // but this distorts the edges;
        // we want the edges to remain perfect spheres at all scales,
        // so we only rescale the cylinder
        
        // rescale
        const cylinder = branch.children[0].children[0];
        const sphere1 = branch.children[0].children[1];
        const sphere2 = branch.children[0].children[2];

        cylinder.scale.set( 
            this.branchWid / this.branchWid0, 
            this.branchLen / this.branchLen0, 
            this.branchWid / this.branchWid0 
        );
        sphere1.scale.set( 
            this.branchWid / this.branchWid0, 
            this.branchWid / this.branchWid0, 
            this.branchWid / this.branchWid0 
        );
        sphere2.scale.set( 
            this.branchWid / this.branchWid0, 
            this.branchWid / this.branchWid0, 
            this.branchWid / this.branchWid0 
        );

        cylinder.position.set(0, this.branchLen/2, 0);
        sphere2.position.set(0, this.branchLen, 0);

        // reorient/reposition
        const p = this.turtle.position.clone();
        const q = this.turtle.obj.quaternion.clone(); 
        branch.quaternion.set( q.x, q.y, q.z, q.w );
        branch.position.set( p.x, p.y, p.z );
    }

    getNewLeaf() {
        // creates new leaf with dimensions specified by 'this' parameters
        const leafer = new Leaf();
        leafer.makeLeaf();

        leafer.rescale( this.leafWid, this.leafLen, this.leafDep );
        leafer.orient( this.turtle.obj.quaternion );
        leafer.moveTo( this.turtle.position );
        leafer.recolor( this.leafColor );

        return leafer.obj;
    }

    updateExistingLeaf( leaf ) {
        // leaf is a THREE.Object3D() object
        const p = this.turtle.position.clone();
        const q = this.turtle.obj.quaternion.clone(); 
        leaf.scale.set(  
            this.leafWid / this.leafWid0, 
            this.leafLen / this.leafLen0, 
            this.leafDep / this.leafDep0 )
        leaf.quaternion.set( q.x, q.y, q.z, q.w );
        leaf.position.set( p.x, p.y, p.z );
    }

    draw() {
        // creates new geometry;
        // use it if lsystem state has been incremented or rules have been changed
        let branch, leaf;
        
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
                branch = this.getNewBranch();

                obj.add( branch );
                this.turtle.forward( this.branchLen );
            }
            if (sym === 'L') {                 
                leaf = this.getNewLeaf();

                obj.add( leaf );
                this.turtle.forward( this.leafLen ); // this should never be needed... 
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
                if ( pos_stack.length > 0 && quaternion_stack.length > 0 && 
                     yaw_stack.length > 0 && pitch_stack.length > 0 && roll_stack.length > 0) {
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
        // use it if dimensions/orientation were changed

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

        let segments = this.obj.children[0].children; // each segment: branch-capsule + axes
        let iSegment = 0;

        // update existing geometries
        for (let sym of this.states[this.states.length-1]) {
            if (sym === 'F') { 
                if ( segments[iSegment].name === 'branch' ) {
                    this.updateExistingBranch( segments[iSegment] );
                    iSegment += 1;
                }
                this.turtle.forward( this.branchLen );
            }
            if (sym === 'L') { 
                if ( segments[iSegment].name === 'leaf' ) {
                    this.updateExistingLeaf( segments[iSegment] );
                    iSegment += 1;
                }
                this.turtle.forward( this.leafLen );
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