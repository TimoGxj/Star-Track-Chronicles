/**
 * 星轨纪事 - Star Track Chronicles
 * 一个基于Three.js的3D时间管理应用
 */

// ==================== 全局变量 ====================
let scene, camera, renderer, controls;
let planets = []; // 存储所有星球（事件）
let currentMode = 'all'; // 当前模式：all（默认显示全部）, capsule, track, milestone, letter
let selectedEvent = null;
let particleSystem = null;
let animationId = null;

// 数据存储
const APP_DATA_KEY = 'star_track_chronicles_data';
const ACHIEVEMENTS_KEY = 'star_track_achievements';

// 成就定义
const ACHIEVEMENTS = {
    first_event: { id: 'first_event', name: '起航', desc: '创建第一个事件', icon: '🚀', unlocked: false },
    ten_events: { id: 'ten_events', name: '群星璀璨', desc: '创建10个事件', icon: '⭐', unlocked: false },
    first_complete: { id: 'first_complete', name: '里程碑', desc: '完成第一个目标', icon: '🏆', unlocked: false },
    streak_7: { id: 'streak_7', name: '坚持不懈', desc: '连续签到7天', icon: '🔥', unlocked: false },
    night_owl: { id: 'night_owl', name: '夜猫子', desc: '在深夜创建事件', icon: '🦉', unlocked: false },
    early_bird: { id: 'early_bird', name: '早起鸟', desc: '在清晨创建事件', icon: '🐦', unlocked: false },
    letter_sent: { id: 'letter_sent', name: '时光信使', desc: '发送第一封时光信笺', icon: '✉️', unlocked: false },
    constellation: { id: 'constellation', name: '守护星座', desc: '生成你的专属星座', icon: '🌌', unlocked: false }
};

// 应用数据结构
let appData = {
    events: [],
    checkIns: [],
    settings: {
        voiceEnabled: false,
        notificationsEnabled: false,
        particlesEnabled: true,
        musicVolume: 50,
        timezone: 'Asia/Shanghai'
    },
    achievements: {...ACHIEVEMENTS}
};

// ==================== 初始化函数 ====================
function init() {
    console.log('🚀 初始化星轨纪事...');
    console.log('📍 当前时间:', new Date().toLocaleString());
    
    // 检查是否正在加载演示数据
    if (window._isLoadingDemo) {
        console.log('🎮 正在加载演示数据，跳过自动保存');
        window._isLoadingDemo = false; // 清除标志
    }
    
    // 加载数据
    loadData();
    
    console.log('💾 数据加载完成后，事件数量:', appData.events.length);
    
    // 显示加载界面
    showLoadingScreen();
    
    // 初始化Three.js场景
    setTimeout(() => {
        console.log('🎬 开始初始化Three.js场景...');
        
        try {
            initThreeJS();
            console.log('✅ Three.js场景初始化完成');
        } catch (e) {
            console.error('❌ Three.js初始化失败:', e);
        }
        
        try {
            initEventListeners();
            console.log('✅ 事件监听器绑定完成');
        } catch (e) {
            console.error('❌ 事件监听器绑定失败:', e);
        }
        
        try {
            initParticles();
            console.log('✅ 粒子系统初始化完成');
        } catch (e) {
            console.error('❌ 粒子系统初始化失败:', e);
        }
        
        try {
            updateEventsDisplay();
            console.log('✅ 事件列表显示完成');
        } catch (e) {
            console.error('❌ 事件列表显示失败:', e);
        }
        
        try {
            checkNotifications();
            console.log('✅ 通知检查完成');
        } catch (e) {
            console.error('❌ 通知检查失败:', e);
        }
        
        // 初始设置为"全部"模式
        try {
            currentMode = 'all';
            renderEventPlanets();
            focusMode('all');
            console.log('✅ 初始化为"全部"模式');
        } catch (e) {
            console.error('❌ 初始化模式失败:', e);
        }
        
        // 隐藏加载界面，显示主应用
        hideLoadingScreen();
        
        console.log('✨ 初始化完成！');
        console.log('📊 最终状态 - 事件数:', appData.events.length, '星球数:', planets.length);
    }, 3000); // 模拟加载时间
}

// 加载界面控制
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('active');
    
    // 火箭发射倒计时
    const countdownText = loadingScreen.querySelector('.countdown-text');
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        if (countdown > 0) {
            countdownText.textContent = `${countdown}...`;
            countdown--;
        } else {
            countdownText.textContent = '起飞！🚀';
            clearInterval(countdownInterval);
        }
    }, 1000);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');
    
    loadingScreen.classList.remove('active');
    appContainer.classList.remove('hidden');
    
    setTimeout(() => {
        appContainer.classList.add('visible');
    }, 100);
}

// ==================== Three.js 场景初始化 ====================
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    
    // 创建场景
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0e27, 0.0008);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        10000
    );
    camera.position.set(0, 50, 150);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // 添加轨道控制器
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // 添加点光源
    const pointLight = new THREE.PointLight(0x6b2fb5, 2, 1000);
    pointLight.position.set(0, 50, 50);
    scene.add(pointLight);
    
    // 添加星空背景
    createStarField();
    
    // 创建中心时间轴
    createTimeline();
    
    // 渲染事件星球
    renderEventPlanets();
    
    // 启动动画循环
    animate();
    
    // 窗口大小调整
    window.addEventListener('resize', onWindowResize);
}

// 创建星空背景
function createStarField() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// 创建中心时间轴
function createTimeline() {
    // 创建螺旋时间轴
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -100, 0),
        new THREE.Vector3(30, -50, 30),
        new THREE.Vector3(-30, 0, 30),
        new THREE.Vector3(30, 50, -30),
        new THREE.Vector3(0, 100, 0)
    ]);
    
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
        color: 0x6b2fb5,
        linewidth: 2,
        transparent: true,
        opacity: 0.6
    });
    
    const timeline = new THREE.Line(geometry, material);
    timeline.name = 'timeline';
    scene.add(timeline);
    
    // 添加时间轴发光效果
    const glowMaterial = new THREE.LineBasicMaterial({
        color: 0xd946ef,
        linewidth: 4,
        transparent: true,
        opacity: 0.3
    });
    const timelineGlow = new THREE.Line(geometry, glowMaterial);
    scene.add(timelineGlow);
}

// 渲染事件星球
function renderEventPlanets() {
    // 清除现有星球
    planets.forEach(planet => {
        scene.remove(planet.mesh);
    });
    planets = [];
    
    // 根据当前模式过滤事件
    let eventsToShow = appData.events;
    
    if (currentMode && currentMode !== 'all') {
        eventsToShow = appData.events.filter(e => e.type === currentMode);
    }
    
    console.log('🌟 正在渲染', eventsToShow.length, '个事件星球（模式：', currentMode, '）');
    
    // 根据过滤后的事件创建星球
    eventsToShow.forEach((event, index) => {
        createEventPlanet(event, index);
    });
    
    console.log('✅ 已创建', planets.length, '个星球');
}

