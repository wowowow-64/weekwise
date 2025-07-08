import Header from '@/components/Header';
import WeeklyPlanner from '@/components/WeeklyPlanner';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Header />
        <WeeklyPlanner />
      </main>
    </div>
  );
}
