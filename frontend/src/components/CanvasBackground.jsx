import React, { useEffect, useRef } from 'react';

export default function CanvasBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.baseY = Math.random() * height;
        this.y = this.baseY;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.2 + 0.08;
        this.amplitude = Math.random() * 20 + 8; // Wave oscillation
        this.frequency = Math.random() * 0.003 + 0.001; // Wave length
        this.phase = Math.random() * Math.PI * 2;
        this.alpha = Math.random() * 0.4 + 0.15;
        this.color = Math.random() > 0.4 ? '#818cf8' : '#22d3ee'; // Indigo or Cyan stars
      }

      update(time) {
        this.x -= this.speed;
        if (this.x < 0) {
          this.x = width;
          this.baseY = Math.random() * height;
        }
        this.y = this.baseY + Math.sin(this.x * this.frequency + this.phase + time * 0.0006) * this.amplitude;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    let particles = Array.from({ length: 50 }, () => new Particle());

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = Array.from({ length: 50 }, () => new Particle());
    };

    window.addEventListener('resize', handleResize);

    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);

      // Deep rich indigo/blue-black gradient backdrop
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#070a13');
      gradient.addColorStop(0.5, '#0b0f1e');
      gradient.addColorStop(1, '#070a13');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Ambient glowing orbs (Subtle Purple and Cyan)
      const orb1X = width * 0.25 + Math.sin(time * 0.00015) * (width * 0.1);
      const orb1Y = height * 0.3 + Math.cos(time * 0.0001) * (height * 0.1);
      const orb1 = ctx.createRadialGradient(orb1X, orb1Y, 50, orb1X, orb1Y, width * 0.3);
      orb1.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      orb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orb1;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width * 0.75 + Math.cos(time * 0.00012) * (width * 0.1);
      const orb2Y = height * 0.6 + Math.sin(time * 0.00014) * (height * 0.1);
      const orb2 = ctx.createRadialGradient(orb2X, orb2Y, 50, orb2X, orb2Y, width * 0.3);
      orb2.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      orb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orb2;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle dot grid pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
      const spacing = 24;
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw flowing stars
      particles.forEach((p) => {
        p.update(time);
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-20 pointer-events-none bg-[#070a13]"
      style={{ display: 'block' }}
    />
  );
}
