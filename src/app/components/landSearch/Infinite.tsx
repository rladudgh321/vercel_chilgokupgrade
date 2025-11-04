import Image from 'next/image';
import Link from 'next/link';
import Check from '../svg/Check';
import Layer from '../svg/Layer';
import Smile from '../svg/Smile';

interface LandFuncProps {
  id: string;
  image: string;
  options: {
    landType: string;
    floor: number;
    toilet: number;
    room: number;
  },
  title: string;
  description: string;
  address: string;
}

const Infinite = () => {
  const landFunc: LandFuncProps = {
    id: '1',
    image: '/img/main.png',
    options: {
      landType: 'landType',
      floor: 8,
      toilet: 3,
      room: 3,
    },
    title: 'title',
    description: 'desc',
    address: '주소'
  }

  return (
    <div className="flex p-4 space-x-4">
      {/* Land Image */}
      <Link href={`/landsearch/${landFunc.id}`}>
        <a>
          <Image
            alt="grim"
            width={120}
            height={90}
            src={landFunc.image}
            className="rounded-xl flex-shrink-0"
          />
        </a>
      </Link>

      {/* Card */}
      <div className="flex-1 relative p-2 bg-white rounded-xl shadow-md">
        <div className="absolute top-0 left-0 right-0 flex bg-white px-2 py-1 space-x-4 text-xs font-medium text-gray-600">
          <div className="flex-1 text-center">
            <Check className='w-8' />
            <p>{landFunc.options.landType}</p>
          </div>
          <div className="flex-1 text-center">
            <Layer className='w-8' />
            <p>{landFunc.options.floor}층</p>
          </div>
          <div className="flex-1 text-center">
            <Smile className='w-8' />
            <p>{landFunc.options.room} {landFunc.options.toilet}</p>
          </div>
        </div>

        {/* Card content */}
        <div className="p-2">
          <h3 className="text-sm font-bold">{landFunc.title}</h3>
          <p className="text-xs text-gray-600">{landFunc.description}</p>
          <p className="text-xs text-gray-600">{landFunc.address}</p>
        </div>
      </div>
    </div>
  );
};

export default Infinite;
