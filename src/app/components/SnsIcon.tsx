import Image from 'next/image';
import { getSnsSettings } from '../(app)/layout';

export type SnsSetting = {
  id: number;
  name: string;
  url: string;
  imageUrl: string;
};

export type SnsIconProps = {
  snsSettingsPromise: ReturnType<typeof getSnsSettings>
};

const SnsIcon = async ({ snsSettingsPromise }: SnsIconProps) => {
  const snsSettings = await snsSettingsPromise;
  if (!snsSettings || snsSettings.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-center mb-6">Follow Us</h2>
        <div className="flex justify-center space-x-6">
          {snsSettings.map((setting) => (
            <a key={setting.id} href={setting.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center hover:text-blue-500 transition-colors">
              <Image src={setting.imageUrl || '/father.jpg'} alt={setting.name} width={32} height={32} className="w-8 h-8 object-cover" />
              <span className="mt-2 text-sm">{setting.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SnsIcon;
