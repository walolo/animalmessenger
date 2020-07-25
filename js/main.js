//------------------------LOAD 3D------------------------//

let scene, camera, renderer, mixer, action, clips;
let mode = 'off';

init();


function init(){
    
    // create scene 
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);
    
    // create camera
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.x = -400;
    camera.position.y = 250;
    camera.position.z = 700;

    // render to dom
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
       
    document.getElementById('section_2').appendChild(renderer.domElement);
    
    // orbit
    const controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set(0,1,0);
    controls.update();

    // // dragndrop
    // let dragControls = new DragControls( objects, camera, renderer.domElement );
    // dragControls.addEventListener( 'dragstart', function ( event ) {
	// event.object.material.emissive.set( 0xaaaaaa );
    // } );
    // dragControls.addEventListener( 'dragend', function ( event ) {
	// event.object.material.emissive.set( 0x000000 );
    // } );
  
    // add light
    const light = new THREE.DirectionalLight();
    light.position.set(0,1,2);
    scene.add(light);

    // load gltf
    const loader = new THREE.GLTFLoader();

    loader.load(
        // resource URL
        '../src/scene.gltf',
        // called when the resource is loaded
        function ( gltf )  {
                
            // create animation             
            mixer = new THREE.AnimationMixer( gltf.scene );
            clips = gltf.animations;
            clip = THREE.AnimationClip.findByName( clips, 'Chat2' );
            action = mixer.clipAction( clip );
            action.play();
            
            // scale
            gltf.scene.scale.x = 2.5;
            gltf.scene.scale.y = 2.5;
            gltf.scene.scale.z = 2.5;

            // position
            gltf.scene.position.x = 200;
            gltf.scene.position.y = -160;
            gltf.scene.position.z = 0;

            scene.add( gltf.scene );
            update();
                
        },
        // called while loading is progressing
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        }
    );

    window.addEventListener('resize', onResize, false);

}


function dragnDrop(){

}

function update(){
    requestAnimationFrame(update);
    renderer.render(scene, camera);    
    if(mode == 'on'){
        mixer.update( 0.015 );
    } 
}
  
function onResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//------------------------EVENTS------------------------//

const from_input = document.getElementById('from_input');
const name_input = document.getElementById('name_input');
const mes_input = document.getElementById('mes_input');
const mes_output = document.getElementById('mes_output');

const all_save = document.getElementById('all_save');
const all_save_no = document.getElementById('all_save_no');
let date = new Date();

// animation-1 ON/OFF
document.getElementById('ani_1_on').addEventListener("click", ()=>{
    mode = 'on';
    document.getElementById('ani_1_on').style.color = "#ef4237";
    document.getElementById('ani_1_off').style.color = "#3c2415";
});

document.getElementById('ani_1_off').addEventListener("click", ()=>{
    mode = 'off';
    document.getElementById('ani_1_on').style.color = "#3c2415";
    document.getElementById('ani_1_off').style.color = "#ef4237";
});

// preview message
document.getElementById('name_input').addEventListener('input',(e)=>{
    let name = document.getElementById('name_input').value;
    let mes = document.getElementById('mes_input').value;
    document.getElementById('mes_output').textContent = 'Hi, '+ name +'. '+ mes;
});

document.getElementById('mes_input').addEventListener('input',(e)=>{
    let name = document.getElementById('name_input').value;
    let mes = document.getElementById('mes_input').value;
    document.getElementById('mes_output').textContent = 'Hi, '+ name +'. '+ mes;
});

// check input value
from_input.addEventListener('input', checkInput);
name_input.addEventListener('input', checkInput);
mes_input.addEventListener('input', checkInput);
// add and remove shake
all_save_no.addEventListener('click',shake);
all_save_no.addEventListener('mouseout',unShake);

//------------------------FIREBASE------------------------//

let message_id;
let url;
checkURL();

