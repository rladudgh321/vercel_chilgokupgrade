import Compass from '../svg/Compass';
import Reload from '../svg/Reload';
import BuyType from './LandOption';
import LandType from './LandType';
import RestRoom from './RestRoom';
// import Room from './Room';
import Size from './Size';
import Theme from './Theme';

const IfToolbar = () => {
// const IfToolbar = ({ admin }) => {
  return (
    <div className="bg-gray-300 h-[120px] p-4 flex items-center">
      <div className="flex flex-wrap w-full md:w-4/5 space-x-2">
        {/* Search input */}
        <input
          type="text"
          placeholder="관심지역 입력"
          className="min-w-[200px] w-[20vw] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <LandType />
        <BuyType />
        <Theme />
        {/* <Room /> */}
        <RestRoom />
        <Size />
        
        <button className="flex items-center p-2 bg-gray-200 text-black rounded-md hover:bg-gray-300">
          <Reload className="mr-2" />
          Reset
        </button>
      </div>

      <div className="w-full md:w-1/5 flex justify-end space-x-2 mt-2 md:mt-0">
        {/* {admin || ( */}
          <div className="flex space-x-2">
            <button className="flex items-center p-2 bg-gray-200 text-black rounded-md hover:bg-gray-300">
              <Compass className="mr-2" />
              지도
            </button>
            <button className="flex items-center p-2 bg-gray-200 text-black rounded-md hover:bg-gray-300">
              <span className="mr-2">三</span>
              목록
            </button>
          </div>
         {/* )} */}
      </div>
    </div>
  );
};

export default IfToolbar;
