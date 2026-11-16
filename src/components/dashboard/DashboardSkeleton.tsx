'use client';

import React from 'react';
import { Skeleton } from '@/components/atoms/skeleton';

export function DashboardSkeleton() {
  return (
    <div
      className="space-y-8 animate-fade-in"
      aria-busy="true"
      aria-label="Loading dashboard data"
    >
      {/* 1. Patient Header Hero Skeleton */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 sm:space-x-5">
            <Skeleton className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-7 sm:h-8 w-48 sm:w-64 rounded-xl" />
              <Skeleton className="h-4 w-36 sm:w-44 rounded-lg" />
              <div className="flex flex-wrap gap-2 pt-1">
                <Skeleton className="h-6 w-32 rounded-xl" />
                <Skeleton className="h-6 w-28 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <Skeleton className="h-14 w-52 rounded-2xl" />
            <Skeleton className="h-12 w-36 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* 2. Latest Blood Sugar Reading Card Skeleton */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-48 rounded-lg" />
          <Skeleton className="h-6 w-28 rounded-xl" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 my-3">
          <div className="flex items-baseline space-x-3">
            <Skeleton className="h-16 w-36 rounded-2xl" />
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-44 rounded-2xl" />
        </div>
        {/* Spectrum gauge placeholder */}
        <div className="my-6 space-y-2">
          <Skeleton className="w-full h-3.5 rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Skeleton className="h-4 w-40 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
      </div>

      {/* 3. Summary Metrics Cards Skeleton (5 cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-16 rounded-lg" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-20 rounded-xl my-2" />
            <Skeleton className="h-3 w-24 rounded-lg" />
          </div>
        ))}
      </div>

      {/* 4. Daily Wellness & Routine Skeleton */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3.5">
            <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 rounded-lg" />
              <Skeleton className="h-4 w-64 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-7 w-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-50/70 border border-slate-100 rounded-2xl p-5 space-y-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Glucose Trend Chart Skeleton */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs h-[380px] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-8 w-44 rounded-2xl" />
        </div>
        <div className="h-56 w-full bg-slate-50/80 rounded-2xl p-6 flex items-end justify-between gap-3">
          {[35, 60, 50, 80, 65, 85, 55, 75, 45, 70, 90, 60].map((h, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-lg"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-40 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
      </div>

      {/* 5. Quick Health Action Spotlight Tiles Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-44 rounded-lg" />
                <Skeleton className="h-3.5 w-56 rounded-lg" />
              </div>
            </div>
            <Skeleton className="w-10 h-10 rounded-2xl" />
          </div>
        ))}
      </div>

      {/* 6. Recent Alerts & Upcoming Reminders Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
          >
            <Skeleton className="h-5 w-40 rounded-lg" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
