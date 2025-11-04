"use client"

import { useState } from 'react';
// import { UpdateAddress, UpdateDone, UpdateEumpmeon, UpdateLi } from '@/reducer/location';

// const Location = ({eump, setEump, li, setLi, addre, setAddre}) => {
const Location = () => {
  // const dispatch = useDispatch();
  // const { addLandDone } = useSelector((state) => state.land);
  // const { chilgok, eumpmeon, eupArray, lia } = useSelector((state) => state.location);
  const [showMore] = useState(false);

  // const handleChange = useCallback((e) => {
  //   if (e === 'null') {
  //     setEump('읍/면');
  //   }
  //   chilgok.map((v) => {
  //     if (v.label === e) {
  //       setShowMore(true);
  //       setEump(v.label);
  //       return dispatch({
  //         type: UpdateEumpmeon,
  //         data: { eup: v.label, more: v.more },
  //       });
  //     }
  //   });
  // }, [eumpmeon]);

  // const onVmoreClick = useCallback((e) => {
  //   if (e === 'null') {
  //     setLia('리');
  //   }
  //   eupArray.map((v) => {
  //     if (v.value === e) {
  //       setLi(v.label);
  //       return dispatch({
  //         type: UpdateLi,
  //         data: v.label,
  //       });
  //     }
  //   });
  // }, [eupArray, lia]);

  // const [address, setter] = useState(addre);
  // const onChangeAddress = useCallback((e) => {
  //   setter(e.target.value);
  //   dispatch({
  //     type: UpdateAddress,
  //     data: e.target.value,
  //   });
  // }, []);

  // const reset = useCallback(() => {
  //   setEump(null);
  //   setLi(null);
  //   setter('');
  //   dispatch({
  //     type: UpdateDone,
  //   });
  // }, []);

  // useEffect(() => {
  //   if (addLandDone) {
  //     setter('');
  //   }
  // }, [addLandDone]);

  return (
    <div className="p-4">
      <div className="text-lg mb-4">위치</div>
      <div className="mb-4">
        <button 
          // onClick={reset} 
          className="bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          경북 칠곡군
        </button>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <select
            // value={eump || '읍/면'}
            // onChange={(e) => handleChange(e.target.value)}
            className="border p-2 rounded-md w-full"
          >
            {/* {chilgok.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))} */}
          </select>
        </div>

        {showMore && (
          <div className="flex-1">
            <select
              // value={li || '리'}
              // onChange={(e) => onVmoreClick(e.target.value)}
              className="border p-2 rounded-md w-full"
            >
              {/* {eupArray.map((option) => ( */}
                {/* <option key={option.value} value={option.value}> */}
                  {/* {option.label} */}
                {/* </option> */}
              {/* ))} */}
            </select>
          </div>
        )}
      </div>

      <div className="mt-4">
        <input
          // value={address || ''}
          // onChange={onChangeAddress}
          placeholder="상세주소"
          className="border p-2 rounded-md w-full"
        />
      </div>
    </div>
  );
};

export default Location;
