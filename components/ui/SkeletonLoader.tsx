/**
 * Skeleton Loader Component
 * 
 * Prevents Cumulative Layout Shift (CLS) by reserving space for dynamic content
 * while it loads. This improves Core Web Vitals scores.
 * 
 * Requirements: 21.3 - CLS optimization
 */

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function SkeletonLoader({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = '20px',
  lines = 1,
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: index === lines - 1 ? '80%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

/**
 * Chat Skeleton Loader
 * Specific skeleton for chat interface to prevent layout shift
 */
export function ChatSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header skeleton */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-800">
        <SkeletonLoader height={64} />
      </div>
      
      {/* Messages skeleton */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <SkeletonLoader width={100} height={20} variant="text" />
            <SkeletonLoader height={80} variant="rectangular" lines={3} />
          </div>
        ))}
      </div>
      
      {/* Input skeleton */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-800">
        <SkeletonLoader height={100} />
      </div>
    </div>
  );
}

/**
 * Blog Post Skeleton Loader
 * Specific skeleton for blog posts to prevent layout shift
 */
export function BlogPostSkeleton() {
  return (
    <article className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Title skeleton */}
      <SkeletonLoader height={48} width="80%" variant="text" />
      
      {/* Meta info skeleton */}
      <div className="flex gap-4">
        <SkeletonLoader width={120} height={20} variant="text" />
        <SkeletonLoader width={100} height={20} variant="text" />
      </div>
      
      {/* Featured image skeleton */}
      <SkeletonLoader height={400} variant="rectangular" />
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <SkeletonLoader height={24} variant="text" lines={8} />
        <SkeletonLoader height={24} variant="text" lines={6} />
        <SkeletonLoader height={24} variant="text" lines={7} />
      </div>
    </article>
  );
}
