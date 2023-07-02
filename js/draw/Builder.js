class Builder {
    constructor() {
        this.turtle = new Turtle();
    }

    build(lsystem) {
        // creates new buffer geometry;
        // use it if lsystem state has been incremented or rules have been changed
        let lvl = 0;
        
        // reset turtle
        this.turtle.reset();

        // initiate position/orientation stacks
        const stack = [];
        
        // make temp Object3D to store geometry
        const obj = new THREE.Object3D();
        // make new geometries
        for (let sym of lsystem.states.at(-1)) {
            if (lsystem.map[sym]) {
                lvl += 1;
                const ref = lsystem.map[sym];
                const copy = ref.constructor.copy(ref, lvl);
                copy.orientation = this.turtle.orientation;
                copy.position = this.turtle.position;
                obj.add(copy.obj);

                this.turtle.forward(copy.len);
                lsystem.partsByUuid[copy.obj.uuid] = copy;
            }
            else if (sym === '+') this.turtle.yawBy( lsystem.yaw * Math.PI / 180 )
            else if (sym === '-') this.turtle.yawBy(-lsystem.yaw * Math.PI / 180 )
            else if (sym === '^') this.turtle.pitchBy( lsystem.pitch * Math.PI / 180 )
            else if (sym === 'v') this.turtle.pitchBy(-lsystem.pitch * Math.PI / 180 )
            else if (sym === 'd') this.turtle.rollBy( lsystem.roll * Math.PI / 180 )
            else if (sym === 'b') this.turtle.rollBy(-lsystem.roll * Math.PI / 180 )
            else if (sym === '[') {
                stack.push({
                    pos: this.turtle.position,
                    quaternion: this.turtle.obj.quaternion.clone(),
                    lvl: lvl
                });
            }
            else if (sym === ']') {
                if (stack.length > 0) {
                    const { pos, quaternion, lvl: lvlUpdate } = stack.pop();
                    this.turtle.moveTo(pos);
                    this.turtle.orient(quaternion);
                    lvl = lvlUpdate;
                }
            }
        }

        // // modify lsystem object (this.obj should already be added to scene)
        // lsystem.obj.children.pop();
        // lsystem.obj.add(obj);

        // reset turtle
        this.turtle.reset();

        return obj;
    }

    update(lsystem, partMap) {
        // (mostly) updates the existing geometry;
        // (when updating branch: new cylinder geometry is added to replace the old one;
        //  this is only done because it's sometimes needed to change cylinder top-to-bottom width ratio...)
        // use it if dimensions/orientation were changed

        // if there's nothing to update - exit
        if ( !lsystem.obj.children.length ) {
            return;
        }

        // reset turtle
        this.turtle.reset();

        // initiate state (position,orientation,lvl) stack
        const stack = [];

        let segments = lsystem.obj.children[0].children; // each segment: branch-capsule/leaf-capsule + axes
        let iSegment = 0;
        let lvl = 0; // "distance" from root - needed to calculate width of the branches (length assumed const)

        // update existing geometries
        for (let sym of lsystem.states.at(-1)) {
            if (lsystem.map[sym]) {
                const part = lsystem.partsByUuid[segments[iSegment].uuid];

                lsystem.map[sym].position = this.turtle.position;
                lsystem.map[sym].orientation = this.turtle.orientation;
                part.update(lsystem.map[sym], lvl);

                lvl += 1;
                iSegment += 1;
                this.turtle.forward(lsystem.map[sym].len);
            }
            else if (sym === '+') this.turtle.yawBy( lsystem.yaw * Math.PI / 180 )
            else if (sym === '-') this.turtle.yawBy(-lsystem.yaw * Math.PI / 180 )
            else if (sym === '^') this.turtle.pitchBy( lsystem.pitch * Math.PI / 180 )
            else if (sym === 'v') this.turtle.pitchBy(-lsystem.pitch * Math.PI / 180 )
            else if (sym === 'd') this.turtle.rollBy( lsystem.roll * Math.PI / 180 )
            else if (sym === 'b') this.turtle.rollBy(-lsystem.roll * Math.PI / 180 )
            else if (sym === '[') {
                stack.push({
                    pos: this.turtle.position,
                    quaternion: this.turtle.orientation,
                    lvl: lvl
                });
            }
            else if (sym === ']') {
                if (stack.length > 0) {
                    const { pos, quaternion, lvl: lvlUpdate } = stack.pop();
                    this.turtle.moveTo(pos);
                    this.turtle.orient(quaternion);
                    lvl = lvlUpdate;
                }
            }
        }
        
        // reset turtle
        this.turtle.reset();
    }
}