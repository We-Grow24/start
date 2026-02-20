import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 150, 20);
    const material = new THREE.MeshStandardMaterial({ color: 0x6366f1, metalness: 0.4, roughness: 0.2 });
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    const light1 = new THREE.PointLight(0xffffff, 2);
    light1.position.set(3, 3, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xec4899, 1.2);
    light2.position.set(-3, -2, 3);
    scene.add(light2);

    const animate = () => {
      knot.rotation.x += 0.007;
      knot.rotation.y += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: 240, borderRadius: 12, overflow: "hidden" }} />;
}
