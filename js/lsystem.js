class Branch {
    constructor() {
        this._fwd = new THREE.Vector3(0,1,0);
        this._top = new THREE.Vector3(0,0,1);
        this._side = new THREE.Vector3(1,0,0);

        this._len = 1.;
        this._wid = 0.1;

        this.obj;
        this.mat;
        this.geo;
        this.mesh;
    }

    get len() { return this._len; }
    get wid() { return this._wid; }

    get fwd() { return this._fwd; }
    get top() { return this._top; }
    get side() { return this._side; }

    set fwd( val ) { 
        if ( !(val instanceof(THREE.Vector3)) ) {
            throw new TypeError(`Argument for 'Branch.fwd' setter must be of type THREE.Vector3, got ${val}`);            
        } 
        this._fwd = val;
    }

    set top( val ) {        
        if ( !(val instanceof(THREE.Vector3)) ) {
            throw new TypeError(`Argument for 'Branch.top' setter must be of type THREE.Vector3, got ${val}`);
        } 
        this._top = val;
    }

    set side( val ) {
        if ( !(val instanceof(THREE.Vector3)) ) {
            throw new TypeError(`Argument for 'Branch.side' setter must be of type THREE.Vector3, got ${val}`);        
        } 
        this._side = val;
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
        axes.visible = visible;

        return axes;
    }

    make( visibleAxes=false ) {
        this.obj = new THREE.Object3D();

        this.mat = new THREE.MeshPhongMaterial( { color: 0xFFAA00, shininess: 20, opacity: 1., transparent: false } );
        this.geo = new THREE.CylinderGeometry( this.wid, this.wid, this.len, 8);
        this.mesh = new THREE.Mesh( this.geo, this.mat );
        this.mesh.name = 'branch';

        this.mesh.position.set(0, this.len/2, 0);
        this.mesh.castShadow = true;

        const axes = this.makeAxes( visibleAxes );

        this.obj.add(this.mesh);
        this.obj.add(axes);
        return this.obj;
    }

    moveTo( position ) {
        if ( !(position instanceof( THREE.Vector3 )) ) {
            throw new TypeError(`Argument of 'Branch.moveTo' should be of type 'THREE.Vector3' but got ${position}`);
        }
        this.obj.position.set( position );
    }

    align( fwd, top, side ) {
        if ( !(fwd instanceof(THREE.Vector3)) || !(top instanceof(THREE.Vector3) || !(side instanceof THREE.Vector3)) ) {
            throw TypeError(`All arguments for 'Branch.align' should be of type THREE.Vector3, got ${fwd}, ${top}, ${side}`)
        }
        this.obj.quaternion.setFromUnitVectors(this._fwd, fwd)

    }
}

class LSystem {
    constructor( turtle ) {
        this.turtle = turtle;

        this._branchLen = 1;
        this._branchWid = 0.1;

        this._angleYaw = 15;   // - +
        this._anglePitch = 25; // ^ v
        this._angleRoll = 35;  // d b

        this._axiom = '[X]';
        this._states = [this.axiom];
        this._object = new THREE.Object3D();
        this._rules = {
            'X': 'F[+X]bF[+X]bF[+X]b',
            'F': 'FbF',
            '[': '[',
            ']': ']',
            '+': '+',
            '-': '-',
            '^': '^',
            'v': 'v',
            'd': 'd',
            'b': 'b'
        };

        this._branchMaterial = this.getBranchMaterial();
        this._branch = this.makeBranch();
    }

    get axiom() { return this._axiom; }
    get states() { return this._states; }
    get branchLen() { return this._branchLen; }
    get branchWid() { return this._branchWid; }
    get angleYaw() { return this._angleYaw; }
    get anglePitch() { return this._anglePitch; }
    get angleRoll() { return this._angleRoll; }
    get rules() { return this._rules; }
    get branch() { return this._branch; }

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
        // TODO
        return;
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
        }
        return state;
    }

    draw() {
        let branch, leaf;

        let pos_stack = [];
        let fwd_stack = [];
        let up_stack = [];
        let right_stack = [];

        const obj = new THREE.Object3D();
        for (let sym of this.states[this.states.length-1]) {
            if (sym === 'F') { 
                const brancher = new Branch();
                brancher.make( true );
                branch = brancher.obj;
                //branch.position.set( this.turtle.position );
                //branch.quaternion.setFromUnitVectors( new THREE.Vector3(0,1,0), this.turtle.fwd ); // aligned with fwd, but roll around fwd is missing...
                brancher.moveTo( turtle.position );
                brancher.align( turtle.fwd, turtle.top, turtle.side );
                obj.add( branch ); // Too Soon?..
                this.turtle.move( this.branchLen );
            }
            else if (sym === '+') this.turtle.yaw( this.angleYaw )
            else if (sym === '-') this.turtle.yaw(-this.angleYaw )
            else if (sym === '^') this.turtle.pitch( this.anglePitch )
            else if (sym === 'v') this.turtle.pitch(-this.anglePitch )
            else if (sym === 'd') this.turtle.roll( this.angleRoll )
            else if (sym === 'b') this.turtle.roll(-this.angleRoll )
            else if (sym === '[') {
                pos_stack.push( this.turtle.position );
                fwd_stack.push( this.turtle.fwd );
                up_stack.push( this.turtle.up );
                right_stack.push( this.turtle.right );
            }
            else if (sym === ']') {
                //this.turtle.stroke();
                //this.turtle.penup();
                if (pos_stack.length > 0 && fwd_stack.length > 0 && up_stack.length > 0 && right_stack.length > 0) {
                    this.turtle.position(pos_stack[pos_stack.length-1]);
                    this.turtle.fwd = fwd_stack[fwd_stack.length-1];
                    this.turtle.up = fwd_stack[up_stack.length-1];
                    this.turtle.right = fwd_stack[right_stack.length-1];
                    pos_stack.pop();
                    fwd_stack.pop();
                    up_stack.pop();
                    right_stack.pop();
                }                
                //this.turtle.pendown();
            }
        }
        //this.turtle.stroke();
    }


}