// 创建单个事件星球
function createEventPlanet(event, index) {
    // 初始位置设置为原点，螺旋动画会负责实际定位
    const angle = (index / Math.max(appData.events.length, 1)) * Math.PI * 4;
    const radius = 60;
    const height = (index - appData.events.length / 2) * 30;
    
    const x = 0; // 初始位置为0，让螺旋动画控制
    const z = 0;
    const y = 0;
    
    // 根据事件类型选择颜色
    let color;
    switch(event.type) {
        case 'capsule':
            color = event.color || 0x00d4ff;
            break;
        case 'track':
            color = event.color || 0xffd700;
            break;
        case 'milestone':
            color = event.color || 0xd946ef;
            break;
        case 'letter':
            // 时光信笺使用自定义颜色
            if (typeof event.color === 'string') {
                color = parseInt(event.color.replace('#', ''), 16);
            } else {
                color = event.color || 0x10b981;
            }
            break;
        default:
            color = 0x6b2fb5;
    }
    
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        shininess: 100
    });
    
    let geometry;
    let group = new THREE.Group();
    
    // 创建发光材质
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3
    });
    
    // 创建文本提示（将在鼠标悬停时显示）
    group.userData.hoverInfo = {
        name: event.name,
        type: event.type,
        progress: event.progress || 0,
        date: event.date
    };
    
    // 根据事件类型创建不同的3D模型
    switch(event.type) {
        case 'capsule': // 时间胶囊 - 闹钟+星星
            // 闹钟圆盘
            const clockGeo = new THREE.CylinderGeometry(5, 5, 0.8, 32);
            const clock = new THREE.Mesh(clockGeo, material);
            clock.rotation.x = Math.PI / 2;
            group.add(clock);
            
            // 添加12个小星星代替数字
            for (let i = 0; i < 12; i++) {
                const starGeo = new THREE.IcosahedronGeometry(0.4);
                const star = new THREE.Mesh(starGeo, material);
                const angle = (i / 12) * Math.PI * 2;
                star.position.x = Math.cos(angle) * 4;
                star.position.z = Math.sin(angle) * 4;
                star.position.y = 0.4;
                star.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                group.add(star);
            }
            
            // 添加时针（代表时间流逝）
            const hourHand = new THREE.BoxGeometry(0.15, 2.5, 0.15);
            const hourHandMesh = new THREE.Mesh(hourHand, material);
            hourHandMesh.position.y = 0.4;
            hourHandMesh.rotation.z = -Math.PI / 3;
            group.add(hourHandMesh);
            
            // 添加分针
            const minuteHand = new THREE.BoxGeometry(0.1, 3, 0.1);
            const minuteHandMesh = new THREE.Mesh(minuteHand, material);
            minuteHandMesh.position.y = 0.4;
            minuteHandMesh.rotation.z = Math.PI / 6;
            group.add(minuteHandMesh);
            
            // 中心大星星
            const centerStar = new THREE.IcosahedronGeometry(1.2, 2);
            const centerStarMesh = new THREE.Mesh(centerStar, material);
            centerStarMesh.position.y = 0.4;
            group.add(centerStarMesh);
            
            // 顶部星星装饰
            const topStar = new THREE.TetrahedronGeometry(1.5);
            const topStarMesh = new THREE.Mesh(topStar, material);
            topStarMesh.position.y = 4;
            topStarMesh.rotation.set(Math.PI / 4, 0, 0);
            group.add(topStarMesh);
            
            // 发光效果
            const clockGlow = new THREE.Mesh(clockGeo.clone(), glowMaterial);
            clockGlow.scale.set(1.3, 1, 1.3);
            group.add(clockGlow);
            break;
            
        case 'track': // 目标星轨 - 根据进度动态生成轨道
            const progress = event.progress || 0;
            
            // 根据进度计算轨道数量（最多5个，每20%增加1个）
            const orbitCount = Math.min(5, Math.floor(progress / 20) + 1);
            
            // 如果完成100%，显示特殊效果
            if (progress >= 100) {
                // 一个大的发光轨道
                const bigOrbitGeo = new THREE.TorusGeometry(8, 0.5, 32, 100);
                const bigOrbitMat = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 1.5
                });
                const bigOrbit = new THREE.Mesh(bigOrbitGeo, bigOrbitMat);
                bigOrbit.rotation.x = Math.PI / 2;
                group.add(bigOrbit);
                
                // 中心星球变大
                const planetSize = 3;
                const planetGeo = new THREE.SphereGeometry(planetSize, 32, 32);
                const planetMat = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.8
                });
                const planet = new THREE.Mesh(planetGeo, planetMat);
                group.add(planet);
                
                // 添加额外的发光环
                const glowRingGeo = new THREE.RingGeometry(9, 10, 32);
                const glowRingMesh = new THREE.Mesh(glowRingGeo, glowMaterial);
                glowRingMesh.rotation.x = Math.PI / 2;
                group.add(glowRingMesh);
            } else {
                // 创建多个轨道
                for (let i = 1; i <= orbitCount; i++) {
                    const orbitRadius = i * 1.5;
                    const orbitGeo = new THREE.TorusGeometry(orbitRadius, 0.3, 16, 64);
                    const orbitMat = new THREE.MeshPhongMaterial({
                        color: color,
                        emissive: color,
                        emissiveIntensity: 0.5 + (i / orbitCount) * 0.3
                    });
                    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
                    orbit.rotation.x = Math.PI / 2 + (i * Math.PI / 4);
                    group.add(orbit);
                }
                
                // 中心星球（根据进度变化大小）
                const planetSize = 1 + (progress / 100) * 2;
                const planetGeo = new THREE.SphereGeometry(planetSize, 32, 32);
                const planet = new THREE.Mesh(planetGeo, material);
                group.add(planet);
            }
            break;
            
        case 'milestone': // 里程碑 - 冠军奖杯
            // 奖杯底座（大圆柱）
            const baseGeo = new THREE.CylinderGeometry(5.5, 6, 2, 16);
            const base = new THREE.Mesh(baseGeo, material);
            base.position.y = -4.5;
            group.add(base);
            
            // 奖杯杯身（细长）
            const cupGeo = new THREE.CylinderGeometry(3.5, 3, 12, 16);
            const cup = new THREE.Mesh(cupGeo, material);
            cup.position.y = 1;
            group.add(cup);
            
            // 奖杯杯口（喇叭状）
            const rimGeo = new THREE.ConeGeometry(4, 2, 16);
            const rim = new THREE.Mesh(rimGeo, material);
            rim.position.y = 8;
            group.add(rim);
            
            // 奖杯顶部（冠军标志）
            const topGeo = new THREE.OctahedronGeometry(2.5);
            const top = new THREE.Mesh(topGeo, material);
            top.position.y = 10;
            top.rotation.set(Math.PI / 4, 0, Math.PI / 4);
            group.add(top);
            
            // 装饰条纹（奖杯上的纹理）
            for (let i = 0; i < 3; i++) {
                const stripeGeo = new THREE.TorusGeometry(3.2, 0.2, 8, 16);
                const stripe = new THREE.Mesh(stripeGeo, material);
                stripe.position.y = -2 + i * 4;
                group.add(stripe);
            }
            
            // 光环效果（多层环）
            for (let i = 0; i < 4; i++) {
                const auraRadius = 8 + i * 1.5;
                const auraGeo = new THREE.RingGeometry(auraRadius - 0.5, auraRadius + 0.5, 32);
                const auraMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.3 - i * 0.08,
                    side: THREE.DoubleSide
                });
                const aura = new THREE.Mesh(auraGeo, auraMaterial);
                aura.rotation.x = -Math.PI / 2;
                aura.position.y = 5;
                group.add(aura);
            }
            
            // 顶部发光星星
            for (let i = 0; i < 6; i++) {
                const starGeo = new THREE.IcosahedronGeometry(0.8, 0);
                const starMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffd700,
                    emissive: 0xffd700,
                    emissiveIntensity: 1
                });
                const star = new THREE.Mesh(starGeo, starMaterial);
                const angle = (i / 6) * Math.PI * 2;
                star.position.set(
                    Math.cos(angle) * 6,
                    5,
                    Math.sin(angle) * 6
                );
                star.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );
                group.add(star);
            }
            
            // 整体发光效果
            const trophyGlow = new THREE.Mesh(baseGeo.clone(), glowMaterial);
            trophyGlow.scale.set(1.3, 1.3, 1.3);
            trophyGlow.position.y = -4;
            group.add(trophyGlow);
            break;
            
        case 'letter': // 时光信笺 - 简洁信封
            // 创建五角星函数
            function createStar(radiusOuter, radiusInner) {
                const star = new THREE.Shape();
                for (let i = 0; i < 10; i++) {
                    const angle = (Math.PI / 5) * i;
                    const radius = i % 2 === 0 ? radiusOuter : radiusInner;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (i === 0) {
                        star.moveTo(x, y);
                    } else {
                        star.lineTo(x, y);
                    }
                }
                star.closePath();
                return star;
            }
            
            // 信封主体
            const envelopeGeo = new THREE.BoxGeometry(10, 12, 0.8);
            const envelope = new THREE.Mesh(envelopeGeo, material);
            envelope.position.y = 0;
            group.add(envelope);
            
            // 信封三角形盖子（打开状态）
            const flapShape = new THREE.Shape();
            flapShape.moveTo(-5, 0);
            flapShape.lineTo(0, 4);
            flapShape.lineTo(5, 0);
            flapShape.lineTo(-5, 0);
            const flapGeo = new THREE.ShapeGeometry(flapShape);
            const flapMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.9
            });
            const flap = new THREE.Mesh(flapGeo, flapMaterial);
            flap.position.set(0, 6, 0.3);
            group.add(flap);
            
            // 获取星星数量（从event中读取）
            const starCount = event.starCount || 3; // 默认3颗
            const starsPerRow = 3; // 每行3颗
            
            // 添加五角星装饰（根据starCount，自动换行）
            for (let i = 0; i < starCount; i++) {
                const starShape = createStar(1.2, 0.5);
                const extrudeSettings = {
                    depth: 0.3,
                    bevelEnabled: false
                };
                try {
                    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
                    const starMaterial = new THREE.MeshBasicMaterial({
                        color: 0xffd700, // 金色星星
                        emissive: 0xffd700,
                        emissiveIntensity: 0.5
                    });
                    const star = new THREE.Mesh(starGeo, starMaterial);
                    // 计算位置：每行3颗，超过3颗换行
                    const row = Math.floor(i / starsPerRow);
                    const col = i % starsPerRow;
                    const spacing = 2.5; // 星星间距
                    const rowHeight = -2.5; // 行高差（增大行距）
                    star.position.set(
                        -2.5 + col * spacing,
                        2 + row * rowHeight,
                        0.5
                    );
                    star.rotation.z = Math.random() * Math.PI;
                    group.add(star);
                } catch (e) {
                    // 如果ExtrudeGeometry失败，使用替代方案
                    const altGeo = new THREE.SphereGeometry(0.6);
                    const starMaterial = new THREE.MeshBasicMaterial({
                        color: 0xffd700,
                        emissive: 0xffd700,
                        emissiveIntensity: 0.5
                    });
                    const altStar = new THREE.Mesh(altGeo, starMaterial);
                    const row = Math.floor(i / starsPerRow);
                    const col = i % starsPerRow;
                    const spacing = 2.5;
                    const rowHeight = -1.8; // 行高差（增大行距）
                    altStar.position.set(-2.5 + col * spacing, 2 + row * rowHeight, 0.5);
                    group.add(altStar);
                }
            }
            
            // 发光效果
            const envelopeGlow = new THREE.Mesh(envelopeGeo.clone(), glowMaterial);
            envelopeGlow.scale.set(1.1, 1.1, 1.1);
            group.add(envelopeGlow);
            break;
            
        default: // 默认类型
            const defaultGeo = new THREE.SphereGeometry(5, 32, 32);
            const defaultMesh = new THREE.Mesh(defaultGeo, material);
            group.add(defaultMesh);
            break;
    }
    
    group.position.set(x, y, z);
    group.userData = { event: event, index: index };
    
    // 添加光环（针对重要事件）
    if (event.important) {
        const ringGeometry = new THREE.RingGeometry(7, 8, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
    }
    
    scene.add(group);
    planets.push({
        mesh: group,
        event: event,
        rotationSpeed: Math.random() * 0.02 + 0.01
    });
}

