// import React, { useState } from 'react';

// import Feeunpaid from './Feeunpaid';
// import FeePaid from './FeePaid';

// const Home = () => {
//   const [status, setStatus] = useState('paid');

//   return status === 'unpaid' ? (
//     <Feeunpaid />
//   ) : (
//     <FeePaid
//       feestatus="paid"
//       onShowUnpaid={() => setStatus('unpaid')}
//     />
//   );
// };

// export default Home;


import React from 'react';
import { useSelector } from 'react-redux';

import Feeunpaid from './Feeunpaid';
import FeePaid from './FeePaid';

const Home = () => {
  const feeStatus = useSelector(
    state => state.users?.userData?.student_profile?.fee_status,
  );

  // API: "pending" | "paid" | ...
  const isUnpaid = feeStatus !== 'paid';

  return isUnpaid ? (
    <Feeunpaid />
  ) : (
    <FeePaid feestatus="paid" />
  );
};

export default Home;
