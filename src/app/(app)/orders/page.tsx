// app/orders/page.tsx (서버 컴포넌트)
import OrdersPageClient from "./OrdersPageClient";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

async function getOrderData() {
    const res = await fetch(`${BASE_URL}/api/orders`, {
        next: { revalidate: 28800, tags: ['orders', 'public'] },
    });

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data');
    }

    return res.json();
}

export default async function OrdersPage() {
  const { propertyTypes, buyTypes } = await getOrderData();

  return <OrdersPageClient propertyTypes={propertyTypes} buyTypes={buyTypes} />;
}