// 当前聚焦的事件组
let focusedEventGroup = null;
let rotationCenter = new THREE.Vector3(0, 0, 0);

// 行配置：type -> {y, radius, speed, paused}
const rowConfigs = {
    'capsule': { y: -40, radius: 80, speed: 0.0003, paused: false },
    'track': { y: -13, radius: 80, speed: 0.0003, paused: false },
    'milestone': { y: 13, radius: 80, speed: 0.0003, paused: false },
    'letter': { y: 40, radius: 80, speed: 0.0003, paused: false }
};

// 动画循环
function animate() {
    animationId = requestAnimationFrame(animate);
    
    // 更新控制器
    controls.update();
    
    // 根据类型分组星球
    const planetsByType = {};
    planets.forEach((planet, index) => {
        const type = planet.event.type;
        if (!planetsByType[type]) {
            planetsByType[type] = [];
        }
        planetsByType[type].push(planet);
    });
    
    // 更新每行的位置
    Object.keys(rowConfigs).forEach(type => {
        const config = rowConfigs[type];
        const rowPlanets = planetsByType[type] || [];
        
        if (rowPlanets.length > 0 && !config.paused) {
            const time = Date.now() * config.speed;
            
            rowPlanets.forEach((planet, index) => {
                // 计算该星球在这一行中的角度
                const angleOffset = (index / rowPlanets.length) * Math.PI * 2;
                const angle = time + angleOffset;
                
                // 计算围绕中心轴旋转的位置
                const x = Math.cos(angle) * config.radius;
                const z = Math.sin(angle) * config.radius;
                const y = config.y;
                
                planet.mesh.position.set(x, y, z);
                
                // 让星球面向中心
                planet.mesh.lookAt(0, y, 0);
            });
        }
    });
    
    // 星球自转
    planets.forEach(planet => {
        planet.mesh.rotation.y += planet.rotationSpeed;
    });
    
    // 旋转时间轴
    const timeline = scene.getObjectByName('timeline');
    if (timeline) {
        timeline.rotation.y += 0.001;
    }
    
    // 如果聚焦了某个事件组，相机围绕中心旋转（只有特定模式才会自动旋转）
    if (focusedEventGroup && currentMode && currentMode !== 'all' && false) { // 暂时禁用自动旋转
        const cameraSpeed = Date.now() * 0.0003;
        const cameraRadius = 120;
        
        camera.position.x = rotationCenter.x + Math.cos(cameraSpeed) * cameraRadius;
        camera.position.z = rotationCenter.z + Math.sin(cameraSpeed) * cameraRadius;
        camera.position.y = rotationCenter.y + 50;
        camera.lookAt(rotationCenter);
        
        // 更新控制器目标
        controls.target.copy(rotationCenter);
    }
    
    // 渲染场景
    renderer.render(scene, camera);
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== 粒子系统 ====================
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// 触发烟花效果
function triggerFireworks(x, y, color = '#00d4ff') {
    if (!appData.settings.particlesEnabled) return;
    
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    const particles = [];
    const particleCount = 100;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            color: color
        });
    }
    
    function animateFireworks() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // 重力
            p.life -= 0.01;
            
            if (p.life <= 0) {
                particles.splice(index, 1);
                return;
            }
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();
        });
        
        if (particles.length > 0) {
            requestAnimationFrame(animateFireworks);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    animateFireworks();
}

