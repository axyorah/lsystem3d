class Leaf extends Part {
    constructor( len=1.0, wid=0.25, dep=0.1, color=0x00FF00 ) {
        super( len, wid, dep, color );
        
        /* 
        // recall: Part class contains the following attributes:
        this._len0 = len;
        this._wid0 = wid;
        this._dep0 = dep; 

        this._len = len;
        this._wid = wid;
        this._dep = dep;
        this._color = color;

        this.mat;  // material
        this.capsule; // THREE.Object3D which contains mesh(es) of the actual part
        this.axes; // axes that show part's orientation (needed for aligning the object to vectors)
        this.obj;  // capsule + axes (use this to rescale/reposition/reorient)

        // additionally, the following methods are available:
        getters for all non-THREE attributes (len, wid, color..)
        fwd() - part's forward axis TRHEE.Vector3
        top() - part's top axis THREE.Vector3
        side() - part's side axis THREE.Vector3
        makeUnitLine()
        makeAxes() 
        makeCapsule() <-- NEEDS TO BE OVERWRITTEN!
        makePart() <-- REPLACED BY `makeLeaf()`
        moveTo()
        orient()
        rescale()
        recolor()
        */
    }

    makeLeafGeometry() {
        /*
        assemble leaf geometry from the following scheme:

              pts           edges         faces
              * 3             *             *
                          3 / | \ 2       / | \
           * 4   * 2       *  7  *       * 2|1 *
                         4 |8 | 6| 1     |. | .|
           * 5   * 1       * .|. *       * .|. *
                          5 \ . / 0       \3.0/ 
              * 0             *             *
        */
        const geo = new THREE.BufferGeometry();

        const ptCoords = [
            [0.00, 0.25, 0.00], [ 0.70, 0.33, 0.40], [ 1.00, 0.60, 1.00], 
            [0.00, 1.00, 0.00], [-1.00, 0.60, 1.00], [-0.70, 0.33, 0.40]
        ];
        let pts = [];
        for ( let coord of ptCoords ) {
            pts.push( new THREE.Vector3( coord[0] * this.wid, coord[1] * this.len, coord[2] * this.dep) );
        }

        const edgeIndices = [
            [1,0], [2,1], [3,2], [4,3], [5,4], [0,5], [2,0], [3,0], [4,0]
        ];
        let edges = [];
        for ( let edge of edgeIndices ) {
            edges.push( new THREE.Vector3( 
                pts[edge[0]].x - pts[edge[1]].x, 
                pts[edge[0]].y - pts[edge[1]].y,
                pts[edge[0]].z - pts[edge[1]].z
            ) );
        }

        // get face vertices
        const faceIndices = [[0,1,2], [0,2,3], [0,3,4], [0,4,5]];
        let vertices = [];
        for ( let face of faceIndices ) {
            for (let ptIdx of face ) {
                vertices.push(...[pts[ptIdx].x, pts[ptIdx].y, pts[ptIdx].z]);
            }
        }

        // get face normals
        const faceNormalsV3 = [
            new THREE.Vector3().crossVectors( edges[1], edges[0].clone().multiplyScalar(-1) ).normalize(),
            new THREE.Vector3().crossVectors( edges[2], edges[6].clone().multiplyScalar(-1) ).normalize(),
            new THREE.Vector3().crossVectors( edges[8].clone().multiplyScalar(-1), edges[3].clone().multiplyScalar(-1) ).normalize(),
            new THREE.Vector3().crossVectors( edges[5], edges[4].clone().multiplyScalar(-1) ).normalize()
        ];

        // get vertex normals as averages of face normals
        const vertexNormalsV3 = [
            new THREE.Vector3(0,0,0)
                .add( faceNormalsV3[0] ).add( faceNormalsV3[1] ).add( faceNormalsV3[2] ).add( faceNormalsV3[3] )
                .multiplyScalar(0.25),
            faceNormalsV3[0],
            new THREE.Vector3(0,0,0).add( faceNormalsV3[0] ).add( faceNormalsV3[1] ).multiplyScalar(0.5),
            new THREE.Vector3(0,0,0).add( faceNormalsV3[1] ).add( faceNormalsV3[2] ).multiplyScalar(0.5),
            new THREE.Vector3(0,0,0).add( faceNormalsV3[2] ).add( faceNormalsV3[3] ).multiplyScalar(0.5),
            faceNormalsV3[3],
        ];

        // write vertex normals as an array of coordinates // opted out from using it, as it looks too smooth...
        let normals = [];
        // // this generates too smooth leaves...
        // for ( let face of faceIndices ) {
        //     for (let ptIdx of face ) {
        //         normals.push(...[vertexNormalsV3[ptIdx].x, vertexNormalsV3[ptIdx].y, vertexNormalsV3[ptIdx].z]);
        //     }
        // }
        // this generates proper low-poly leaves
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
        this.mat = new THREE.MeshPhongMaterial( { 
            color: this.color, shininess: 20, side: THREE.DoubleSide 
        } );
        const geo = this.makeLeafGeometry();

        const leaf = new THREE.Mesh( geo, this.mat );
        leaf.castShadow = true; 
        leaf.receiveShadow = true;
        
        // add all leaf parts into a leaf capsule
        const capsule = new THREE.Object3D();
        capsule.add(leaf);
        capsule.name = 'leaf-capsule';

        return capsule
    }

    makeLeaf( visibleAxes=false ) {
        // leaf capsule
        this.capsule = this.makeCapsule();

        // leaf axes        
        this.axes = this.makeAxes( visibleAxes ); // defined in Part class

        // combine capsule + axes into final object
        this.obj = new THREE.Object3D();
        this.obj.add(this.capsule);
        this.obj.add(this.axes);
        this.obj.name = 'leaf';
        return this.obj;
    }
}