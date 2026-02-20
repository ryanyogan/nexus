import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  pulseSpeed: number;
  connections: number[];
}

interface Spark {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
  speed: number;
  sourceNode: number;
  targetNode: number;
  trail: { x: number; y: number; alpha: number }[];
}

export function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      initNodes(rect.width, rect.height);
    };

    const initNodes = (width: number, height: number) => {
      const nodeCount = Math.floor((width * height) / 25000); // Density based on area
      const nodes: Node[] = [];

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02,
          connections: [],
        });
      }

      // Pre-compute connections for each node (nearest neighbors)
      nodes.forEach((node, i) => {
        const distances: { index: number; dist: number }[] = [];
        nodes.forEach((other, j) => {
          if (i !== j) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            distances.push({ index: j, dist: Math.sqrt(dx * dx + dy * dy) });
          }
        });
        distances.sort((a, b) => a.dist - b.dist);
        node.connections = distances.slice(0, 3).map((d) => d.index);
      });

      nodesRef.current = nodes;
    };

    const createSpark = () => {
      const nodes = nodesRef.current;
      if (nodes.length < 2) return;

      const sourceIdx = Math.floor(Math.random() * nodes.length);
      const source = nodes[sourceIdx];
      const targetIdx =
        source.connections[Math.floor(Math.random() * source.connections.length)];

      if (targetIdx === undefined) return;

      const target = nodes[targetIdx];

      sparksRef.current.push({
        x: source.x,
        y: source.y,
        targetX: target.x,
        targetY: target.y,
        progress: 0,
        speed: 0.02 + Math.random() * 0.03,
        sourceNode: sourceIdx,
        targetNode: targetIdx,
        trail: [],
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      timeRef.current += 0.016;

      const nodes = nodesRef.current;
      const sparks = sparksRef.current;
      const mouse = mouseRef.current;

      // Update and draw nodes
      nodes.forEach((node) => {
        // Gentle floating motion
        node.x += node.vx;
        node.y += node.vy;

        // Mouse repulsion
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150;
          node.vx += (dx / dist) * force * 0.05;
          node.vy += (dy / dist) * force * 0.05;
        }

        // Boundary wrapping
        if (node.x < 0) node.x = rect.width;
        if (node.x > rect.width) node.x = 0;
        if (node.y < 0) node.y = rect.height;
        if (node.y > rect.height) node.y = 0;

        // Damping
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Pulse animation
        node.pulsePhase += node.pulseSpeed;
        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;

        // Draw node glow
        const gradient = ctx.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          node.radius * 4
        );
        gradient.addColorStop(0, `rgba(139, 92, 246, ${0.6 + pulse * 0.4})`);
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.2 + pulse * 0.2})`);
        gradient.addColorStop(1, "rgba(139, 92, 246, 0)");

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw node core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + pulse * 0.2})`;
        ctx.fill();
      });

      // Draw connections
      nodes.forEach((node) => {
        node.connections.forEach((targetIdx) => {
          const target = nodes[targetIdx];
          const dx = target.x - node.x;
          const dy = target.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.15;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Update and draw sparks
      sparks.forEach((spark) => {
        spark.progress += spark.speed;

        // Update target position (nodes may have moved)
        const target = nodes[spark.targetNode];
        if (target) {
          spark.targetX = target.x;
          spark.targetY = target.y;
        }

        // Calculate current position with easing
        const t = spark.progress;
        const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        spark.x = spark.x + (spark.targetX - spark.x) * easeT * 0.1;
        spark.y = spark.y + (spark.targetY - spark.y) * easeT * 0.1;

        // Add to trail
        spark.trail.unshift({ x: spark.x, y: spark.y, alpha: 1 });
        if (spark.trail.length > 20) spark.trail.pop();

        // Fade trail
        spark.trail.forEach((point) => {
          point.alpha *= 0.9;
        });

        // Draw trail
        spark.trail.forEach((point, j) => {
          if (point.alpha > 0.05) {
            const size = (1 - j / spark.trail.length) * 3;
            const gradient = ctx.createRadialGradient(
              point.x,
              point.y,
              0,
              point.x,
              point.y,
              size * 2
            );
            gradient.addColorStop(
              0,
              `rgba(6, 182, 212, ${point.alpha * 0.8})`
            );
            gradient.addColorStop(
              0.5,
              `rgba(139, 92, 246, ${point.alpha * 0.4})`
            );
            gradient.addColorStop(1, "rgba(139, 92, 246, 0)");

            ctx.beginPath();
            ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
          }
        });

        // Draw spark head
        const headGradient = ctx.createRadialGradient(
          spark.x,
          spark.y,
          0,
          spark.x,
          spark.y,
          6
        );
        headGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        headGradient.addColorStop(0.3, "rgba(6, 182, 212, 0.8)");
        headGradient.addColorStop(1, "rgba(6, 182, 212, 0)");

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = headGradient;
        ctx.fill();
      });

      // Remove completed sparks
      sparksRef.current = sparks.filter((s) => s.progress < 1);

      // Randomly create new sparks
      if (Math.random() < 0.05) {
        createSpark();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-auto absolute inset-0 h-full w-full"
      style={{ opacity: 0.7 }}
    />
  );
}