// 触发极光效果
function triggerAurora() {
    if (!appData.settings.particlesEnabled) return;
    
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    let time = 0;
    const duration = 3000;
    const startTime = Date.now();
    
    function animateAurora() {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, `rgba(0, 212, 255, ${0.3 * (1 - elapsed / duration)})`);
        gradient.addColorStop(0.5, `rgba(217, 70, 239, ${0.3 * (1 - elapsed / duration)})`);
        gradient.addColorStop(1, `rgba(255, 215, 0, ${0.3 * (1 - elapsed / duration)})`);
        
        ctx.fillStyle = gradient;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);
            for (let x = 0; x <= canvas.width; x += 10) {
                const y = canvas.height / 2 + Math.sin(x * 0.01 + time + i) * 50;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.fill();
        }
        
        time += 0.1;
        requestAnimationFrame(animateAurora);
    }
    
    animateAurora();
}

// ==================== 事件监听器 ====================
function initEventListeners() {
    // 导航按钮
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('🔘 点击了按钮:', btn.dataset.mode);
            
            // 更新活动按钮
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新当前模式
            currentMode = btn.dataset.mode;
            console.log('📌 当前模式设置为:', currentMode);
            
            // 过滤事件
            filterEventsByMode();
        });
    });
    
    // 创建按钮
    document.getElementById('create-btn').addEventListener('click', () => {
        openCreatePanel();
    });
    
    // 关闭面板
    document.getElementById('close-panel').addEventListener('click', () => {
        closePanel();
    });
    
    // 成就按钮
    document.getElementById('achievements-btn').addEventListener('click', () => {
        openModal('achievements-modal');
        renderAchievements();
        renderConstellation();
    });
    
    // 设置按钮
    document.getElementById('settings-btn').addEventListener('click', () => {
        openModal('settings-modal');
        loadSettings();
    });
    
    // 侧边栏折叠
    document.getElementById('collapse-sidebar').addEventListener('click', () => {
        document.getElementById('events-sidebar').classList.toggle('collapsed');
    });
    
    // 设置项
    document.getElementById('voice-enabled').addEventListener('change', (e) => {
        appData.settings.voiceEnabled = e.target.checked;
        saveData();
    });
    
    document.getElementById('notifications-enabled').addEventListener('change', (e) => {
        appData.settings.notificationsEnabled = e.target.checked;
        if (e.target.checked) {
            requestNotificationPermission();
        }
        saveData();
    });
    
    document.getElementById('particles-enabled').addEventListener('change', (e) => {
        appData.settings.particlesEnabled = e.target.checked;
        saveData();
    });
    
    document.getElementById('music-volume').addEventListener('input', (e) => {
        appData.settings.musicVolume = e.target.value;
        saveData();
    });
    
    document.getElementById('timezone-select').addEventListener('change', (e) => {
        appData.settings.timezone = e.target.value;
        saveData();
    });
    
    // 点击事件星球
    renderer.domElement.addEventListener('click', onPlanetClick);
    
    // 鼠标悬停事件（显示提示信息）
    renderer.domElement.addEventListener('mousemove', onPlanetHover);
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// 键盘快捷键处理
function handleKeyboardShortcuts(e) {
    // 如果正在输入，不触发快捷键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch(e.key.toLowerCase()) {
        case 'escape':
            // 关闭所有面板和模态框
            closePanel();
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
            break;
        case 'n':
            // 创建新事件
            openCreatePanel();
            break;
        case 'a':
            // 打开成就系统
            openModal('achievements-modal');
            renderAchievements();
            renderConstellation();
            break;
        case 's':
            // 打开设置
            openModal('settings-modal');
            loadSettings();
            break;
        case 'l':
            // 切换侧边栏
            document.getElementById('events-sidebar').classList.toggle('collapsed');
            break;
        case '1':
            // 切换到时间胶囊
            document.querySelector('.nav-btn[data-mode="capsule"]').click();
            break;
        case '2':
            // 切换到目标星轨
            document.querySelector('.nav-btn[data-mode="track"]').click();
            break;
        case '3':
            // 切换到里程碑
            document.querySelector('.nav-btn[data-mode="milestone"]').click();
            break;
        case '4':
            // 切换到时光信笺
            document.querySelector('.nav-btn[data-mode="letter"]').click();
            break;
    }
}

// 悬停信息提示
let hoveredPlanet = null;
const tooltip = document.createElement('div');
tooltip.style.cssText = `
    position: fixed;
    background: rgba(10, 14, 39, 0.95);
    backdrop-filter: blur(20px);
    border: 2px solid rgba(107, 47, 181, 0.5);
    border-radius: 12px;
    padding: 15px 20px;
    pointer-events: none;
    z-index: 1000;
    max-width: 300px;
    font-size: 14px;
    display: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
`;
document.body.appendChild(tooltip);

function onPlanetHover(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // 获取所有星球对象
    const objectsToIntersect = [];
    planets.forEach(planet => {
        planet.mesh.traverse((child) => {
            if (child.isMesh) {
                objectsToIntersect.push(child);
            }
        });
    });
    
    const intersects = raycaster.intersectObjects(objectsToIntersect);
    
    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        
        // 向上查找父级，找到事件数据
        let current = hoveredObject;
        while (current && !current.userData.event) {
            current = current.parent;
        }
        
        if (current && current.userData.event && current.userData.event !== hoveredPlanet) {
            hoveredPlanet = current.userData.event;
            
            // 暂停该行旋转
            const eventType = hoveredPlanet.type;
            if (rowConfigs[eventType]) {
                rowConfigs[eventType].paused = true;
            }
            
            // 显示提示信息
            const eventData = hoveredPlanet;
            let tooltipHTML = `<div style="color: ${eventData.color}; font-weight: bold; font-size: 16px; margin-bottom: 8px;">${eventData.name}</div>`;
            
            // 根据类型显示不同信息
            if (eventData.type === 'capsule') {
                const countdown = getCountdown(eventData.date);
                tooltipHTML += `<div style="color: #00d4ff;">⏰ ${countdown.text}</div>`;
            } else if (eventData.type === 'track') {
                tooltipHTML += `<div style="color: #ffd700;">🎯 进度: ${eventData.progress || 0}%</div>`;
                if (eventData.progress >= 100) {
                    tooltipHTML += `<div style="color: #10b981;">✅ 已完成！</div>`;
                }
            } else if (eventData.type === 'milestone') {
                tooltipHTML += `<div style="color: #d946ef;">🏆 里程碑成就</div>`;
            } else if (eventData.type === 'letter') {
                tooltipHTML += `<div style="color: #10b981;">📜 时光信笺</div>`;
                const countdown = getCountdown(eventData.date);
                tooltipHTML += `<div style="color: #10b981; font-size: 12px;">开启: ${countdown.text}</div>`;
            }
            
            if (eventData.description) {
                tooltipHTML += `<div style="color: #d4d4d8; font-size: 12px; margin-top: 8px;">${eventData.description}</div>`;
            }
            
            tooltip.innerHTML = tooltipHTML;
            tooltip.style.display = 'block';
            tooltip.style.left = (event.clientX + 15) + 'px';
            tooltip.style.top = (event.clientY + 15) + 'px';
        }
    } else {
        if (hoveredPlanet) {
            // 恢复该行旋转
            const eventType = hoveredPlanet.type;
            if (rowConfigs[eventType]) {
                rowConfigs[eventType].paused = false;
            }
            
            hoveredPlanet = null;
            tooltip.style.display = 'none';
        }
    }
}

// 点击星球事件
function onPlanetClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // 获取所有星球对象（group的所有子对象）
    const objectsToIntersect = [];
    planets.forEach(planet => {
        planet.mesh.traverse((child) => {
            if (child.isMesh) {
                objectsToIntersect.push(child);
            }
        });
    });
    
    const intersects = raycaster.intersectObjects(objectsToIntersect);
    
    if (intersects.length > 0) {
        // 找到被点击的对象
        const clickedObject = intersects[0].object;
        
        // 向上查找父级，找到事件数据
        let current = clickedObject;
        while (current && !current.userData.event) {
            current = current.parent;
        }
        
        if (current && current.userData.event) {
            const eventData = current.userData.event;
            console.log('点击了事件:', eventData.name);
            showEventDetails(eventData);
        }
    }
}

