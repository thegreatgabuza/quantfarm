// Initialize Three.js scene
let scene, camera, renderer, controls;
let farmModel = {
    fields: [],
    crops: [],
    livestock: [],
    equipment: []
};

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Setup camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 30, 50);

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create ground
    createGround();

    // Initialize farm elements
    initializeFarmElements();

    // Add to container
    const container = document.getElementById('demo3D');
    container.appendChild(renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x7cba3d,
        roughness: 0.8,
        metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

function initializeFarmElements() {
    // Create fields
    for (let i = 0; i < 4; i++) {
        const field = createField(-20 + i * 15, 0, -20);
        farmModel.fields.push(field);
        scene.add(field);
    }

    // Create crops (will be shown/hidden based on view)
    for (let i = 0; i < 16; i++) {
        const crop = createCrop(-20 + (i % 4) * 15, 0, -20 + Math.floor(i / 4) * 15);
        farmModel.crops.push(crop);
        scene.add(crop);
        crop.visible = false;
    }

    // Create livestock markers
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

    // Create equipment
    const tractor = createEquipment(0, 0, 0);
    farmModel.equipment.push(tractor);
    scene.add(tractor);
    tractor.visible = false;
}

function createField(x, y, z) {
    const fieldGeometry = new THREE.BoxGeometry(10, 0.2, 10);
    const fieldMaterial = new THREE.MeshStandardMaterial({
        color: 0x5d4037,
        roughness: 0.9
    });
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.position.set(x, y, z);
    field.receiveShadow = true;
    return field;
}

function createCrop(x, y, z) {
    const cropGeometry = new THREE.ConeGeometry(1, 3, 8);
    const cropMaterial = new THREE.MeshStandardMaterial({
        color: 0x33691e,
        roughness: 0.8
    });
    const crop = new THREE.Mesh(cropGeometry, cropMaterial);
    crop.position.set(x, y + 1.5, z);
    crop.castShadow = true;
    return crop;
}

function createLivestock(x, y, z) {
    const group = new THREE.Group();

    // Body
    const bodyGeometry = new THREE.BoxGeometry(2, 1.5, 3);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x8d6e63,
        roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    group.add(body);

    // Head
    const headGeometry = new THREE.BoxGeometry(1, 1, 1);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 1.75, 1.5);
    group.add(head);

    group.position.set(x, y, z);
    group.castShadow = true;
    return group;
}

function createEquipment(x, y, z) {
    const group = new THREE.Group();

    // Tractor body
    const bodyGeometry = new THREE.BoxGeometry(4, 2, 6);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xd32f2f,
        roughness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 2;
    group.add(body);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 16);
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
        group.add(wheel);
        wheels.push(wheel);
    });

    group.position.set(x, y, z);
    group.castShadow = true;
    return group;
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