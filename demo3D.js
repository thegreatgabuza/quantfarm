// Initialize Three.js scene
let scene, camera, renderer, controls;
let farmModel = {
    fields: [],
    crops: [],
    livestock: [],
    equipment: []
};
let clock, mixers = [];
let skybox;
let weatherEffects = { particles: null, enabled: false };
let time = 0;

function init() {
    clock = new THREE.Clock();
    
    // Create scene with improved environment
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.FogExp2(0xDFE9F2, 0.0015);

    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 40, 60);

    // Setup renderer with improved quality
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Add controls with better constraints
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground
    controls.minDistance = 20;
    controls.maxDistance = 100;

    // Add enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFF5E6, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Add subtle hemisphere light for more natural lighting
    const hemisphereLight = new THREE.HemisphereLight(0xAEDCFF, 0x505050, 0.6);
    scene.add(hemisphereLight);

    // Create skybox
    createSkybox();

    // Create enhanced ground
    createGround();

    // Initialize farm elements
    initializeFarmElements();

    // Add to container
    const container = document.getElementById('demo3D');
    container.appendChild(renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function createSkybox() {
    // Simplified skybox with gradient and clouds
    const verticalDistance = 150;
    const skyGeometry = new THREE.SphereGeometry(250, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide,
    });
    skybox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skybox);

    // Add distant mountains for depth
    createDistantMountains();
}

function createDistantMountains() {
    const mountainGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const mountainCount = 200;
    const mountainRange = 250;
    
    for (let i = 0; i < mountainCount; i++) {
        const angle = (i / mountainCount) * Math.PI * 2;
        const radius = mountainRange + (Math.random() * 20 - 10);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const height = 30 + Math.random() * 40;
        
        vertices.push(x, 0, z);  // Base
        vertices.push(x + (-5 + Math.random() * 10), height, z + (-5 + Math.random() * 10));  // Peak
        vertices.push(x + (-5 + Math.random() * 10), 0, z + (-5 + Math.random() * 10));  // Base
    }
    
    mountainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const mountainMaterial = new THREE.MeshBasicMaterial({
        color: 0x3A557A,
        side: THREE.DoubleSide
    });
    
    const mountains = new THREE.Mesh(mountainGeometry, mountainMaterial);
    scene.add(mountains);
}

function createGround() {
    // Enhanced ground with texture
    const groundSize = 200;
    const textureResolution = 512;
    
    // Create base terrain
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 100, 100);
    
    // Generate terrain with subtle elevation variations
    const vertices = groundGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        // Skip the central farm area to keep it flat
        const x = vertices[i];
        const z = vertices[i + 2];
        const distanceFromCenter = Math.sqrt(x * x + z * z);
        
        if (distanceFromCenter > 40) {
            vertices[i + 1] = (Math.sin(x * 0.05) + Math.sin(z * 0.05)) * 2;
        }
    }
    
    // Create material with blended textures
    const grassColor = 0x7cba3d;
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: grassColor,
        roughness: 0.8,
        metalness: 0.1,
        flatShading: false
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add ambient vegetation (random small details)
    addAmbientVegetation();
}

function addAmbientVegetation() {
    // Add some random details to make the farm more lively
    // Small bushes and rocks in the distance
    for (let i = 0; i < 100; i++) {
        const distance = 40 + Math.random() * 60;
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        // 50% chance for bush, 50% for rock
        if (Math.random() > 0.5) {
            const bushSize = 0.5 + Math.random() * 1.5;
            const bushGeometry = new THREE.SphereGeometry(bushSize, 8, 6);
            const bushMaterial = new THREE.MeshStandardMaterial({
                color: 0x4A8522 + Math.random() * 0x101010,
                roughness: 0.9
            });
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.position.set(x, bushSize / 2, z);
            bush.castShadow = true;
            bush.receiveShadow = true;
            scene.add(bush);
        } else {
            const rockSize = 0.3 + Math.random() * 0.8;
            const rockGeometry = new THREE.DodecahedronGeometry(rockSize, 0);
            const rockMaterial = new THREE.MeshStandardMaterial({
                color: 0x808080 + Math.random() * 0x101010,
                roughness: 0.9
            });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(x, rockSize / 2, z);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            rock.castShadow = true;
            rock.receiveShadow = true;
            scene.add(rock);
        }
    }
}

