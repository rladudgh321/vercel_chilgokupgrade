import { Suspense } from "react";
import CardList from "./CardList";

export default function CardPage() {
  return (
    <Suspense>
      <CardList />
    </Suspense>
  );
}