import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface HolographicTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
  delay?: number;
}

export function HolographicText({
  children,
  className = "",
  as: Tag = "span",
  delay = 0,
}: HolographicTextProps) {
  const textRef = useRef<HTMLElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current || !scanlineRef.current) return;

    const tl = gsap.timeline({ delay });

    // Initial reveal animation
    tl.fromTo(
      textRef.current,
      {
        opacity: 0,
        y: 20,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
      }
    );

    // Scanline animation (repeating)
    gsap.fromTo(
      scanlineRef.current,
      { top: "-10%" },
      {
        top: "110%",
        duration: 3,
        repeat: -1,
        ease: "none",
        delay: delay + 1,
      }
    );

    // Subtle glitch effect on loop
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        gsap.to(textRef.current, {
          skewX: Math.random() * 2 - 1,
          duration: 0.05,
          onComplete: () => {
            gsap.to(textRef.current, {
              skewX: 0,
              duration: 0.05,
            });
          },
        });
      }
    }, 100);

    return () => {
      clearInterval(glitchInterval);
      tl.kill();
    };
  }, [delay]);

  return (
    <Tag
      ref={textRef as any}
      className={`relative inline-block ${className}`}
      style={{
        textShadow: `
          0 0 10px rgba(139, 92, 246, 0.5),
          0 0 20px rgba(139, 92, 246, 0.3),
          0 0 40px rgba(139, 92, 246, 0.2),
          0 0 80px rgba(6, 182, 212, 0.1)
        `,
      }}
    >
      {children}
      <div
        ref={scanlineRef}
        className="pointer-events-none absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
        style={{ mixBlendMode: "screen" }}
      />
    </Tag>
  );
}