function initializeFarmElements() {
    // Create fields with enhanced visuals
    for (let i = 0; i < 4; i++) {
        const field = createField(-20 + i * 15, 0, -20);
        farmModel.fields.push(field);
        scene.add(field);
    }

    // Create crops with animation
    for (let i = 0; i < 16; i++) {
        const crop = createCrop(-20 + (i % 4) * 15, 0, -20 + Math.floor(i / 4) * 15);
        farmModel.crops.push(crop);
        scene.add(crop);
        crop.visible = false;
    }

    // Create animated livestock
    for (let i = 0; i < 5; i++) {
        const livestock = createLivestock(
            Math.random() * 40 - 20,
            0,
            Math.random() * 40 - 20
        );
        farmModel.livestock.push(livestock);
        scene.add(livestock);
        livestock.visible = false;
    }

    // Create equipment with animation
    const tractor = createEquipment(10, 0, 10);
    farmModel.equipment.push(tractor);
    scene.add(tractor);
    tractor.visible = false;
    
    // Add a farm house and silo
    createFarmBuildings();
}

function createFarmBuildings() {
    // Simple farm house
    const houseGroup = new THREE.Group();
    
    // Main building
    const houseGeometry = new THREE.BoxGeometry(10, 6, 8);
    const houseMaterial = new THREE.MeshStandardMaterial({
        color: 0xE8DAB2,
        roughness: 0.7
    });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = 3;
    house.castShadow = true;
    house.receiveShadow = true;
    houseGroup.add(house);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(7.5, 4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 8;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    houseGroup.add(roof);
    
    // Silo
    const siloGeometry = new THREE.CylinderGeometry(2, 2, 12, 16);
    const siloMaterial = new THREE.MeshStandardMaterial({
        color: 0xD0D0D0,
        roughness: 0.5
    });
    const silo = new THREE.Mesh(siloGeometry, siloMaterial);
    silo.position.set(15, 6, 2);
    silo.castShadow = true;
    houseGroup.add(silo);
    
    // Silo roof
    const siloRoofGeometry = new THREE.ConeGeometry(2.2, 2, 16);
    const siloRoof = new THREE.Mesh(siloRoofGeometry, roofMaterial);
    siloRoof.position.set(15, 12, 2);
    siloRoof.castShadow = true;
    houseGroup.add(siloRoof);
    
    houseGroup.position.set(30, 0, -10);
    scene.add(houseGroup);
}

function createField(x, y, z) {
    const fieldGroup = new THREE.Group();
    
    // Improved ground texture for the field
    const fieldGeometry = new THREE.BoxGeometry(10, 0.3, 10);
    const fieldMaterial = new THREE.MeshStandardMaterial({
        color: 0x5d4037,
        roughness: 0.9,
        metalness: 0.2
    });
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.receiveShadow = true;
    fieldGroup.add(field);
    
    // Add field borders - wooden planks
    const borderGeometry = new THREE.BoxGeometry(10.5, 0.4, 0.5);
    const borderMaterial = new THREE.MeshStandardMaterial({
        color: 0x8d6e63,
        roughness: 0.9
    });
    
    const borders = [];
    for (let i = 0; i < 4; i++) {
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.receiveShadow = true;
        border.castShadow = true;
        
        if (i < 2) {
            border.position.z = (i === 0) ? -5 : 5;
        } else {
            border.rotation.y = Math.PI / 2;
            border.position.x = (i === 2) ? -5 : 5;
        }
        
        border.position.y = 0.2;
        fieldGroup.add(border);
    }
    
    fieldGroup.position.set(x, y, z);
    return fieldGroup;
}

function createCrop(x, y, z) {
    const cropGroup = new THREE.Group();
    
    // Create multiple stalks for a more realistic crop
    const stalkCount = 9; // 3x3 grid
    const spacing = 2;
    
    for (let i = 0; i < stalkCount; i++) {
        const row = Math.floor(i / 3) - 1;
        const col = (i % 3) - 1;
        
        const height = 2 + Math.random() * 1;
        const cropGeometry = new THREE.CylinderGeometry(0.05, 0.05, height, 5);
        const cropMaterial = new THREE.MeshStandardMaterial({
            color: 0x33691e,
            roughness: 0.8
        });
        const stalk = new THREE.Mesh(cropGeometry, cropMaterial);
        
        // Position within the field cell
        stalk.position.set(
            col * spacing/2, 
            height/2, 
            row * spacing/2
        );
        stalk.castShadow = true;
        
        // Add leaves
        const leafGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.2);
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: 0x558b2f,
            roughness: 0.8
        });
        
        // Add a few leaves
        for (let j = 0; j < 3; j++) {
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.y = -height/2 + 0.5 + j * 0.7;
            leaf.rotation.y = Math.random() * Math.PI * 2;
            leaf.rotation.z = Math.random() * 0.2 - 0.1;
            stalk.add(leaf);
        }
        
        cropGroup.add(stalk);
    }
    
    cropGroup.position.set(x, y + 1, z);
    
    // Add subtle animation to the crops
    cropGroup.userData = {
        initialY: y + 1,
        phase: Math.random() * Math.PI * 2
    };
    
    return cropGroup;
}