// ==================== UI 交互函数 ====================
function openCreatePanel() {
    const panel = document.getElementById('control-panel');
    const content = document.getElementById('panel-content');
    
    panel.classList.add('open');
    
    // 根据当前模式生成表单
    let formHTML = '';
    
    switch(currentMode) {
        case 'capsule':
            formHTML = generateCapsuleForm();
            break;
        case 'track':
            formHTML = generateTrackForm();
            break;
        case 'milestone':
            formHTML = generateMilestoneForm();
            break;
        case 'letter':
            formHTML = generateLetterForm();
            break;
        default:
            // 如果是"全部"模式，提示选择具体类型
            formHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h3 style="color: #d946ef; margin-bottom: 20px;">请选择事件类型</h3>
                    <p style="color: #d4d4d8; margin-bottom: 30px;">在顶部导航栏选择一个具体类型（时间胶囊、目标星轨、里程碑、时光信笺）</p>
                </div>
            `;
    }
    
    content.innerHTML = formHTML;
    
    // 绑定提交事件
    const submitBtn = content.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleCreateEvent);
    }
}

function closePanel() {
    document.getElementById('control-panel').classList.remove('open');
}

// 生成时间胶囊表单
function generateCapsuleForm() {
    return `
        <form id="capsule-form">
            <div class="form-group">
                <label>事件名称</label>
                <input type="text" class="form-control" id="event-name" placeholder="例如：生日快乐" required>
            </div>
            <div class="form-group">
                <label>目标日期</label>
                <input type="datetime-local" class="form-control" id="event-date" required>
            </div>
            <div class="form-group">
                <label>事件描述</label>
                <textarea class="form-control" id="event-desc" placeholder="写下你的期待..."></textarea>
            </div>
            <div class="form-group">
                <label>选择颜色</label>
                <div class="color-picker-group">
                    <div class="color-option selected" style="background: #00d4ff;" data-color="#00d4ff"></div>
                    <div class="color-option" style="background: #ffd700;" data-color="#ffd700"></div>
                    <div class="color-option" style="background: #d946ef;" data-color="#d946ef"></div>
                    <div class="color-option" style="background: #10b981;" data-color="#10b981"></div>
                    <div class="color-option" style="background: #ef4444;" data-color="#ef4444"></div>
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="event-important"> 标记为重要事件
                </label>
            </div>
            <button type="button" class="btn btn-primary submit-btn" style="width: 100%;">🚀 创建时间胶囊</button>
        </form>
    `;
}

// 生成目标星轨表单
function generateTrackForm() {
    return `
        <form id="track-form">
            <div class="form-group">
                <label>目标名称</label>
                <input type="text" class="form-control" id="event-name" placeholder="例如：考研冲刺" required>
            </div>
            <div class="form-group">
                <label>目标日期</label>
                <input type="date" class="form-control" id="event-date" required>
            </div>
            <div class="form-group">
                <label>当前进度 (%)</label>
                <input type="number" class="form-control" id="event-progress" min="0" max="100" value="0">
            </div>
            <div class="form-group">
                <label>里程碑节点（每行一个）</label>
                <textarea class="form-control" id="event-milestones" placeholder="例如：\n完成基础复习\n完成强化训练\n完成模拟考试"></textarea>
            </div>
            <div class="form-group">
                <label>选择颜色</label>
                <div class="color-picker-group">
                    <div class="color-option" style="background: #00d4ff;" data-color="#00d4ff"></div>
                    <div class="color-option selected" style="background: #ffd700;" data-color="#ffd700"></div>
                    <div class="color-option" style="background: #d946ef;" data-color="#d946ef"></div>
                    <div class="color-option" style="background: #10b981;" data-color="#10b981"></div>
                    <div class="color-option" style="background: #ef4444;" data-color="#ef4444"></div>
                </div>
            </div>
            <button type="button" class="btn btn-primary submit-btn" style="width: 100%;">🎯 创建目标星轨</button>
        </form>
    `;
}

// 生成里程碑表单
function generateMilestoneForm() {
    return `
        <form id="milestone-form">
            <div class="form-group">
                <label>里程碑名称</label>
                <input type="text" class="form-control" id="event-name" placeholder="例如：大学毕业" required>
            </div>
            <div class="form-group">
                <label>达成日期</label>
                <input type="date" class="form-control" id="event-date" required>
            </div>
            <div class="form-group">
                <label>里程碑描述</label>
                <textarea class="form-control" id="event-desc" placeholder="记录这个重要时刻..."></textarea>
            </div>
            <div class="form-group">
                <label>选择颜色</label>
                <div class="color-picker-group">
                    <div class="color-option" style="background: #00d4ff;" data-color="#00d4ff"></div>
                    <div class="color-option" style="background: #ffd700;" data-color="#ffd700"></div>
                    <div class="color-option selected" style="background: #d946ef;" data-color="#d946ef"></div>
                    <div class="color-option" style="background: #10b981;" data-color="#10b981"></div>
                    <div class="color-option" style="background: #ef4444;" data-color="#ef4444"></div>
                </div>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="event-important"> 标记为重要里程碑
                </label>
            </div>
            <button type="button" class="btn btn-primary submit-btn" style="width: 100%;">🏆 创建里程碑</button>
        </form>
    `;
}

// 生成时光信笺表单
function generateLetterForm() {
    return `
        <form id="letter-form">
            <div class="form-group">
                <label>信件标题</label>
                <input type="text" class="form-control" id="letter-title" placeholder="给未来的自己" required>
            </div>
            <div class="form-group">
                <label>开启日期</label>
                <input type="date" class="form-control" id="letter-date" required>
            </div>
            <div class="form-group">
                <label>信件内容</label>
                <textarea class="form-control" id="letter-content" placeholder="写下你想对未来说的话..." style="min-height: 200px;" required></textarea>
            </div>
            <div class="form-group">
                <label>信封颜色</label>
                <div class="color-picker" style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <div class="color-option selected" data-color="#10b981" style="background: #10b981; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
                    <div class="color-option" data-color="#00d4ff" style="background: #00d4ff; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
                    <div class="color-option" data-color="#d946ef" style="background: #d946ef; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
                    <div class="color-option" data-color="#ffd700" style="background: #ffd700; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
                    <div class="color-option" data-color="#ef4444" style="background: #ef4444; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
                    <div class="color-option" data-color="#8b5cf6" style="background: #8b5cf6; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid transparent;"></div>
                </div>
            </div>
            <div class="form-group">
                <label>星星数量（1-5颗）</label>
                <input type="number" class="form-control" id="letter-stars" min="1" max="5" value="3" required>
            </div>
            <button type="button" class="btn btn-primary submit-btn" style="width: 100%;">✉️ 封存时光信笺</button>
        </form>
    `;
}

// 处理创建事件
function handleCreateEvent() {
    const panel = document.getElementById('panel-content');
    
    // 处理颜色选择
    panel.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            panel.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
    
    if (currentMode === 'letter') {
        handleCreateLetter();
        return;
    }
    
    const name = document.getElementById('event-name').value.trim();
    const date = document.getElementById('event-date').value;
    const desc = document.getElementById('event-desc')?.value.trim() || '';
    const selectedColor = panel.querySelector('.color-option.selected').dataset.color;
    const important = document.getElementById('event-important')?.checked || false;
    
    if (!name || !date) {
        showToast('请填写完整信息', 'error');
        return;
    }
    
    const event = {
        id: Date.now().toString(),
        type: currentMode,
        name: name,
        date: date,
        description: desc,
        color: selectedColor,
        important: important,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // 目标星轨特殊处理
    if (currentMode === 'track') {
        event.progress = parseInt(document.getElementById('event-progress').value) || 0;
        const milestones = document.getElementById('event-milestones')?.value.trim();
        event.milestones = milestones ? milestones.split('\n').map(m => ({
            name: m.trim(),
            completed: false
        })) : [];
    }
    
    appData.events.push(event);
    saveData();
    
    // 创建星球
    createEventPlanet(event, appData.events.length - 1);
    
    // 更新显示
    updateEventsDisplay();
    
    // 关闭面板
    closePanel();
    
    // 检查成就
    checkAchievements();
    
    // 显示通知
    showToast(`✨ ${event.name} 已创建！`, 'success');
    
    // 语音播报
    if (appData.settings.voiceEnabled) {
        speak(`已创建新事件：${event.name}`);
    }
    
    // 触发特效
    triggerFireworks(window.innerWidth / 2, window.innerHeight / 2, selectedColor);
}

// 处理创建时光信笺
function handleCreateLetter() {
    const panel = document.getElementById('panel-content');
    const title = document.getElementById('letter-title').value.trim();
    const date = document.getElementById('letter-date').value;
    const content = document.getElementById('letter-content').value.trim();
    const selectedColor = panel.querySelector('.color-option.selected')?.dataset.color || '#10b981';
    const starCount = parseInt(document.getElementById('letter-stars').value) || 3;
    
    if (!title || !date || !content) {
        showToast('请填写完整信息', 'error');
        return;
    }
    
    // 创建时光信笺事件（直接保存到events数组）
    const event = {
        id: Date.now().toString(),
        type: 'letter',
        name: title,
        date: date,
        description: content,
        color: selectedColor,
        starCount: starCount, // 保存星星数量
        important: false,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    appData.events.push(event);
    saveData();
    
    // 重新渲染3D场景
    renderEventPlanets();
    updateEventsDisplay();
    
    closePanel();
    
    // 检查成就
    checkAchievement('letter_sent');
    
    showToast(`✉️ 时光信笺已封存！`, 'success');
    
    if (appData.settings.voiceEnabled) {
        speak('时光信笺已封存');
    }
    
    // 触发特效
    triggerFireworks(window.innerWidth / 2, window.innerHeight / 2, selectedColor);
}

// 显示事件详情
function showEventDetails(event) {
    const panel = document.getElementById('control-panel');
    const content = document.getElementById('panel-content');
    
    panel.classList.add('open');
    document.querySelector('.panel-title').textContent = '事件详情';
    
    let detailsHTML = `
        <div class="event-details">
            <h3 style="color: ${event.color}; margin-bottom: 20px;">${event.name}</h3>
            <div style="margin-bottom: 15px;">
                <strong>日期：</strong>${formatDate(event.date)}
            </div>
    `;
    
    if (event.description) {
        detailsHTML += `<div style="margin-bottom: 15px;"><strong>描述：</strong>${event.description}</div>`;
    }
    
    if (event.type === 'capsule') {
        const countdown = getCountdown(event.date);
        detailsHTML += `
            <div style="margin-bottom: 15px; padding: 20px; background: rgba(0, 212, 255, 0.1); border-radius: 12px; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: ${event.color};">
                    ${countdown.text}
                </div>
            </div>
        `;
        
        if (countdown.expired) {
            detailsHTML += `
                <button class="btn btn-primary" onclick="celebrateEvent('${event.id}')" style="width: 100%; margin-top: 15px;">
                    🎉 触发庆祝特效
                </button>
            `;
        }
    }
    
    if (event.type === 'track') {
        detailsHTML += `
            <div style="margin-bottom: 15px;">
                <strong>进度：</strong>${event.progress}%
                <div class="event-progress" style="margin-top: 10px;">
                    <div class="event-progress-bar" style="width: ${event.progress}%;"></div>
                </div>
            </div>
        `;
        
        if (event.milestones && event.milestones.length > 0) {
            detailsHTML += `<div style="margin-bottom: 15px;"><strong>里程碑：</strong><ul style="margin-top: 10px;">`;
            event.milestones.forEach((m, i) => {
                detailsHTML += `
                    <li style="margin-bottom: 8px;">
                        <label>
                            <input type="checkbox" ${m.completed ? 'checked' : ''} 
                                   onchange="toggleMilestone('${event.id}', ${i})">
                            ${m.name}
                        </label>
                    </li>
                `;
            });
            detailsHTML += `</ul></div>`;
        }
        
        detailsHTML += `
            <div class="form-group">
                <label>更新进度</label>
                <input type="number" class="form-control" id="update-progress" 
                       min="0" max="100" value="${event.progress}">
            </div>
            <button class="btn btn-primary" onclick="updateEventProgress('${event.id}')" 
                    style="width: 100%; margin-top: 15px;">
                更新进度
            </button>
        `;
    }
    
    detailsHTML += `
        <button class="btn btn-secondary" onclick="deleteEvent('${event.id}')" 
                style="width: 100%; margin-top: 15px; background: rgba(239, 68, 68, 0.2); border-color: #ef4444;">
            🗑️ 删除事件
        </button>
    </div>
    `;
    
    content.innerHTML = detailsHTML;
}

// 更新事件列表显示
function updateEventsDisplay() {
    const eventsList = document.getElementById('events-list');
    
    let filteredEvents = appData.events;
    
    // 根据当前模式过滤
    if (currentMode && currentMode !== 'all') {
        filteredEvents = appData.events.filter(e => e.type === currentMode);
    }
    
    console.log('📋 更新事件列表，当前模式:', currentMode, '过滤后事件数:', filteredEvents.length);
    
    if (filteredEvents.length === 0) {
        eventsList.innerHTML = '<p style="text-align: center; color: #d4d4d8; padding: 20px;">暂无事件</p>';
        return;
    }
    
    eventsList.innerHTML = '';
    
    filteredEvents.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.onclick = () => showEventDetails(event);
        
        let cardContent = `
            <div class="event-card-header">
                <div class="event-title">${event.name}</div>
                <div class="event-icon">${getEventIcon(event.type)}</div>
            </div>
            <div class="event-date">${formatDate(event.date)}</div>
        `;
        
        if (event.type === 'capsule') {
            const countdown = getCountdown(event.date);
            cardContent += `<div class="event-countdown">${countdown.text}</div>`;
        }
        
        if (event.type === 'track') {
            cardContent += `
                <div class="event-progress">
                    <div class="event-progress-bar" style="width: ${event.progress}%;"></div>
                </div>
            `;
        }
        
        if (event.type === 'letter') {
            cardContent += `<div class="event-countdown" style="color: #10b981;">📜 时光信笺</div>`;
        }
        
        card.innerHTML = cardContent;
        eventsList.appendChild(card);
    });
}

// 过滤事件
function filterEventsByMode() {
    updateEventsDisplay();
    renderEventPlanets();
    
    // 聚焦当前模式的事件组
    focusMode(currentMode);
}

// 聚焦到某个模式的事件组
function focusMode(mode) {
    // 清除之前的聚焦
    focusedEventGroup = null;
    
    if (mode === 'all' || !mode) {
        // 显示所有，不聚焦，恢复原始位置
        rotationCenter.set(0, 0, 0);
        camera.position.set(0, 50, 150);
        camera.lookAt(0, 0, 0);
        
        // 重置控制器的目标
        controls.reset();
        return;
    }
    
    // 找到该模式的所有星球
    const modePlanets = planets.filter(p => p.event.type === mode);
    
    if (modePlanets.length === 0) {
        rotationCenter.set(0, 0, 0);
        return;
    }
    
    // 计算中心点（使用现有位置）
    let centerX = 0, centerY = 0, centerZ = 0;
    
    modePlanets.forEach(planet => {
        centerX += planet.mesh.position.x;
        centerY += planet.mesh.position.y;
        centerZ += planet.mesh.position.z;
    });
    
    rotationCenter.set(
        centerX / modePlanets.length,
        centerY / modePlanets.length,
        centerZ / modePlanets.length
    );
    
    // 设置聚焦对象为第一个
    if (modePlanets.length > 0) {
        focusedEventGroup = modePlanets[0].mesh;
    }
    
    // 设置相机位置，围绕中心点
    const cameraRadius = 120;
    camera.position.set(
        rotationCenter.x + cameraRadius,
        rotationCenter.y + 50,
        rotationCenter.z
    );
    camera.lookAt(rotationCenter);
    
    // 更新控制器目标
    controls.target.copy(rotationCenter);
    
    console.log('🎯 聚焦模式:', mode, '中心:', rotationCenter, '星球数:', modePlanets.length);
}

// ==================== 工具函数 ====================

// 获取事件图标
function getEventIcon(type) {
    switch(type) {
        case 'capsule': return '🕰️';
        case 'track': return '🎯';
        case 'milestone': return '🏆';
        case 'letter': return '✉️';
        default: return '⭐';
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 计算倒计时
function getCountdown(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target - now;
    
    if (diff < 0) {
        return { expired: true, text: '已到期 🎉' };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return { expired: false, text: `还有 ${days} 天 ${hours} 小时` };
    } else if (hours > 0) {
        return { expired: false, text: `还有 ${hours} 小时 ${minutes} 分钟` };
    } else {
        return { expired: false, text: `还有 ${minutes} 分钟` };
    }
}

// ==================== 数据持久化 ====================

function saveData() {
    try {
        localStorage.setItem(APP_DATA_KEY, JSON.stringify(appData));
        console.log('💾 数据已保存');
    } catch (e) {
        console.error('保存失败:', e);
        showToast('数据保存失败', 'error');
    }
}

function loadData() {
    try {
        const savedData = localStorage.getItem(APP_DATA_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            
            // 确保数据结构完整
            appData.events = parsed.events || [];
            appData.checkIns = parsed.checkIns || [];
            appData.settings = { ...appData.settings, ...(parsed.settings || {}) };
            appData.achievements = { ...ACHIEVEMENTS, ...(parsed.achievements || {}) };
            
            console.log('📂 数据已加载，共', appData.events.length, '个事件');
            console.log('📊 事件详情:');
            console.log('  - 时间胶囊:', appData.events.filter(e => e.type === 'capsule').length, '个');
            console.log('  - 目标星轨:', appData.events.filter(e => e.type === 'track').length, '个');
            console.log('  - 里程碑:', appData.events.filter(e => e.type === 'milestone').length, '个');
            console.log('  - 时光信笺:', appData.events.filter(e => e.type === 'letter').length, '封');
        } else {
            console.log('ℹ️ 暂无保存的数据');
        }
    } catch (e) {
        console.error('❌ 加载失败:', e);
        console.error('错误详情:', e.message);
    }
}

// 导出数据
function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `star-track-chronicles-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('数据已导出', 'success');
}

// 导入数据
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                appData = { ...appData, ...imported };
                saveData();
                renderEventPlanets();
                updateEventsDisplay();
                showToast('数据已导入', 'success');
            } catch (error) {
                showToast('导入失败，文件格式错误', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ==================== 成就系统 ====================

function checkAchievements() {
    checkAchievement('first_event');
    checkAchievement('ten_events');
    
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
        checkAchievement('night_owl');
    } else if (hour >= 5 && hour < 9) {
        checkAchievement('early_bird');
    }
}

function checkAchievement(achievementId) {
    const achievement = appData.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;
    
    let unlocked = false;
    
    switch(achievementId) {
        case 'first_event':
            unlocked = appData.events.length >= 1;
            break;
        case 'ten_events':
            unlocked = appData.events.length >= 10;
            break;
        case 'first_complete':
            unlocked = appData.events.some(e => e.completed);
            break;
        case 'streak_7':
            unlocked = appData.checkIns.length >= 7;
            break;
        case 'night_owl':
        case 'early_bird':
            unlocked = true;
            break;
        case 'letter_sent':
            unlocked = appData.letters.length >= 1;
            break;
        case 'constellation':
            unlocked = appData.events.filter(e => e.type === 'milestone').length >= 3;
            break;
    }
    
    if (unlocked) {
        achievement.unlocked = true;
        saveData();
        showAchievementUnlock(achievement);
    }
}

function showAchievementUnlock(achievement) {
    showToast(`🏅 成就解锁：${achievement.name}`, 'success');
    triggerAurora();
    
    if (appData.settings.voiceEnabled) {
        speak(`恭喜！解锁成就：${achievement.name}`);
    }
}

function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    grid.innerHTML = '';
    
    Object.values(appData.achievements).forEach(achievement => {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : ''}`;
        card.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        `;
        grid.appendChild(card);
    });
}

