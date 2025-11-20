"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Menu, Instagram, Linkedin, Mail, ArrowRight, 
  PenTool, Layers, Cpu, Zap 
} from 'lucide-react';
import * as THREE from 'three';

/**
 * UTILITIES & HOOKS
 */

// Hook to track mouse position for UI effects
const useMousePosition = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMouse = (e: any) => {
      setMouse({ 
        x: (e.clientX / window.innerWidth) * 2 - 1, 
        y: -(e.clientY / window.innerHeight) * 2 + 1 
      });
    };
    window.addEventListener('mousemove', updateMouse);
    return () => window.removeEventListener('mousemove', updateMouse);
  }, []);
  return mouse;
};

/**
 * 3D BACKGROUND COMPONENTS (Vanilla Three.js)
 * Replaces React-Three-Fiber to avoid reconciler errors in this environment
 */

const BackgroundCanvas = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 3, 10);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Create Particles
    const count = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;     // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 3. Interaction & Animation Variables
    let mouseX = 0;
    let mouseY = 0;
    const clock = new THREE.Clock();
    let animationId: number;

    // 4. Event Handlers
    const handleMouseMove = (event: any) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // 5. Animation Loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Gentle rotation
      points.rotation.y = time * 0.05;
      points.rotation.x = Math.sin(time * 0.1) * 0.1;

      // Mouse interaction (tilt)
      points.rotation.x += (mouseY * 0.5 - points.rotation.x) * 0.05;
      points.rotation.y += (mouseX * 0.5 - points.rotation.y) * 0.05;

      renderer.render(scene, camera);
    };
    
    animate();

    // 6. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-black pointer-events-none">
      <div ref={containerRef} className="absolute inset-0" />
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] z-10 pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
};

/**
 * UI COMPONENTS
 */

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: any) => setPosition({ x: e.clientX, y: e.clientY });
    const onMouseDown = () => setIsHovered(true);
    const onMouseUp = () => setIsHovered(false);
    
    // Add hover listeners to interactive elements
    const addHover = () => setIsHovered(true);
    const removeHover = () => setIsHovered(false);
    
    const interactives = document.querySelectorAll('a, button, input, textarea');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', addHover);
      el.addEventListener('mouseleave', removeHover);
    });

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', addHover);
        el.removeEventListener('mouseleave', removeHover);
      });
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 border border-cyan-400 rounded-full pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center"
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: isHovered ? 2.5 : 1,
        borderColor: isHovered ? '#ff00aa' : '#00f3ff'
      }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      <div className={`w-1 h-1 bg-white rounded-full ${isHovered ? 'opacity-0' : 'opacity-100'}`} />
    </motion.div>
  );
};

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-16 relative">
      <motion.h2 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl font-bold text-white tracking-tighter font-sans"
      >
        {title}
        <span className="text-cyan-400">.</span>
      </motion.h2>
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: 100 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="h-1 bg-gradient-to-r from-cyan-500 to-pink-500 mt-4 mb-2"
      />
      <p className="font-mono text-gray-400 tracking-widest text-sm uppercase">
        // {subtitle}
      </p>
    </div>
  );
};

interface ProjectCardProps {
  title: string;
  category: string;
  img: string;
  index: number;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, category, img, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative h-[400px] w-full overflow-hidden bg-neutral-900 border border-white/10 hover:border-cyan-400/50 transition-colors duration-500"
    >
      {/* Image */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img 
          src={img} 
          alt={title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
      </div>

      {/* Hover Overlay Effect - Glitch Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-0 group-hover:opacity-20 mix-blend-overlay transition-opacity duration-300"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex justify-between items-end border-t border-white/20 pt-4">
          <div>
            <p className="text-cyan-400 font-mono text-xs mb-1 tracking-widest uppercase">
              {category}
            </p>
            <h3 className="text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors">
              {title}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-cyan-500 group-hover:border-cyan-500 group-hover:text-black transition-all duration-300">
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
      
      {/* Decorative Corner Lines */}
      <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

/**
 * MAIN SECTIONS
 */

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference text-white"
    >
      <div className="flex flex-col">
        <span className="font-bold text-xl tracking-tight">DNYANESHWARI</span>
        <span className="text-[10px] font-mono text-cyan-400 tracking-[0.3em]">TARKASE_DESIGN</span>
      </div>
      
      <div className="hidden md:flex gap-8 items-center font-mono text-xs tracking-widest">
        {['WORK', 'ABOUT', 'PROCESS', 'CONTACT'].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-cyan-400 transition-colors cursor-none relative group">
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
          </a>
        ))}
      </div>