function createLivestock(x, y, z) {
    const group = new THREE.Group();

    // More detailed body
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 3);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x8d6e63,
        roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    body.castShadow = true;
    group.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(1, 1, 1.2);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 1.75, 1.5);
    head.castShadow = true;
    group.add(head);
    
    // Legs
    const legGeometry = new THREE.BoxGeometry(0.4, 1, 0.4);
    const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x6d4c41,
        roughness: 0.8
    });
    
    const legPositions = [
        [-0.7, 0.5, -1],
        [0.7, 0.5, -1],
        [-0.7, 0.5, 1],
        [0.7, 0.5, 1]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        group.add(leg);
    });
    
    // Ears
    const earGeometry = new THREE.BoxGeometry(0.3, 0.5, 0.2);
    const earMaterial = bodyMaterial;
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-0.5, 2.3, 1.5);
    leftEar.castShadow = true;
    group.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(0.5, 2.3, 1.5);
    rightEar.castShadow = true;
    group.add(rightEar);

    group.position.set(x, y, z);
    
    // Add animation data
    group.userData = {
        initialPosition: new THREE.Vector3(x, y, z),
        movementPhase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5
    };
    
    return group;
}

function createEquipment(x, y, z) {
    const group = new THREE.Group();

    // Tractor body
    const bodyGeometry = new THREE.BoxGeometry(4, 2, 6);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xd32f2f,
        roughness: 0.5,
        metalness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 2;
    body.castShadow = true;
    group.add(body);
    
    // Cabin
    const cabinGeometry = new THREE.BoxGeometry(3, 2, 2);
    const cabinMaterial = new THREE.MeshStandardMaterial({
        color: 0xd32f2f,
        roughness: 0.5,
        metalness: 0.2
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(0, 3.5, 0.5);
    cabin.castShadow = true;
    group.add(cabin);
    
    // Windows
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x90caf9,
        roughness: 0.2,
        metalness: 0.5
    });
    
    const frontWindowGeometry = new THREE.PlaneGeometry(2.5, 1.5);
    const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    frontWindow.position.set(0, 3.5, 1.55);
    group.add(frontWindow);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.7, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x212121,
        roughness: 0.8
    });

    const wheels = [];
    const wheelPositions = [
        [-1.5, 1, -2],
        [1.5, 1, -2],
        [-1.5, 1, 2],
        [1.5, 1, 2]
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        group.add(wheel);
        wheels.push(wheel);
    });
    
    // Exhaust pipe
    const exhaustGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const exhaustMaterial = new THREE.MeshStandardMaterial({
        color: 0x757575,
        roughness: 0.5,
        metalness: 0.8
    });
    const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaust.position.set(-1.5, 3, -2.5);
    exhaust.castShadow = true;
    group.add(exhaust);

    group.position.set(x, y, z);
    group.castShadow = true;
    
    // Add animation data
    group.userData = {
        wheels: wheels,
        initialPosition: new THREE.Vector3(x, y, z),
        route: generateRoute(),
        routeIndex: 0,
        speed: 0.2
    };
    
    return group;
}

function generateRoute() {
    // Create a route around the farm fields
    const route = [];
    // Outer perimeter route
    const perimeter = [
        new THREE.Vector3(30, 0, 30),
        new THREE.Vector3(-30, 0, 30),
        new THREE.Vector3(-30, 0, -30),
        new THREE.Vector3(30, 0, -30)
    ];
    
    route.push(...perimeter);
    return route;
}