// 渲染守护星座
function renderConstellation() {
    const canvas = document.getElementById('constellation-canvas');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 获取已完成的里程碑
    const milestones = appData.events.filter(e => e.type === 'milestone');
    
    if (milestones.length === 0) {
        ctx.fillStyle = '#d4d4d8';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('完成更多里程碑来生成你的守护星座', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // 生成星座点
    const stars = milestones.map((m, i) => ({
        x: 200 + Math.cos(i * Math.PI * 2 / milestones.length) * 150,
        y: 200 + Math.sin(i * Math.PI * 2 / milestones.length) * 150,
        name: m.name
    }));
    
    // 绘制连线
    ctx.strokeStyle = '#6b2fb5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    stars.forEach((star, i) => {
        if (i === 0) {
            ctx.moveTo(star.x, star.y);
        } else {
            ctx.lineTo(star.x, star.y);
        }
    });
    ctx.closePath();
    ctx.stroke();
    
    // 绘制星星
    stars.forEach(star => {
        // 发光效果
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 20);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(star.x - 20, star.y - 20, 40, 40);
        
        // 星星主体
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(star.x, star.y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // 标签
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(star.name, star.x, star.y + 20);
    });
    
    // 检查成就
    if (milestones.length >= 3) {
        checkAchievement('constellation');
    }
}

