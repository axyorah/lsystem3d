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
                copy.color = ref.color; //  this needs to be set explicitly
                obj.add(copy.obj);

                this.turtle.forward(copy.len);
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

    update(lsystem, partMap) {}
}