function updateEquipment(delta) {
    farmModel.equipment.forEach(equipment => {
        if (!equipment.visible) return;
        
        const userData = equipment.userData;
        const route = userData.route;
        
        if (route && route.length > 0) {
            const targetPoint = route[userData.routeIndex];
            const direction = new THREE.Vector3().subVectors(targetPoint, equipment.position).normalize();
            
            // Move toward target point
            equipment.position.add(direction.multiplyScalar(userData.speed * delta * 5));
            
            // Rotate wheels
            userData.wheels.forEach(wheel => {
                wheel.rotation.x += delta * 2;
            });
            
            // Check if reached target point (within tolerance)
            if (equipment.position.distanceTo(targetPoint) < 1) {
                userData.routeIndex = (userData.routeIndex + 1) % route.length;
                
                // Face the next target
                const nextTarget = route[userData.routeIndex];
                const newDirection = new THREE.Vector3().subVectors(nextTarget, equipment.position).normalize();
                if (newDirection.length() > 0.1) {
                    const targetRotation = Math.atan2(newDirection.x, newDirection.z);
                    equipment.rotation.y = targetRotation;
                }
            }
        }
    });
}

function updateLivestock(delta) {
    farmModel.livestock.forEach(animal => {
        if (!animal.visible) return;
        
        const userData = animal.userData;
        
        // Simple wandering behavior
        userData.movementPhase += delta * userData.speed;
        
        // Create a slow wandering motion
        const wanderRadius = 5;
        const newX = userData.initialPosition.x + Math.cos(userData.movementPhase) * wanderRadius;
        const newZ = userData.initialPosition.z + Math.sin(userData.movementPhase * 0.7) * wanderRadius;
        
        // Smooth movement
        animal.position.x += (newX - animal.position.x) * 0.02;
        animal.position.z += (newZ - animal.position.z) * 0.02;
        
        // Face the direction of movement
        const direction = new THREE.Vector3(
            newX - animal.position.x,
            0,
            newZ - animal.position.z
        );
        
        if (direction.length() > 0.01) {
            const targetRotation = Math.atan2(direction.x, direction.z);
            animal.rotation.y = targetRotation;
        }
    });
}

function updateCrops(delta) {
    farmModel.crops.forEach(crop => {
        if (!crop.visible) return;
        
        const userData = crop.userData;
        userData.phase += delta * 0.5;
        
        // Gentle swaying motion
        const swayAmount = 0.1;
        crop.rotation.x = Math.sin(userData.phase) * swayAmount;
        crop.rotation.z = Math.cos(userData.phase * 0.7) * swayAmount;
    });
}

function showView(view) {
    // Hide all elements
    farmModel.fields.forEach(field => field.visible = false);
    farmModel.crops.forEach(crop => crop.visible = false);
    farmModel.livestock.forEach(animal => animal.visible = false);
    farmModel.equipment.forEach(equipment => equipment.visible = false);

    // Show relevant elements
    switch (view) {
        case 'fields':
            farmModel.fields.forEach(field => field.visible = true);
            break;
        case 'crops':
            farmModel.fields.forEach(field => field.visible = true);
            farmModel.crops.forEach(crop => crop.visible = true);
            break;
        case 'livestock':
            farmModel.fields.forEach(field => field.visible = true);
            farmModel.livestock.forEach(animal => animal.visible = true);
            break;
        case 'equipment':
            farmModel.fields.forEach(field => field.visible = true);
            farmModel.equipment.forEach(equipment => equipment.visible = true);
            break;
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    time += delta;
    
    // Update animations based on visible elements
    updateEquipment(delta);
    updateLivestock(delta);
    updateCrops(delta);
    
    // Gentle skybox rotation for cloud movement effect
    if (skybox) {
        skybox.rotation.y += delta * 0.01;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('demo3D');
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Initialize when the modal is shown
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('demoModal');
    const closeBtn = document.querySelector('.close-button');
    const demoBtn = document.querySelector('.cta-button');
    const viewButtons = document.querySelectorAll('.demo-btn');

    // Show modal when demo button is clicked
    demoBtn.addEventListener('click', () => {
        modal.classList.add('show');
        if (!scene) {
            init();
            animate();
        }
        onWindowResize();
        showView('fields'); // Default view
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // Handle view buttons
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            showView(button.dataset.view);
        });
    });
}); 