// ==================== 语音播报 ====================
function speak(text) {
    if (!appData.settings.voiceEnabled) return;
    if (!window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// ==================== 通知系统 ====================
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showNotification(title, body) {
    if (!appData.settings.notificationsEnabled) return;
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '⭐',
            badge: '⭐'
        });
    }
}

function checkNotifications() {
    // 检查即将到期的事件
    appData.events.forEach(event => {
        const countdown = getCountdown(event.date);
        if (!countdown.expired) {
            const target = new Date(event.date);
            const now = new Date();
            const diff = target - now;
            const hours = diff / (1000 * 60 * 60);
            
            if (hours <= 24 && hours > 23) {
                showNotification('事件提醒', `${event.name} 还有1天就要到了！`);
            }
        }
    });
    
    // 检查可以打开的时光信笺
    appData.events.filter(event => event.type === 'letter').forEach(letter => {
        if (!letter.opened) {
            const openDate = new Date(letter.openDate || letter.date);
            const now = new Date();
            if (now >= openDate) {
                showNotification('时光信笺', `你有一封信可以打开了：${letter.name}`);
            }
        }
    });
    
    // 每小时检查一次
    setTimeout(checkNotifications, 60 * 60 * 1000);
}

// ==================== Toast 提示 ====================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || 'ℹ'}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toast-slide-in 0.3s ease-out reverse';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// ==================== 模态框控制 ====================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// 点击模态框外部关闭
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// 加载设置
function loadSettings() {
    document.getElementById('voice-enabled').checked = appData.settings.voiceEnabled;
    document.getElementById('notifications-enabled').checked = appData.settings.notificationsEnabled;
    document.getElementById('particles-enabled').checked = appData.settings.particlesEnabled;
    document.getElementById('music-volume').value = appData.settings.musicVolume;
    document.getElementById('timezone-select').value = appData.settings.timezone;
}

