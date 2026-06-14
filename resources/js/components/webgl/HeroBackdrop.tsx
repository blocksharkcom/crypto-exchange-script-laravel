import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
    enabled?: boolean;
}

/**
 * GPU-accelerated particle grid hero background.
 * - 6,400 points laid out on a plane, displaced by a soft sine field + mouse parallax.
 * - Brand-tinted dot shader; subtle bloom via radial gradient texture.
 * - Pauses when the tab is hidden or the user has reduced-motion enabled.
 */
export function HeroBackdrop({ enabled = true }: Props) {
    const mountRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        if (!enabled || !mountRef.current) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mount = mountRef.current;
        const width = mount.clientWidth || window.innerWidth;
        const height = mount.clientHeight || 720;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        renderer.setSize(width, height, false);
        renderer.setClearColor(0x000000, 0);
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(0, 0, 22);

        // Build the grid geometry
        const cols = 80;
        const rows = 80;
        const spacing = 0.6;
        const count = cols * rows;
        const positions = new Float32Array(count * 3);
        const aOffsets  = new Float32Array(count);

        let i = 0;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                positions[i * 3 + 0] = (x - cols / 2) * spacing;
                positions[i * 3 + 1] = (y - rows / 2) * spacing;
                positions[i * 3 + 2] = 0;
                aOffsets[i] = Math.random() * Math.PI * 2;
                i++;
            }
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('aOffset',  new THREE.BufferAttribute(aOffsets, 1));

        // Soft circular point texture (no asset file required)
        const texCanvas = document.createElement('canvas');
        texCanvas.width = 64; texCanvas.height = 64;
        const ctx = texCanvas.getContext('2d');
        if (ctx) {
            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0,    'rgba(255,255,255,1)');
            gradient.addColorStop(0.45, 'rgba(255,255,255,0.45)');
            gradient.addColorStop(1,    'rgba(255,255,255,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
        }
        const pointTexture = new THREE.CanvasTexture(texCanvas);
        pointTexture.minFilter = THREE.LinearFilter;
        pointTexture.magFilter = THREE.LinearFilter;

        const uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uColorA: { value: new THREE.Color('#b8f24a') },  // brand lime
            uColorB: { value: new THREE.Color('#5ec8ff') },  // soft blue
            uColorC: { value: new THREE.Color('#1a1d22') },  // base ink
            uTex: { value: pointTexture },
            uOpacity: { value: 0.95 },
        };

        const material = new THREE.ShaderMaterial({
            uniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexShader: `
                uniform float uTime;
                uniform vec2  uMouse;
                attribute float aOffset;
                varying float vGlow;
                void main() {
                    vec3 pos = position;
                    float t = uTime * 0.6;
                    float wave =
                        sin(pos.x * 0.18 + t + aOffset) * 0.55 +
                        cos(pos.y * 0.22 + t * 0.85) * 0.45;
                    pos.z += wave;

                    // Mouse parallax (subtle radial pull)
                    float d = distance(pos.xy, uMouse * 12.0);
                    pos.z += smoothstep(8.0, 0.0, d) * 1.2;

                    vGlow = clamp((wave + 1.0) * 0.5, 0.0, 1.0);
                    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = (4.5 + vGlow * 4.0) * (160.0 / -mv.z);
                    gl_Position = projectionMatrix * mv;
                }
            `,
            fragmentShader: `
                uniform sampler2D uTex;
                uniform vec3 uColorA;
                uniform vec3 uColorB;
                uniform vec3 uColorC;
                uniform float uOpacity;
                varying float vGlow;
                void main() {
                    vec4 sample = texture2D(uTex, gl_PointCoord);
                    if (sample.a < 0.02) discard;
                    vec3 mix1 = mix(uColorC, uColorB, vGlow);
                    vec3 col  = mix(mix1, uColorA, smoothstep(0.55, 1.0, vGlow));
                    gl_FragColor = vec4(col, sample.a * uOpacity);
                }
            `,
        });

        const points = new THREE.Points(geom, material);
        points.rotation.x = -0.65;
        scene.add(points);

        const onMove = (e: PointerEvent) => {
            const rect = mount.getBoundingClientRect();
            uniforms.uMouse.value.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            uniforms.uMouse.value.y = -((e.clientY - rect.top)  / rect.height - 0.5) * 2;
        };
        mount.addEventListener('pointermove', onMove);

        const onResize = () => {
            const w = mount.clientWidth || window.innerWidth;
            const h = mount.clientHeight || 720;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onResize);

        const clock = new THREE.Clock();
        let paused = false;
        const onVis = () => { paused = document.hidden; };
        document.addEventListener('visibilitychange', onVis);

        const tick = () => {
            if (!paused) {
                uniforms.uTime.value = clock.getElapsedTime();
                if (!reducedMotion) {
                    points.rotation.z = Math.sin(uniforms.uTime.value * 0.04) * 0.08;
                }
                renderer.render(scene, camera);
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        tick();

        return () => {
            cancelAnimationFrame(rafRef.current);
            mount.removeEventListener('pointermove', onMove);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVis);
            geom.dispose();
            material.dispose();
            pointTexture.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === mount) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div
            ref={mountRef}
            aria-hidden="true"
            className="absolute inset-0 -z-0 pointer-events-none"
            style={{ maskImage: 'radial-gradient(ellipse 90% 70% at 50% 35%, black 50%, transparent 90%)' }}
        />
    );
}
