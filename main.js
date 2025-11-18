import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

// SCENE 
// container of your 3d world 
const scene = new THREE.Scene();
// add background color
const loader = new THREE.TextureLoader();
loader.load('stars.png', function(texture) {
    scene.background = texture;
});
// CAMERA

const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth/ window.innerHeight, //aspect ratio 
    0.1, //Objects closer to this are invisible
    1000000,// Objects farther than this are invisble
)
camera.position.set(0,0 ,1) // Sets up camera slightly up and to the back 

let targetZ = camera.position.z;
let targetY = camera.position.y;
const initialY = camera.position.y
const initialZ = camera.position.z; // starting zoom (close)
const maxZOffset = 100;              // how far camera can zoom outhow much zoom-out you want
const maxYOffset = 20 ;
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;

    const scrollRatio = scrollY / maxScroll; // 0 at top, 1 at bottom
    // Inverse zoom: scroll down → camera.z increases
    targetZ = initialZ + scrollRatio * maxZOffset;
    targetY = initialY + scrollRatio* maxYOffset;
});
// RENDERER
const renderer  = new THREE.WebGLRenderer({antialias : true}) // renderer lets draw a 3d scene on the <canvas> on a webpage ,  antialising blend the edges with the background instead of making objects look jagged or pixalated
renderer.setSize( window.innerWidth, window.innerHeight) // sets the canvas full screen 
document.body.appendChild(renderer.domElement) // adds the canvas to the HTML page



// Sun  (CENTER OBJECT )
loader.load('./Assets/Sun.png',(texture)=>{
    const bigGeo = new THREE.SphereGeometry(1 , 32 , 32) // creates a sphere of radius 1 with 32 segments for smoothness
    const bigMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,           // base color (orange-yellow)
        emissive: 0xff5500, 
        map:   texture,
        emissiveMap:texture,
        emissiveIntensity: 2    // glowing reddish-orange
        // emissiveIntensity: 5       // how strong the glow is
    });// material that reacts light
    const sun = new THREE.Mesh(bigGeo , bigMat) // combines shape + appearances into a 3d object
    planets_3d['Sun'] = sun ;
    scene.add(sun)
    
})


// LIGHT
 
const ambient = new THREE.AmbientLight(0xffffff, 0.1); // very low intensity
scene.add(ambient);
const light = new THREE.PointLight(0xffffff, 6, 1000); 
light.position.set(0,0,0);
scene.add(light);


let planets = [
  { angle : 0 ,name: 'Mercury', radius: 0.0035, orbitRadius: 0.13, speed: 0.032, color: 0x909090 }, // gray
  { angle : 0 , name: 'Venus',   radius: 0.0088, orbitRadius: 0.24, speed: 0.023, color: 0xffddaa }, // pale yellow
  { angle : 0 , name: 'Earth',   radius: 0.0091, orbitRadius: 0.33, speed: 0.02, color: 0x3399ff },  // blue
  { angle : 0 , name: 'Mars',    radius: 0.0049, orbitRadius: 0.51, speed: 0.016, color: 0xff5533 }, // red-orange
  { angle : 0 , name: 'Jupiter', radius: 0.102,  orbitRadius: 1.73, speed: 0.0088, color: 0xffaa77 },// beige/orange
  { angle : 0 , name: 'Saturn',  radius: 0.086,  orbitRadius: 3.19, speed: 0.0065, color: 0xffdd99 },// pale yellow
  { angle : 0 , name: 'Uranus',  radius: 0.038,  orbitRadius: 6.40, speed: 0.0046, color: 0x66ccff },// cyan/blue
  { angle : 0 , name: 'Neptune', radius: 0.035,  orbitRadius: 10.03, speed: 0.0036, color: 0x3366ff },// deep blue
];


// ORIBITS 

planets.forEach(planet =>{
    const segments = 64;
    let points = []
    // calculate points
    for(let i = 0 ; i <= segments; i++)
    {
        const theta = (i/segments)* Math.PI * 2;  // This gives a normalized fraction of the circle.  
        points.push(new THREE.Vector3(
            Math.cos(theta) * planet.orbitRadius,
            0,
            Math.sin(theta) * planet.orbitRadius,

        ))
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);//Takes an array of THREE.Vector3 points and stores them in the geometry
    const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true })
    const orbitLine = new THREE.LineLoop(geometry , lineMat)// Connects all points in order, and also connects the last point back to the first
    scene.add(orbitLine)

})

// SMALL ORBITING OBJECT

let planets_3d  = {}
planets.forEach( planet =>{
    
    const loader = new THREE.TextureLoader()
    loader.load(`./Assets/${planet.name}.png`,(texture)=>{
        
        const smallGeo = new THREE.SphereGeometry(planet.radius , 32 ,32) // createsa  spher of raidus 0.2 with 32 segmenets for smoothness
        const smallMat = new THREE.MeshStandardMaterial({
            map : texture,
            metalness: 0.3,
            roughness : 0.6,
        })
        const smallBall = new THREE.Mesh(smallGeo , smallMat)
        scene.add(smallBall)
        planets_3d[planet.name] = smallBall;
    })
  
})
console.log(planets_3d)



// INFO TEXT 

const infoBox = document.getElementById('info')
const messages = ["Scene created...", "Big ball added...", "Small ball added...", "Orbit logic active...", "Enjoy the motion :)"];
let msgIndex = 0; 

// INFO TEXT DISPLAY

function showMessages(){
    if(msgIndex < messages.length)
    {
        infoBox.innerText = messages[msgIndex++]
        setTimeout(showMessages , 800)   
    }
}
showMessages()


function animate(){

    requestAnimationFrame(animate) // calls this function 60 times per second
  
    // Smooth zoom
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    // Smoothly move camera
    planets.map(planet =>{
        if(planets_3d[planet.name])
        {
            planet.angle += planet.speed;
            planets_3d[planet.name].position.set(
                Math.cos(planet.angle) * planet.orbitRadius, 
                0,
                Math.sin(planet.angle) * planet.orbitRadius,
            )
            planets_3d[planet.name].rotation.y += 0.01;     

            
        }
    })
    if(planets_3d['Sun'])
    {
        planets_3d['Sun'].rotation.y += 0.01;   
    }
   
    renderer.render(scene, camera)
}
animate()


// Handle WINDOW  Resize

window.addEventListener('resize',()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})





