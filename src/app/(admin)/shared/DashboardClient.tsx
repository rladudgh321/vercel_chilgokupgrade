'use client';

import ManagementAPI from '@/app/layout/admin/Header/ManagementAPI';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomizedLabelProps) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface ChartData {
  name: string;
  value: number;
}

interface ChartWithSortedListProps {
  title: string;
  data: ChartData[];
}

const ChartWithSortedList = ({ title, data }: ChartWithSortedListProps) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="mt-4">
      <ul>
        {data.sort((a, b) => b.value - a.value).map((item, index) => (
          <li key={index} className="flex justify-between py-1 border-b">
            <span>{item.name}</span>
            <span>{item.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

interface ListingStats {
  totalListings: number;
  totalViews: number;
}

interface InquiryStats {
  buy: number;
  sell: number;
  other: number;
}

interface TopListing {
  address: string;
  views: number;
}

interface DashboardData {
  listingStats: ListingStats;
  inquiryStats: InquiryStats;
  contactRequests: number;
  categoryViews: ChartData[];
  themeViews: ChartData[];
  topListings: TopListing[];
}

interface DashboardClientProps {
  dashboardData: DashboardData;
}

export default function DashboardClient({ dashboardData }: DashboardClientProps) {
  const { listingStats, inquiryStats, contactRequests, categoryViews, themeViews, topListings } = dashboardData;
  // console.log('contactRequests',contactRequests);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8">대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">전체 매물</h2>
          <p className="text-3xl">{listingStats.totalListings.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">총 조회수 (공개)</h2>
          <p className="text-3xl">{listingStats.totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">미확인 의뢰</h2>
          <p className="text-3xl">매수: {inquiryStats.buy} | 매도: {inquiryStats.sell} | 기타: {inquiryStats.other}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">미확인 연락요청</h2>
          <p className="text-3xl">{contactRequests.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartWithSortedList title="카테고리별 조회수" data={categoryViews} />
        <ChartWithSortedList title="테마별 조회수" data={themeViews} />
      </div>
      <ManagementAPI />

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">조회수 상위 5개 매물</h2>
        <ul>
          {topListings.map((listing, index) => (
            <li key={index} className="flex justify-between py-1 border-b">
              <span className="truncate pr-4">{listing.address}</span>
              <span>{listing.views.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
