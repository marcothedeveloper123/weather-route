import { useMemo, useState } from 'react';
import { Route } from 'lucide-react';
import SearchForm from '@/components/SearchForm';
import DepartureSlider from '@/components/DepartureSlider';
import StopList from '@/components/StopList';
import RouteMap from '@/components/RouteMap';
import { UserFacingError } from '@/lib/errors';
import { buildStopForecasts } from '@/lib/arrivals';
import { planTrip } from '@/lib/planTrip';
import type { PlanInput, TripPlan } from '@/lib/types';

const GENERIC_ERROR = 'Something went wrong while planning your trip. Please try again.';

export default function App() {
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [departureMs, setDepartureMs] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopForecasts = useMemo(
    () => (plan ? buildStopForecasts(plan, departureMs) : []),
    [plan, departureMs],
  );

  const handleSubmit = async (input: PlanInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const nextPlan = await planTrip(input);
      setPlan(nextPlan);
      setDepartureMs(nextPlan.departureMs);
      setSelectedIndex(null);
    } catch (error) {
      setPlan(null);
      setErrorMessage(error instanceof UserFacingError ? error.message : GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 lg:h-screen lg:flex-row">
      <aside className="flex w-full flex-col gap-6 overflow-y-auto border-slate-200 bg-white p-6 lg:w-[400px] lg:shrink-0 lg:border-r">
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-700 text-white">
            <Route className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Route Weather</h1>
            <p className="text-sm leading-snug text-slate-600">Forecast for every stop on your drive</p>
          </div>
        </header>

        <SearchForm isLoading={isLoading} errorMessage={errorMessage} onSubmit={handleSubmit} />

        {plan && (
          <>
            <DepartureSlider
              minMs={plan.sliderMinMs}
              maxMs={plan.sliderMaxMs}
              valueMs={departureMs}
              utcOffsetSeconds={plan.startUtcOffsetSeconds}
              onChange={setDepartureMs}
            />
            <StopList items={stopForecasts} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
            <p className="text-xs leading-relaxed text-slate-500">
              Driving times use typical free-flow speeds and do not include traffic.
            </p>
          </>
        )}
      </aside>

      <main className="relative h-[60vh] flex-1 lg:h-auto">
        <RouteMap
          geometry={plan?.geometry ?? null}
          items={stopForecasts}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      </main>
    </div>
  );
}