// ==================== 事件操作函数 ====================

// 庆祝事件
window.celebrateEvent = function(eventId) {
    triggerFireworks(window.innerWidth / 2, window.innerHeight / 2, '#ffd700');
    triggerAurora();
    showToast('🎉 恭喜！事件达成！', 'success');
    
    if (appData.settings.voiceEnabled) {
        speak('恭喜！事件达成！');
    }
    
    // 标记为已完成
    const event = appData.events.find(e => e.id === eventId);
    if (event) {
        event.completed = true;
        saveData();
        checkAchievement('first_complete');
    }
}

// 更新事件进度
window.updateEventProgress = function(eventId) {
    const newProgress = parseInt(document.getElementById('update-progress').value);
    const event = appData.events.find(e => e.id === eventId);
    
    if (event) {
        const oldProgress = event.progress;
        event.progress = newProgress;
        saveData();
        
        // 更新3D场景
        renderEventPlanets();
        updateEventsDisplay();
        
        showToast('进度已更新', 'success');
        
        // 如果达到100%，触发特效
        if (newProgress === 100 && oldProgress < 100) {
            celebrateEvent(eventId);
        } else if (newProgress >= 50 && oldProgress < 50) {
            triggerAurora();
            showToast('已完成一半！继续加油！', 'success');
        }
    }
}

// 切换里程碑状态
window.toggleMilestone = function(eventId, milestoneIndex) {
    const event = appData.events.find(e => e.id === eventId);
    if (event && event.milestones && event.milestones[milestoneIndex]) {
        event.milestones[milestoneIndex].completed = !event.milestones[milestoneIndex].completed;
        saveData();
        
        // 计算总进度
        const completedCount = event.milestones.filter(m => m.completed).length;
        event.progress = Math.round((completedCount / event.milestones.length) * 100);
        
        updateEventsDisplay();
        renderEventPlanets();
        
        showToast('里程碑已更新', 'success');
        
        if (event.progress === 100) {
            celebrateEvent(eventId);
        }
    }
}

// 删除事件
window.deleteEvent = function(eventId) {
    if (!confirm('确定要删除这个事件吗？')) return;
    
    appData.events = appData.events.filter(e => e.id !== eventId);
    saveData();
    
    renderEventPlanets();
    updateEventsDisplay();
    closePanel();
    
    showToast('事件已删除', 'info');
}

// ==================== UI辅助函数 ====================

// 安全调用 loadDemoData
window.safeLoadDemoData = function() {
    console.log('🎮 安全调用 loadDemoData');
    if (typeof window.loadDemoData === 'function') {
        window.loadDemoData();
    } else {
        console.error('❌ loadDemoData 函数不存在');
        alert('错误：演示数据加载功能不可用\n\n可能原因：\n1. demo-data.js 未正确加载\n2. JavaScript 错误\n\n请：\n1. 刷新页面重试\n2. 查看控制台(F12)了解详情\n3. 使用"诊断工具.html"加载数据');
    }
}

// 切换快捷键面板
window.toggleShortcuts = function() {
    const panel = document.querySelector('.shortcuts-panel');
    panel.classList.toggle('hidden');
}

// 关闭欢迎引导
window.closeWelcomeGuide = function() {
    const guide = document.getElementById('welcome-guide');
    guide.classList.remove('active');
    localStorage.setItem('star_track_welcomed', 'true');
    console.log('👋 欢迎引导已关闭');
}

// 从引导页加载演示数据
window.loadDemoDataFromGuide = function() {
    console.log('📋 从欢迎引导加载演示数据');
    closeWelcomeGuide();
    
    // 使用安全的加载函数
    safeLoadDemoData();
}

// 显示欢迎引导（首次使用）
function showWelcomeGuide() {
    const welcomed = localStorage.getItem('star_track_welcomed');
    // 如果没有欢迎过，且没有事件数据，才显示引导
    if (!welcomed && appData.events.length === 0) {
        setTimeout(() => {
            const guide = document.getElementById('welcome-guide');
            if (guide) {
                guide.classList.add('active');
                console.log('👋 显示欢迎引导');
            }
        }, 500);
    } else {
        console.log('👋 欢迎引导已跳过（已欢迎或已有数据）');
    }
}

// ==================== 测试函数 ====================

// 测试数据加载
window.testDataLoad = function() {
    console.log('=== 🔍 数据加载测试 ===');
    
    // 1. 检查 localStorage
    const savedData = localStorage.getItem('star_track_chronicles_data');
    console.log('1️⃣ LocalStorage 数据:', savedData ? '存在' : '不存在');
    
    if (savedData) {
        const parsed = JSON.parse(savedData);
        console.log('2️⃣ 数据解析成功');
        console.log('   - 事件数量:', parsed.events?.length || 0);
        console.log('   - 信笺数量:', parsed.letters?.length || 0);
        console.log('   - 事件列表:', parsed.events);
    }
    
    // 2. 检查当前 appData
    console.log('3️⃣ 当前 appData:');
    console.log('   - 事件数量:', appData.events.length);
    console.log('   - 时间胶囊:', appData.events.filter(e => e.type === 'capsule').length);
    console.log('   - 目标星轨:', appData.events.filter(e => e.type === 'track').length);
    console.log('   - 里程碑:', appData.events.filter(e => e.type === 'milestone').length);
    console.log('   - 事件列表:', appData.events);
    
    // 3. 检查 3D 场景
    console.log('4️⃣ 3D 场景状态:');
    console.log('   - 星球数量:', planets.length);
    console.log('   - 场景对象:', scene ? '已创建' : '未创建');
    
    // 4. 显示提示
    const message = `
数据加载测试结果：
━━━━━━━━━━━━━━━━━━
✅ LocalStorage: ${savedData ? '有数据' : '无数据'}
✅ 事件总数: ${appData.events.length}
✅ 3D星球数: ${planets.length}
━━━━━━━━━━━━━━━━━━
查看控制台（F12）了解详情
    `;
    
    alert(message.trim());
    
    // 5. 如果有数据但没有星球，尝试重新渲染
    if (appData.events.length > 0 && planets.length === 0) {
        console.log('⚠️ 检测到数据异常，尝试重新渲染...');
        renderEventPlanets();
        updateEventsDisplay();
        console.log('✅ 重新渲染完成');
    }
    
    console.log('=== 测试完成 ===');
}

// ==================== 启动应用 ====================
window.addEventListener('DOMContentLoaded', () => {
    init();
    // 延迟显示欢迎引导，等待加载动画完成
    setTimeout(() => {
        showWelcomeGuide();
    }, 3500);
});

// 防止页面刷新丢失数据
window.addEventListener('beforeunload', () => {
    // 如果正在清空数据或加载演示数据，不要保存
    if (window._isClearing) {
        console.log('⏭️ 正在清空数据，跳过自动保存');
        return;
    }
    if (window._isLoadingDemo) {
        console.log('⏭️ 正在加载演示数据，跳过自动保存');
        return;
    }
    saveData();
});

// 定期保存数据
setInterval(() => {
    // 如果正在清空数据或加载演示数据，不要保存
    if (window._isClearing) {
        return;
    }
    if (window._isLoadingDemo) {
        return;
    }
    saveData();
}, 60000); // 每分钟保存一次

console.log('🌟 星轨纪事已加载');

