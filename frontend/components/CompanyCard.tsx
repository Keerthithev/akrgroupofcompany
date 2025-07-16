"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react";

interface CompanyCardProps {
  name: string
  description: string
  icon?: string
  image?: string
  link?: string
  compact?: boolean
  quickActions?: boolean
  phone?: string // optional for quick actions
}

export function CompanyCard({ name, description, icon, image, link, compact, quickActions, phone }: CompanyCardProps) {
  return (
    <Card className={`glass-card ${compact ? 'p-2 h-[180px] max-h-[180px] min-h-[180px]' : 'p-4 sm:p-6 h-[420px] max-h-[420px] min-h-[420px]'} cosmic-hover group overflow-hidden relative border-0 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col`}>
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
      <div className="relative z-10 flex flex-col flex-1">
        {image ? (
          <div className={`w-full ${compact ? 'h-10' : 'h-[120px]'} rounded-xl overflow-hidden relative flex items-center justify-center bg-gray-100`}>
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${compact ? 'rounded' : ''}`}
              onError={e => { e.currentTarget.src = "/placeholder.svg"; }}
            />
            {/* Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ) : (
          icon && (
            <div className={`w-10 h-10 ${compact ? 'text-xl' : 'w-16 h-16 text-3xl'} rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto`}>
              {icon}
            </div>
          )
        )}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className={`font-semibold ${compact ? 'text-base mb-1' : 'text-lg sm:text-xl mb-2 sm:mb-3'} group-hover:gradient-text transition-all duration-300 leading-tight`}>{name}</h3>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <p className={`text-gray-700 ${compact ? 'text-xs' : 'text-sm sm:text-base'} leading-relaxed group-hover:text-gray-800 transition-colors duration-300 font-medium break-words`}>{description}</p>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {quickActions ? (
            <div className="flex gap-1">
              {link && (
                <Button size="sm" className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 text-xs py-1" onClick={() => window.location.href = link}>Visit</Button>
              )}
              {phone && (
                <Button size="sm" className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 text-xs py-1" onClick={() => window.open(`tel:${phone}`)}>Call</Button>
              )}
              {link && (
                <Button size="sm" className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 text-xs py-1" onClick={() => window.open(`https://wa.me/${phone || ''}`)}>WhatsApp</Button>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full bg-gradient-primary hover:bg-gradient-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 text-base py-2"
              onClick={() => {
                if (link) {
                  window.location.href = link;
                }
              }}
              disabled={!link}
            >
              Visit
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// Professional ad-style company card for homepage hero
export function AdCompanyCard({ company }: { company: CompanyCardProps }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="relative rounded-2xl overflow-hidden shadow-xl group min-h-[120px] h-32 md:h-40 w-full flex items-end justify-center bg-gray-100 border border-white/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-105 hover:border-primary/60"
      style={{ background: 'rgba(255,255,255,0.45)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}
    >
      {company.image && (
        <img
          src={company.image}
          alt={company.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
          onError={e => { e.currentTarget.src = "/placeholder.svg"; }}
        />
      )}
      {/* Stronger overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="relative z-10 w-full flex flex-col items-center px-3 pb-2">
        <div className="w-full flex flex-row items-center justify-between">
          <h3 className="text-white text-base md:text-lg font-bold truncate" style={{textShadow:'0 2px 8px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.7)'}}>
            {company.name}
          </h3>
          {company.link && (
            <Button
              size="sm"
              className="bg-gradient-primary hover:bg-gradient-secondary text-xs px-3 py-1 font-semibold shadow-md rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary/30"
              onClick={() => window.location.href = company.link!}
            >
              <span className="inline-block transition-transform group-hover:translate-x-1">Visit</span>
            </Button>
          )}
        </div>
        <p className="text-white text-xs md:text-sm truncate w-full font-semibold" style={{textShadow:'0 2px 8px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.7)'}}>
          {company.description}
        </p>
      </div>
      {/* Soft glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 transition-all duration-500" style={{boxShadow:'0 0 32px 8px rgba(16, 185, 129, 0.18)'}} />
    </motion.div>
  )
}

// FilmRollAdColumn: true film roll effect, continuous vertical scroll, no fade
export function FilmRollAdColumn({ companies, direction = 'up', visibleCount = 2, intervalMs = 6000 }: { companies: CompanyCardProps[], direction?: 'up' | 'down', visibleCount?: number, intervalMs?: number }) {
  // Duplicate companies for seamless loop
  const items = [...companies, ...companies.slice(0, visibleCount)];
  const containerRef = useRef<HTMLDivElement>(null);

  // Height per card (fixed for now)
  const cardHeight = 160; // px
  const totalHeight = cardHeight * items.length;
  const visibleHeight = cardHeight * visibleCount;

  // Keyframes for stepwise slide (pause at each card)
  const steps = companies.length;
  let keyframes = `@keyframes filmRoll${direction} {`;
  for (let i = 0; i <= steps; i++) {
    const percent = (i / steps) * 100;
    const translate = (direction === 'up' ? -1 : 1) * cardHeight * i;
    keyframes += `${percent}% { transform: translateY(${translate}px); }`;
  }
  keyframes += `}`;

  return (
    <div style={{ height: visibleHeight, overflow: 'hidden', position: 'relative' }}>
      <style>{keyframes}</style>
      <div
        ref={containerRef}
        style={{
          height: totalHeight,
          display: 'flex',
          flexDirection: 'column',
          animation: `filmRoll${direction} ${(intervalMs * companies.length) / 1000}s steps(${companies.length}, end) infinite`,
        }}
      >
        {items.map((company, idx) => (
          <div key={company.name + idx} style={{ height: cardHeight, marginBottom: 16 }}>
            <AdCompanyCard company={company} />
          </div>
        ))}
      </div>
    </div>
  );
}

