let scene, camera, renderer, box;

function init(){
    
    // create scene 
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xDDDDDD);
    
    // create camera
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 3;

    // render to dom
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    
    // shadow
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    document.body.appendChild(renderer.domElement);
    
    // orbit
    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set(0,1,0);
    controls.update();
  
    // add light
    const light = new THREE.DirectionalLight();
    light.position.set(0,1,2);
    scene.add(light);

    // add box
    const geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({color: new THREE.Color('skyblue')});
    box = new THREE.Mesh(geometry, material);
    scene.add(box);

    box1 = new THREE.Mesh(geometry, material);
    scene.add(box1);
    box1.position.x = -1.5;

    box2 = new THREE.Mesh(geometry, material);
    scene.add(box2);
    box2.position.x = 1.5;

    window.addEventListener('resize', onResize, false);

    update();

}

function update(){
    requestAnimationFrame(update);
    box.rotation.y +=0.02;
    box.rotation.x +=0.02;

    box1.rotation.y +=0.01;
    box1.rotation.x +=0.01;

    box2.rotation.y +=0.03;
    box2.rotation.x +=0.03;
    renderer.render(scene, camera);
}
  
function onResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();