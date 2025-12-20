import React from 'react';
import { motion } from 'framer-motion';

export const CardSkeleton = () => (
  <div className="glass-card border border-white/5 rounded-3xl p-8 animate-pulse">
    <div className="h-48 bg-white/5 rounded-2xl mb-4" />
    <div className="h-6 bg-white/5 rounded w-3/4 mb-2" />
    <div className="h-4 bg-white/5 rounded w-1/2" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="glass-card border border-white/5 rounded-3xl p-8 animate-pulse">
    <div className="w-32 h-32 bg-white/5 rounded-full mx-auto mb-6" />
    <div className="h-6 bg-white/5 rounded w-2/3 mx-auto mb-2" />
    <div className="h-4 bg-white/5 rounded w-1/2 mx-auto mb-4" />
    <div className="h-4 bg-white/5 rounded w-3/4 mx-auto" />
  </div>
);

export const EventSkeleton = () => (
  <div className="glass-card border border-white/5 rounded-3xl overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-white/5" />
    <div className="p-6">
      <div className="h-6 bg-white/5 rounded w-3/4 mb-3" />
      <div className="h-4 bg-white/5 rounded w-full mb-2" />
      <div className="h-4 bg-white/5 rounded w-2/3" />
    </div>
  </div>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass-card border border-white/5 rounded-3xl p-6 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-white/5 rounded w-2/3" />
            <div className="h-4 bg-white/5 rounded w-full" />
            <div className="h-4 bg-white/5 rounded w-4/5" />
          </div>
        </div>
      </div>
    ))}
  </>
);

export const PageSkeleton = () => (
  <div className="container mx-auto px-6 pt-40 pb-32 max-w-7xl">
    <div className="mb-16 animate-pulse">
      <div className="h-16 bg-white/5 rounded w-1/2 mx-auto mb-4" />
      <div className="h-6 bg-white/5 rounded w-1/3 mx-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);
