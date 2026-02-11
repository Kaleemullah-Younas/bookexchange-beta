"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";
import {
  Library,
  Map as MapIcon,
  MessageSquare,
  Wallet,
  ArrowRight,
  Leaf,
  ShieldCheck,
  Search,
  BookOpen,
  Users,
  Star,
  Sparkles,
  Zap,
  Globe,
  BookMarked,
  Menu,
  X,
  ChevronRight,
  Heart,
  RefreshCw,
  Award,
  MapPin,
} from "lucide-react";


// --- HERO SECTION ---
const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-32 pb-20"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Gradient Orbs */}
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-accent-secondary/15 rounded-full blur-[100px]" />
      </div>

      <motion.div style={{ y, opacity }} className="container mx-auto px-4 z-10 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Text Content */}
          <div className="max-w-2xl">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-8 leading-[1.05]">
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  WHERE STORIES
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-accent"
                >
                  FIND NEW HOMES
                </motion.span>
              </span>
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl"
            >
              Join thousands of readers exchanging books in their community.
              List your finished reads, discover new favorites, and give every
              book a second life—<span className="text-foreground font-medium">no money needed</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link
                href="/books"
                className="group flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full font-bold text-lg hover:scale-[1.02] transition-transform"
              >
                Start Exploring
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 px-8 py-4 border border-border hover:bg-secondary/50 rounded-full font-semibold text-lg transition-colors"
              >
                List Your Books
              </Link>
            </motion.div>
          </div>

          {/* Right - Visual Card */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
            style={{ perspective: "1000px" }}
          >
            <div className="relative">
              {/* Animated Glow Behind Card */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-accent/20 via-accent-secondary/10 to-transparent rounded-3xl blur-2xl"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main Card */}
              <motion.div
                className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl shadow-black/10 overflow-hidden"
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {/* Animated Border Gradient */}
                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, transparent, var(--accent), transparent)",
                    backgroundSize: "200% 200%",
                    opacity: 0.1,
                  }}
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />

                {/* Header */}
                <motion.div
                  className="flex items-center justify-between mb-6"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(224, 122, 95, 0)",
                          "0 0 0 8px rgba(224, 122, 95, 0.1)",
                          "0 0 0 0 rgba(224, 122, 95, 0)",
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <BookOpen className="w-5 h-5 text-accent" />
                      </motion.div>
                    </motion.div>
                    <div>
                      <p className="font-semibold text-foreground">Your Library</p>
                      <motion.p
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        3 books available
                      </motion.p>
                    </div>
                  </div>
                  <motion.div
                    className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-medium"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Active
                  </motion.div>
                </motion.div>

                {/* Book Stack Preview - Animated */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { image: "/images/books/midnight-library.png", title: "The Midnight Library" },
                    { image: "/images/books/atomic-habits.png", title: "Atomic Habits" },
                    { image: "/images/books/project-hail-mary.png", title: "Project Hail Mary" },
                  ].map((book, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 40, rotateX: -20 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{
                        delay: 0.6 + i * 0.15,
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      whileHover={{
                        y: -10,
                        scale: 1.05,
                        rotateY: 5,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                      }}
                      className="aspect-[2/3] rounded-xl shadow-lg cursor-pointer relative overflow-hidden"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Book Cover Image */}
                      <img
                        src={book.image}
                        alt={book.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Shine Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                        initial={{ x: "-100%", y: "-100%" }}
                        whileHover={{ x: "100%", y: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Stats Row - Animated */}
                <motion.div
                  className="grid grid-cols-3 gap-4 pt-6 border-t border-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  {[
                    { label: "Points", value: 240, icon: Zap, color: "text-accent" },
                    { label: "Exchanged", value: 12, icon: RefreshCw, color: "text-success" },
                    { label: "Wishlist", value: 8, icon: Heart, color: "text-rose-500" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1 + i * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <motion.div
                          animate={{ rotate: stat.label === "Exchanged" ? [0, 360] : 0 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </motion.div>
                        <motion.span
                          className="font-bold text-lg text-foreground"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.2 + i * 0.1 }}
                        >
                          {stat.value}
                        </motion.span>
                      </div>
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Floating Elements - Enhanced */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: [-5, 5, -5] }}
                transition={{
                  opacity: { delay: 1.2 },
                  scale: { delay: 1.2 },
                  x: { delay: 1.2 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.1 }}
                className="absolute -top-6 -right-6 p-4 bg-card border border-border rounded-2xl shadow-xl cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-8 h-8 rounded-full bg-accent flex items-center justify-center"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="w-4 h-4 text-accent-foreground" />
                  </motion.div>
                  <div>
                    <p className="text-xs font-medium text-foreground">New Match!</p>
                    <motion.p
                      className="text-[10px] text-muted-foreground"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      2 min ago
                    </motion.p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0, y: [5, -5, 5] }}
                transition={{
                  opacity: { delay: 1.4 },
                  scale: { delay: 1.4 },
                  x: { delay: 1.4 },
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{ scale: 1.1 }}
                className="absolute -bottom-4 -left-8 p-3 bg-card border border-border rounded-2xl shadow-xl cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <MapPin className="w-4 h-4 text-success" />
                  </motion.div>
                  <span className="text-xs font-medium text-foreground">5 readers nearby</span>
                </div>
              </motion.div>

              {/* Additional floating book decoration */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6, rotate: [12, 8, 12], y: [-3, 3, -3] }}
                transition={{
                  opacity: { delay: 1.6 },
                  rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute top-1/4 -left-12 w-8 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

// --- ANIMATED BENTO CARD ---
const BentoCard = ({
  children,
  className = "",
  delay = 0,
  index = 0,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  index?: number;
  variant?: "default" | "dark";
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth spring animations for tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.7,
        delay: delay + index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={`group relative overflow-hidden rounded-[2rem] ${className}`}
    >
      {/* Animated Gradient Border */}
      <motion.div
        className="absolute inset-0 rounded-[2rem] p-[1px] pointer-events-none"
        style={{
          background: isHovered
            ? "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary), var(--accent))"
            : "linear-gradient(135deg, var(--border), var(--border))",
          backgroundSize: "300% 300%",
        }}
        animate={{
          backgroundPosition: isHovered ? ["0% 0%", "100% 100%", "0% 0%"] : "0% 0%",
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Card Content Background */}
      <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-card" />

      {/* Spotlight Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem]"
        animate={{
          opacity: isHovered ? 0.15 : 0,
        }}
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${useTransform(mouseX, (x) => (x + 0.5) * 100)}% ${useTransform(mouseY, (y) => (y + 0.5) * 100)}%,
              var(--color-accent),
              transparent 40%
            )
          `,
        }}
      />

      {/* Floating Particles */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-accent rounded-full"
              initial={{
                x: Math.random() * 100 + "%",
                y: "100%",
                opacity: 0,
              }}
              animate={{
                y: "-20%",
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col z-10" style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

// --- ANIMATED ICON ---
const AnimatedIcon = ({ icon: Icon, className = "" }: { icon: React.ElementType; className?: string }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Icon className="w-7 h-7 relative z-10" />
      <motion.div
        className="absolute inset-0 bg-current rounded-xl blur-lg opacity-30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
};

// --- FEATURES BENTO GRID ---
const FeaturesGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section ref={containerRef} className="py-32 px-4 bg-background relative z-10 overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y: backgroundY }}>
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent-secondary/5 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto max-w-7xl relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 max-w-3xl"
        >

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="block"
            >
              Everything you need to
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-accent-secondary"
            >
              share your stories
            </motion.span>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-xl text-muted-foreground max-w-2xl"
          >
            A complete platform designed for book lovers who believe stories deserve to be shared, not shelved.
          </motion.p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1000px" }}>

          {/* 1. Global Library - Large Featured Card */}
          <BentoCard className="lg:col-span-2 lg:row-span-2 min-h-[400px] lg:min-h-[500px]" index={0}>
            <div className="p-8 md:p-10 h-full flex flex-col">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-accent to-accent-light text-accent-foreground rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-accent/25"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Library className="w-8 h-8" />
              </motion.div>

              <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Global Library</h3>

              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
                Access thousands of titles from readers around the world. Our smart search helps you find exactly what you're looking for.
              </p>

              <motion.div
                className="mt-auto"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link href="/books" className="inline-flex items-center gap-3 text-lg font-bold text-accent group/link">
                  Browse Library
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.span>
                </Link>
              </motion.div>

              {/* Animated Book Grid */}
              <div className="absolute right-0 bottom-0 w-2/3 h-2/3 pointer-events-none">
                <div className="relative w-full h-full">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-xl bg-gradient-to-br shadow-lg"
                      style={{
                        width: "60px",
                        height: "90px",
                        right: `${(i % 3) * 70 + 20}px`,
                        bottom: `${Math.floor(i / 3) * 100 + 20}px`,
                        background: [
                          "linear-gradient(135deg, #e07a5f, #f0a090)",
                          "linear-gradient(135deg, #81b29a, #a8d5ba)",
                          "linear-gradient(135deg, #3d405b, #5c5f7e)",
                          "linear-gradient(135deg, #f2cc8f, #f5deb3)",
                          "linear-gradient(135deg, #e88d74, #f5a896)",
                          "linear-gradient(135deg, #8fc1a6, #b8d4c8)",
                        ][i],
                      }}
                      initial={{ opacity: 0, y: 30, rotate: -5 }}
                      whileInView={{ opacity: 0.9, y: 0, rotate: Math.random() * 10 - 5 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                      animate={{
                        y: [0, -5, 0],
                        rotate: [Math.random() * 6 - 3, Math.random() * 6 - 3],
                      }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          {/* 2. Local Exchange */}
          <BentoCard className="min-h-[280px]" index={1}>
            <div className="p-8 h-full flex flex-col">
              <motion.div
                className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <MapIcon className="w-6 h-6 text-foreground" />
              </motion.div>

              <h3 className="text-2xl font-bold mb-2">Local Exchange</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Find verified exchange points near you. Meet fellow readers safely.
              </p>

              {/* Animated Map Preview */}
              <div className="mt-auto bg-secondary rounded-xl p-3 border border-border relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-xs font-medium">Live Map</span>
                </div>
                <div className="h-16 rounded-lg bg-muted relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] [background-size:8px_8px] opacity-20" />
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-accent rounded-full"
                      style={{ left: `${20 + i * 30}%`, top: `${30 + i * 15}%` }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          {/* 3. Community Forums */}
          <BentoCard className="min-h-[280px]" index={2}>
            <div className="p-8 h-full flex flex-col">
              <motion.div
                className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4"
                whileHover={{ scale: 1.1 }}
              >
                <AnimatedIcon icon={MessageSquare} className="text-accent" />
              </motion.div>

              <h3 className="text-2xl font-bold mb-2">Community Forums</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Join discussions, share recommendations, and connect with readers.
              </p>

              {/* Animated Chat Bubbles */}
              <div className="mt-auto flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className={`h-2 rounded-full bg-secondary ${i === 0 ? 'w-3/4' : i === 1 ? 'w-1/2' : 'w-2/3'}`}
                    initial={{ scaleX: 0, originX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
                  />
                ))}
              </div>
            </div>
          </BentoCard>

          {/* 4. Points System */}
          <BentoCard className="min-h-[280px]" index={3}>
            <div className="p-8 h-full flex flex-col">
              <motion.div
                className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Wallet className="w-6 h-6 text-success" />
              </motion.div>

              <h3 className="text-2xl font-bold mb-2">Fair Points System</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                No money changes hands. Earn points by sharing, spend them to receive.
              </p>

              {/* Animated Points Counter */}
              <div className="mt-auto flex items-center gap-3">
                <motion.div
                  className="text-3xl font-black text-success"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  240
                </motion.div>
                <div className="text-xs text-muted-foreground">
                  <div>points</div>
                  <motion.div
                    className="text-success flex items-center gap-1"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <Zap className="w-3 h-3" /> +50 this week
                  </motion.div>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* 5. Sustainability */}
          <BentoCard className="min-h-[280px] lg:col-span-2" index={4}>
            <div className="p-8 h-full flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-success/20 to-success/5 rounded-xl flex items-center justify-center mb-4"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(129, 178, 154, 0)",
                      "0 0 0 10px rgba(129, 178, 154, 0.1)",
                      "0 0 0 0 rgba(129, 178, 154, 0)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Leaf className="w-6 h-6 text-success" />
                </motion.div>

                <h3 className="text-2xl font-bold mb-2">100% Sustainable</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every book exchanged is a book saved from the landfill. Join the movement for sustainable reading.
                </p>
              </div>

              {/* Animated Stats */}
              <div className="flex gap-6 md:gap-8">
                {[
                  { value: "50K+", label: "Books Saved" },
                  { value: "12T", label: "CO₂ Reduced" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
                  >
                    <div className="text-2xl md:text-3xl font-black text-success">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
};


// --- HOW IT WORKS ---
const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "List Your Books",
      description: "Add books you've finished reading. Take a photo, add details, and set your asking points.",
      icon: BookOpen,
      color: "from-rose-500 to-orange-400",
    },
    {
      number: "02",
      title: "Find & Request",
      description: "Browse the library, find books you want, and send exchange requests to their owners.",
      icon: Search,
      color: "from-emerald-500 to-teal-400",
    },
    {
      number: "03",
      title: "Exchange & Earn",
      description: "Meet at a verified exchange point, swap books, and earn points for your next find.",
      icon: RefreshCw,
      color: "from-violet-500 to-purple-400",
    },
  ];

  return (
    <section id="how-it-works" className="py-32 px-4 bg-secondary/30 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/3 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent-secondary/5 rounded-full blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="block"
            >
              How BookExchange
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-accent"
            >
              Works
            </motion.span>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Start sharing stories in three simple steps
          </motion.p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Animated Connector Line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-accent/30 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 1 }}
            />
            {/* Flowing dots animation */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: 0.3 + i * 0.2,
                duration: 0.7,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="relative group"
              style={{ perspective: "1000px" }}
            >
              {/* Card */}
              <motion.div
                className="relative bg-card border border-border rounded-3xl p-8 h-full overflow-hidden cursor-pointer"
                whileHover={{
                  y: -10,
                  rotateX: 5,
                  rotateY: -5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Hover Glow */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, var(--accent) 0%, transparent 50%)`,
                    opacity: 0.1,
                  }}
                />

                {/* Animated Border on Hover */}
                <motion.div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, transparent 40%, var(--accent) 50%, transparent 60%)`,
                    backgroundSize: "200% 200%",
                  }}
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-[1px] bg-card rounded-[calc(1.5rem-1px)]" />

                {/* Number Badge - Floating */}
                <motion.div
                  className={`absolute -top-5 left-8 px-5 py-2.5 bg-gradient-to-r ${step.color} text-white rounded-full font-bold text-sm shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
                  }}
                >
                  {step.number}
                </motion.div>

                <div className="pt-6 relative z-10">
                  {/* Icon Container */}
                  <motion.div
                    className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden group-hover:bg-accent/10 transition-colors duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Icon Glow */}
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      <step.icon className="w-8 h-8 text-foreground relative z-10 group-hover:text-accent transition-colors duration-300" />
                    </motion.div>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors duration-300"
                  >
                    {step.title}
                  </motion.h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Hover Arrow Indicator */}
                  <motion.div
                    className="mt-6 flex items-center gap-2 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <span className="text-sm font-semibold">Learn more</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Corner Decoration */}
                <motion.div
                  className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${step.color} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500`}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- CTA SECTION ---
const CTA = () => {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent-secondary/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Main Card */}
          <div className="relative rounded-[3rem] overflow-hidden bg-card border border-border text-foreground">
            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Animated Gradient Orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-accent to-accent-light rounded-full blur-[120px]"
                animate={{
                  x: [0, 50, 0],
                  y: [0, 30, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                style={{ opacity: 0.4 }}
              />
              <motion.div
                className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-accent-secondary to-violet-500 rounded-full blur-[120px]"
                animate={{
                  x: [0, -40, 0],
                  y: [0, -50, 0],
                  scale: [1.1, 1, 1.1],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                style={{ opacity: 0.3 }}
              />
            </div>

            {/* Floating Book Decorations */}
            <motion.div
              className="absolute top-20 left-12 w-16 h-24 bg-gradient-to-br from-rose-400 to-orange-400 rounded-lg shadow-2xl hidden lg:block"
              animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ opacity: 0.8 }}
            />
            <motion.div
              className="absolute bottom-24 left-24 w-12 h-18 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg shadow-2xl hidden lg:block"
              animate={{ y: [10, -10, 10], rotate: [8, -8, 8] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{ opacity: 0.7 }}
            />
            <motion.div
              className="absolute top-32 right-16 w-14 h-20 bg-gradient-to-br from-violet-400 to-purple-400 rounded-lg shadow-2xl hidden lg:block"
              animate={{ y: [5, -15, 5], rotate: [-10, 5, -10] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              style={{ opacity: 0.75 }}
            />
            <motion.div
              className="absolute bottom-16 right-32 w-10 h-16 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg shadow-2xl hidden lg:block"
              animate={{ y: [-8, 12, -8], rotate: [12, -3, 12] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              style={{ opacity: 0.65 }}
            />

            {/* Content */}
            <div className="relative z-10 px-8 md:px-20 py-24 md:py-32 text-center">
              {/* Badge */}


              {/* Heading */}
              <motion.h2
                className="text-4xl md:text-5xl lg:text-7xl font-black mb-8 tracking-tight leading-[1.1]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <span className="block">Ready to start your</span>
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-accent-secondary">
                  reading adventure?
                </span>
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Clear your shelf, discover new favorites, and connect with readers in your community.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/signup">
                  <motion.div
                    className="group relative px-10 py-5 bg-gradient-to-r from-accent to-accent-light text-accent-foreground rounded-full font-bold text-lg overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {/* Button Glow */}
                    <motion.div
                      className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                      initial={{ x: "-200%" }}
                      whileHover={{ x: "200%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10 flex items-center gap-3">
                      Create Free Account
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </span>
                  </motion.div>
                </Link>

                <Link href="/books">
                  <motion.div
                    className="group px-10 py-5 border-2 border-border hover:border-accent/50 hover:bg-secondary rounded-full font-semibold text-lg transition-all duration-300 cursor-pointer flex items-center gap-2"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Library className="w-5 h-5" />
                    Browse Library
                  </motion.div>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>Community Driven</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  <span>Sustainable</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- FOOTER ---
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const platformLinks = [
    { label: "Browse Library", href: "/books", icon: Library },
    { label: "Exchange Points", href: "/exchange-points", icon: MapPin },
    { label: "My Wallet", href: "/wallet", icon: Wallet },
    { label: "Requests", href: "/requests", icon: RefreshCw },
  ];

  const communityLinks = [
    { label: "Forums", href: "/forums", icon: MessageSquare },
    { label: "Chat", href: "/chat", icon: Users },
    { label: "Settings", href: "/settings", icon: ShieldCheck },
  ];

  return (
    <footer className="relative bg-card border-t border-border overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20"
                whileHover={{ rotate: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <BookMarked className="w-6 h-6 text-accent-foreground" />
              </motion.div>
              <span className="font-black text-2xl tracking-tight">BookExchange</span>
            </motion.div>
            <p className="text-muted-foreground leading-relaxed max-w-sm mb-8">
              Where stories find new homes. Join our community of book lovers sharing reads, building connections, and keeping books alive.
            </p>
            {/* Quick Actions */}
            <div className="flex gap-3">
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-accent text-accent-foreground rounded-full font-semibold text-sm hover:bg-accent-light transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/books"
                className="px-5 py-2.5 border border-border rounded-full font-semibold text-sm hover:bg-secondary transition-colors"
              >
                Browse Books
              </Link>
            </div>
          </div>

          {/* Platform Links */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-lg mb-6">Platform</h4>
            <ul className="space-y-4">
              {platformLinks.map((link) => (
                <motion.li
                  key={link.label}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <link.icon className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                    <span>{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div className="md:col-span-3">
            <h4 className="font-bold text-lg mb-6">Community</h4>
            <ul className="space-y-4">
              {communityLinks.map((link) => (
                <motion.li
                  key={link.label}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <link.icon className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                    <span>{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} BookExchange. Made with ❤️ for book lovers.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Leaf className="w-4 h-4 text-success" />
            <span>Promoting sustainable reading</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN PAGE ---
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-foreground overflow-x-hidden">
      <Hero />
      <FeaturesGrid />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