      <button className="md:hidden p-2 border border-white/20 rounded-full">
        <Menu size={20} />
      </button>
    </motion.nav>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden" id="home">
      <motion.div 
        style={{ y: y1, opacity }} 
        className="relative z-10 text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="inline-block mb-4 px-4 py-1 border border-cyan-500/30 rounded-full bg-cyan-500/5 backdrop-blur-md"
        >
          <span className="text-cyan-400 font-mono text-xs tracking-[0.2em]">SYSTEM READY // V2.0.24</span>
        </motion.div>

        <h1 className="text-7xl md:text-9xl font-bold text-white mb-6 tracking-tighter leading-[0.9]">
          DIGITAL <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-gray-500 relative">
            ARTISAN
            <motion.span 
              className="absolute top-0 left-0 w-full text-pink-500 opacity-30 blur-sm"
              animate={{ x: [-2, 2, -2] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            >
              ARTISAN
            </motion.span>
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-gray-400 font-mono text-sm md:text-base leading-relaxed">
          Pushing the boundaries of visual storytelling through sketch, 
          design, and creative technology. Dnyaneshwari Tarkase represents 
          the future of aesthetic precision.
        </p>

        <div className="mt-12 flex justify-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(0, 243, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 border border-cyan-400 text-cyan-400 font-mono text-sm tracking-widest uppercase bg-transparent hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all"
          >
            View Projects
          </motion.button>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[10px] font-mono text-gray-500 tracking-widest rotate-90 origin-center mb-8">SCROLL</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-cyan-400 to-transparent" />
      </motion.div>
    </section>
  );
};

const About = () => {
  const stats = [
    { icon: <PenTool size={20} />, label: "Sketching", val: "98%" },
    { icon: <Layers size={20} />, label: "UI/UX Design", val: "92%" },
    { icon: <Cpu size={20} />, label: "Prototyping", val: "88%" },
    { icon: <Zap size={20} />, label: "Concept Art", val: "95%" },
  ];

  return (
    <section id="about" className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left: Visual */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="aspect-[3/4] border border-white/10 bg-white/5 backdrop-blur-sm p-4 relative overflow-hidden rounded-lg"
          >
             {/* Simulated Holographic Profile */}
            <div className="w-full h-full bg-gray-900 relative overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop" 
                alt="Dnyaneshwari Tarkase" 
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
              
              {/* Scanning Line */}
              <motion.div 
                className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(0,243,255,1)] opacity-50"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 border border-pink-500/30 rounded-full animate-spin-slow flex items-center justify-center">
              <div className="w-2 h-2 bg-pink-500 rounded-full" />
            </div>
          </motion.div>
        </div>

        {/* Right: Content */}
        <div>
          <SectionHeader title="About The Creator" subtitle="Dnyaneshwari Tarkase" />
          
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            I am a multidisciplinary designer blending the raw, organic nature of 
            traditional sketching with the cold precision of futuristic technology. 
            My work bridges the gap between <span className="text-cyan-400">analog soul</span> and <span className="text-pink-500">digital aesthetic</span>.
          </p>

          <p className="text-gray-400 text-sm font-mono mb-10 border-l-2 border-cyan-500 pl-4">
            "Design is not just what it looks like and feels like. Design is how it works in the future."
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 p-4 flex items-center gap-4 hover:border-cyan-400/40 transition-colors"
              >
                <div className="text-cyan-400">{stat.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-mono mb-1 text-gray-400">
                    <span>{stat.label}</span>
                    <span>{stat.val}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-800">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: stat.val }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,243,255,0.5)]"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Gallery = () => {
  const projects = [
    { title: "Neon Cityscape", category: "Illustration", img: "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?auto=format&fit=crop&w=800&q=80" },
    { title: "Cyber-Anatomy", category: "Sketch Study", img: "https://images.unsplash.com/photo-1535581652167-3d6b98c5b754?auto=format&fit=crop&w=800&q=80" },
    { title: "Void Architecture", category: "Concept Art", img: "https://images.unsplash.com/photo-1486734883715-662d68d7b254?auto=format&fit=crop&w=800&q=80" },
    { title: "Interface 2099", category: "UI Design", img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80" },
    { title: "Mech Warrior", category: "Character Design", img: "https://images.unsplash.com/photo-1614726365723-49ab3eb566a4?auto=format&fit=crop&w=800&q=80" },
    { title: "Abstract Data", category: "Motion Graphics", img: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80" }
  ];

  return (
    <section id="work" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
      <SectionHeader title="Selected Works" subtitle="The Archive" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, idx) => (
          <ProjectCard key={idx} {...project} index={idx} />
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <motion.a 
          href="#" 
          whileHover={{ letterSpacing: "0.2em" }}
          className="text-white font-mono text-sm border-b border-cyan-500 pb-1 hover:text-cyan-400 transition-all inline-flex items-center gap-2"
        >
          ACCESS FULL ARCHIVE <ArrowRight size={14} />
        </motion.a>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyan-900/5 skew-y-3 transform origin-bottom-right"></div>
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <SectionHeader title="Initiate Protocol" subtitle="Contact Me" />
        
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <form className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-xs font-mono text-cyan-400 mb-2 uppercase tracking-widest">Identity</label>
                <input 
                  type="text" 
                  placeholder="ENTER NAME"
                  className="w-full bg-white/5 border border-white/10 px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/10 transition-all font-mono text-sm"
                />
              </div>
              <div className="group">
                <label className="block text-xs font-mono text-cyan-400 mb-2 uppercase tracking-widest">Frequency</label>
                <input 
                  type="email" 
                  placeholder="ENTER EMAIL"
                  className="w-full bg-white/5 border border-white/10 px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/10 transition-all font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-xs font-mono text-cyan-400 mb-2 uppercase tracking-widest">Transmission</label>
              <textarea 
                rows={4}
                placeholder="ENTER MESSAGE DATA..."
                className="w-full bg-white/5 border border-white/10 px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/10 transition-all font-mono text-sm"
              ></textarea>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#00f3ff", color: "#000" }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-white/10 text-white font-bold tracking-widest uppercase border border-white/20 hover:border-cyan-400 transition-all duration-300 mt-4"
            >
              Send Transmission
            </motion.button>
          </form>
          
          <div className="mt-12 flex justify-center gap-8">
            {[
                { Icon: Instagram, href: "#" }, 
                { Icon: Linkedin, href: "#" }, 
                { Icon: Mail, href: "#" }
            ].map(({ Icon, href }, idx) => (
              <motion.a
                key={idx}
                href={href}
                whileHover={{ y: -5, color: '#00f3ff' }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icon size={24} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-8 border-t border-white/10 bg-black text-center">
      <p className="font-mono text-xs text-gray-600 tracking-widest uppercase">
        © 2025 Dnyaneshwari Tarkase. All Systems Nominal.
      </p>
    </footer>
  );
};

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2, ease: "circOut" }}
      onAnimationComplete={() => document.body.style.overflow = 'auto'}
      className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center pointer-events-none"
    >
      <div className="relative">
        <motion.div 
          className="w-24 h-24 border-t-2 border-cyan-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-2 border-r-2 border-pink-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.h2 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="mt-8 font-mono text-cyan-400 tracking-[0.5em] text-sm"
      >
        INITIALIZING...
      </motion.h2>
    </motion.div>
  );
};

/**
 * APP COMPONENT
 */

const Home = () => {
  return (
    <div className="bg-black min-h-screen text-white selection:bg-cyan-500 selection:text-black font-sans overflow-x-hidden">
      <LoadingScreen />
      <BackgroundCanvas />
      <CustomCursor />
      <Navbar />
      
      <main className="relative z-10">
        <Hero />
        <About />
        <Gallery />
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;