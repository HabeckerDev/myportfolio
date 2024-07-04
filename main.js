import './style.css'
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ModuleCacheMap } from 'vite/runtime';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

// GLTF loader adding penny

const loader = new GLTFLoader();

loader.load( 'assets/Penny.gltf', function ( gltf ) {
  const penny_model = gltf.scene;
	
  // Change size and position

  penny_model.scale.set(.5,.5,.5);
  penny_model.position.set(-5,-5,-5);

  // Load texture

  const pennyTexture = new THREE.TextureLoader().load('assets/Penny.png', function (texture) {
    penny_model.traverse((child) => {
      if (child.isMesh) {
        child.material.map = texture;
        child.material.needsUpdate = true;
      }
    });
  });
  scene.add( penny_model );
}, undefined, function ( error ) {

	console.error( error );

} );

// Torus object

const geometry = new THREE.TorusGeometry(200, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0x3C0C5F });
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5,5,5)

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

// const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff});
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100) );

  star.position.set(x,y,z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// Background

// const spaceTexture = new THREE.TextureLoader().load('space.jpg');
const aiTexture = new THREE.TextureLoader().load('assets/aibg.jpg');
scene.background = aiTexture;

// Avatar

const dylanTexture = new THREE.TextureLoader().load('assets/dylan.jpg');

const dylan = new THREE.Mesh(
  new THREE.BoxGeometry(3,3,3),
  new THREE.MeshBasicMaterial({map: dylanTexture})
)

scene.add(dylan);

dylan.position.z = -5;
dylan.position.x = 2;

// Store initial rotation of Dylan object

const initialDylanRotation = {
  x: dylan.rotation.x,
  y: dylan.rotation.y
};

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  if (t >= -2) {
    // Reset rotation when at the top
    dylan.rotation.x = initialDylanRotation.x;
    dylan.rotation.y = initialDylanRotation.y - 0.1;
  } else {
    // Apply rotation based on scroll position
    dylan.rotation.y += 0.05;
    dylan.rotation.x += 0.05;
  }


  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  // controls.update();


  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// WebGL compatibility check

if ( WebGL.isWebGL2Available() ) {

	// Initiate function or other initializations here
	animate();

} else {

	const warning = WebGL.getWebGL2ErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );

}