class Leaf extends Part {
    constructor( len=1.0, wid=0.25, dep=0.1, color=0x00FF00, visibleAxes=false ) {
        super( len, wid, dep, color, visibleAxes );
    }

    makeGeometry() {
        /*
        assemble leaf geometry from the following scheme:

              pts             edges           faces
               * 3              *               *
                           3 / 10  \ 2       /3 | 2\
           * 4    * 2       * 11| 9 *       * . | . *
               * 6        4 |.  *  .| 1     |.4 * 1.|
           * 5    * 1       * 8 7 6 *       * . | . *
                           5 \ ... / 0       \5...0/ 
               * 0              *               *
        */
        const geo = new THREE.BufferGeometry();

        const ptCoords = [
            [0.00, 0.25, 0.00], [ 0.70, 0.33, 0.40], [ 1.00, 0.60, 1.00], 
            [0.00, 1.00, 1.00], [-1.00, 0.60, 1.00], [-0.70, 0.33, 0.40], 
            [0.00, 0.75, 0.00]
        ];
        let pts = [];
        for ( let coord of ptCoords ) {
            pts.push( new THREE.Vector3( coord[0] * this.wid, coord[1] * this.len, coord[2] * this.dep) );
        }

        // edge = [edgeBegin, edgeEnd]
        const edgeIndices = [
            [0,1], [1,2], [2,3], [3,4], [4,5], [5,0], [0,2], [0,6], [0,4], [6,2], [6,3], [6,4]
        ];
        let edges = [];
        for ( let edge of edgeIndices ) {
            edges.push( new THREE.Vector3( 
                pts[edge[1]].x - pts[edge[0]].x, 
                pts[edge[1]].y - pts[edge[0]].y,
                pts[edge[1]].z - pts[edge[0]].z
            ) );
        }

        // get face vertices
        const faceIndices = [[0,1,2], [0,2,6], [6,2,3], [6,3,4], [0,6,4], [0,4,5]];
        let vertices = [];
        for ( let face of faceIndices ) {
            for (let ptIdx of face ) {
                vertices.push(...[pts[ptIdx].x, pts[ptIdx].y, pts[ptIdx].z]);
            }
        }

        // get face normals
        const faceNormalsV3 = [
            new THREE.Vector3().crossVectors( edges[0], edges[6] ).normalize(),
            new THREE.Vector3().crossVectors( edges[6], edges[7] ).normalize(),
            new THREE.Vector3().crossVectors( edges[9], edges[10] ).normalize(),
            new THREE.Vector3().crossVectors( edges[10], edges[11] ).normalize(),
            new THREE.Vector3().crossVectors( edges[7], edges[8] ).normalize(),
            new THREE.Vector3().crossVectors( edges[8], edges[5].clone().multiplyScalar(-1) ).normalize()
        ];

        // write vertex normals as an array of coordinates for each face;
        // use the same order for normals as was used for vertices ('position' attribute)
        let normals = [];
        for ( let faceNormal of faceNormalsV3 ) {
            for ( let i=0; i<3; i++ ) {
                normals.push(...[faceNormal.x, faceNormal.y, faceNormal.z]);
            }
        }

        geo.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geo.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );

        return geo;
    }

    makeCapsule() {
        // make leaf
        this.mat = new THREE.MeshPhongMaterial( { 
            color: this.color, shininess: 20, side: THREE.DoubleSide 
        } );
        const leafGeo = this.makeGeometry();

        const leaf = new THREE.Mesh( leafGeo, this.mat );
        leaf.castShadow = true; 
        leaf.receiveShadow = true;

        // make petiole
        const petioleGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(0,0.25, 0)
        ]);
        const petioleMat = new THREE.LineBasicMaterial({ color: this.color });
        const petiole = new THREE.Line( petioleGeo, petioleMat ); 
        
        // add all leaf parts to leaf capsule
        const capsule = new THREE.Object3D();
        capsule.add(leaf);
        capsule.add(petiole);
        capsule.name = 'leaf-capsule';

        return capsule
    }

    _create( visibleAxes=false ) {
        // leaf capsule
        this.capsule = this.makeCapsule();

        // leaf axes        
        this.axes = makeAxes( visibleAxes ); // defined in Part class

        // combine capsule + axes into final object
        this.obj = new THREE.Object3D();
        this.obj.add(this.capsule);
        this.obj.add(this.axes);
        this.obj.name = 'leaf';
        return this.obj;
    }

    static create(len=1, wid=1, dep=1, col=1, visibleAxes=false) {
        return new Leaf(len, wid, dep, col, visibleAxes);
    }
}

class LeafBuilder {
    constructor() {
        this._len = 1;
        this._wid = 1;
        this._dep = 1;
        this._col = '#ff0000';
        this._visibleAxes = false;
    }

    length(val)  {
        this._len = val;
    }

    width(val) {
        this._wid = val;
    }

    depth(val) {
        this._dep = val;
    }

    color(val) {
        this._col = val;
    }

    visibleAxes(val) {
        this._visibleAxes = val;
    }

    build() {
        return new Leaf(this._len, this._wid, this._dep, this._col, this._visibleAxes);
    }
}

