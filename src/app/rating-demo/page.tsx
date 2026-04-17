import AnimatedRating from '@/components/AnimatedRating';

export default function RatingDemoPage() {
  return (
    <main 
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url("/images/bg-storefront.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[2px]" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 p-10">
        <AnimatedRating rating={5.0} label="Excellent Quality" count={214} />
        <AnimatedRating rating={4.0} label="Average Rating" count={128} />
        <AnimatedRating rating={3.5} label="Overall Service" count={95} />
        <AnimatedRating rating={3.0} label="Customer Service" count={78} />
      </div>

      <div className="relative z-10 mt-12 px-8 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-light tracking-widest uppercase">
        Live Rating Animation Demo
      </div>
    </main>
  );
}
