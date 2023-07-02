class LSystem {
    RESERVED_SYMBOLS = '+-^vdb[]X'.split('');
    DEFAULT_AXIOM = '[X]';
    DEFAULT_RULES = {
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
    DEFAULT_MAP = {
        F: new Branch(),
        L: new Leaf(),
    };
    
    constructor() {
        this.step = 0;
        this.axiom = this.DEFAULT_AXIOM;
        this.states = [this.DEFAULT_AXIOM];
        this._rules = structuredClone(this.DEFAULT_RULES);
        this.map = Object.fromEntries(Object.keys(this.DEFAULT_MAP).map(
            (key) => [key, this.DEFAULT_MAP[key]])
        ); // weird way to make a copy...

        this.yaw = 0;
        this.pitch = 0;
        this.roll = 0;

        this.obj = new THREE.Object3D;
        this.builder = new Builder();
    }

    get rules() {
        return structuredClone(this._rules);
    }

    set rules(keyval) {
        if (!(keyval instanceof Object)) {
            throw new TypeError('Rules should be an object with key-value pairs');
        }

        this._rules = {
            ...this._rules,
            ...keyval,
        };
    }

    next() {
        // "grows" (increments) the LSystem for 1 step and 
        // appends the resulting state to the `this.states` array
        const state0 = this.states.at(-1);
        const state = state0
            .split('')
            .map((sym) => this.rules[sym])
            .join();
        this.states.push(state);
        this.step += 1;
        return state;
    };

    prev() {
        if (this.states.length > 1) {
            this.states.pop();
            this.step -= 1;
        }
        return this.states.at(-1);
    };

    reset() {
        this.axios = this.DEFAULT_AXIOM;
        this.states = [this.DEFAULT_AXIOM];
        this._rules = structuredClone(this.DEFAULT_RULES);
        this.map = Object.fromEntries(Object.keys(this.DEFAULT_MAP).map(
            (key) => [key, this.DEFAULT_MAP[key]])
        ); // weird way to make a copy...
        this.steps = 0;
        return this.states.at(-1);
    }

    update(partMap) {}

    build() {
        const obj = this.builder.build(this);

        // add built obj to self in a bit convoluted way,
        // because scence renders this.obj - we can't overwrite it, only modify
        this.obj.children.pop();
        this.obj.children.push(obj);
    }
}