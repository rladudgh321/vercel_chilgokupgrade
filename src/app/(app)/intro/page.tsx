import ChairmanMessage from "./ChairmanMessage";
import IntroContent from "./IntroContent";
import IntroHeader from "./IntroHeader";
export const dynamic = 'force-dynamic';

export default function IntroPage() {
  return (
    <main>
      <IntroHeader />
      <IntroContent />
      <ChairmanMessage />
    </main>
  );
}