// CHECK URL
function checkURL(){
    let currentURL = window.location.href;
    let currentID = window.location.href.split('=')[1];
    let section = window.location.href.split('#')[1];

    if(section == 'section_2'){
        document.getElementById('section_1').style.display = 'none';
    }
    
    if(currentID){    
    // get data from db
        db.collection('message').doc(currentID).get().then(function(doc) {
            if (doc.exists) {                
                document.getElementById('section_1').style.display = 'none';                
                renderMessage(doc.data());
                console.log("Document data:", doc.data());
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
    }
}

// CLICK START
document.getElementById('start_btn').addEventListener("click", function(){
 
    // close section-1
    setTimeout(closeSection1, 1000);
});

// CLICK CREATE
all_save.addEventListener('click', () => {

    // add a new document with a generated id.
    db.collection('message').add({
        from: from_input.value,
        name: name_input.value,
        text: mes_input.value,
        time: date
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        message_id = docRef.id;
        // save doc.id to url
        url = '/public/index.html#section_2?id='+ message_id;
        history.pushState({},'title', url);
        // render ui
        renderControl();
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
    
});

//------------------------FUNCTIONS------------------------//
let step_0 = document.getElementsByClassName("step_0")[0];
let step_1 = document.getElementsByClassName("step_1")[0];
let step_2 = document.getElementsByClassName("step_2")[0];
let step_3 = document.getElementsByClassName("step_3")[0];
let step_4 = document.getElementsByClassName("step_4")[0];


// render after recieved url
function renderMessage(doc){
    
    //clear elements
    mes_output.textContent='';
    step_1.style.display ="none";
    step_3.style.display ="none";
    step_4.style.display ="none";
    all_save_no.style.display ="none";
    console.log(doc.name);

    // create control
    let step_4_title = document.createElement('div');
    step_4_title.setAttribute('id','step_4_title');
    step_4_title.textContent = 'YOU RECIEVED A MESSAGE !'; 

    let step_4_content = document.createElement('div');
    step_4_content.setAttribute('id','step_4_content');
    step_4_content.textContent = doc.from +' sent an Anminal Messager to deliver messages to you. Try to ZOOM and SWIPE to interact with the messenger !';    

    let step_4_content_1 = document.createElement('div');
    step_4_content_1.setAttribute('id','step_4_content_1');
    step_4_content_1.textContent = 'Want to send your own messenger? Hit the button below to start!'; 

    step_0.appendChild(step_4_title);
    step_0.appendChild(step_4_content);
    document.getElementsByClassName('line')[1].appendChild(step_4_content_1);
    
    document.getElementById("send_mes").style.display = 'block';

    // create message
    let div = document.createElement('div')
    div.setAttribute('data-id', message_id);
    div.textContent = 'Hi, '+doc.name + '. '+ doc.text;
    mes_output.appendChild(div);
}

// render after created
function renderControl(){
    
    let copy_link = document.getElementById("copy_link");
    let link = window.location.href;

    step_1.style.display ="none";
    step_2.style.display ="none";
    step_3.style.display ="none";
    all_save.style.display ="none";

    document.getElementsByClassName("line")[0].style.display ="none";
    document.getElementsByClassName("line")[1].style.display ="none";
    copy_link.style.display ="block";

    let step_4_title = document.createElement('div');
    step_4_title.setAttribute('id','step_4_title');
    step_4_title.textContent = 'HEY, ' + from_input.value + '.';

    let step_4_title_1 = document.createElement('div');
    step_4_title_1.setAttribute('id','step_4_title');
    step_4_title_1.textContent = 'YOU ARE ALL SET !';

    let step_4_content = document.createElement('div');
    step_4_content.setAttribute('id','step_4_content');
    step_4_content.textContent = 'The Animal Messenger is ready to deliver your message. Just click COPY LINK below and share it to ' + name_input.value +'. '+ name_input.value + ' would get your message in no time !' ;

    let input = document.createElement('textarea');
    input.setAttribute('id', 'input_copy');
    input.setAttribute('readonly','true');
    input.value = link;
 
    step_4.appendChild(step_4_title);
    step_4.appendChild(step_4_title_1);
    step_4.appendChild(step_4_content);
    step_4.appendChild(input);

    document.getElementById('input_copy').addEventListener('click', copyLink);
    document.getElementById('input_copy').addEventListener('click', showTooltip);
    document.getElementById('input_copy').addEventListener('mouseout', hideTooltip);

    document.getElementById('copy_link').addEventListener('click', copyLink);
    document.getElementById('copy_link').addEventListener('click', showTooltip);
    document.getElementById('copy_link').addEventListener('mouseout', hideTooltip);    
}

// copy link
function copyLink(){
    let input = document.getElementById('input_copy');
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand("copy");
    console.log(input.value);
}

// show tooltip
function showTooltip(){
    let tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'block';
}

// hide tooltip
function hideTooltip(){
    let tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}
// check input
function checkInput(){
    if(from_input.value.length == 0 || name_input.value.length == 0 || mes_input.value.length == 0 ){
        all_save.style.display = 'none';
        all_save_no.style.display = 'block';
    } else {
        all_save.style.display = 'block';
        all_save_no.style.display = 'none';
    }
}
// close section 1
function closeSection1(){
    document.getElementById('section_1').style.display = 'none';
}

// add shake
function shake(){
    let feature = document.getElementsByClassName('features')[0];
    feature.classList.add('shake');
}

// remove shake
function unShake(){
    let feature = document.getElementsByClassName('features')[0];
    feature.classList.remove('shake');
}

