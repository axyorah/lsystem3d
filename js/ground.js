function addFloatingRocktToScene( scene ) {
    const loader = new THREE.GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    loader.load( '../imgs/ground/floating-rock.glb', function ( gltf ) {
        gltf.scene.traverse( function( obj ) {            
            if ( obj instanceof THREE.Mesh ) {
                textureLoader.load('../imgs/ground/floating-rock.png', function ( texture ) {
                    texture.flipY = false;
                    obj.material = new THREE.MeshBasicMaterial({ map: texture });
                })
                obj.name = 'floating-rock';
            }
        });

        gltf.name = 'floating-rock-glb';
        gltf.scene.name = 'floating-rock-scene';

        gltf.scene.position.set(0, -1, 0);
        gltf.scene.scale.set(5,5,5);
        scene.add( gltf.scene ); 
           
    }, undefined, function ( error ) {    
        console.error( error );    
    } );
}