import React, { useState } from 'react';

import Feeunpaid from './Feeunpaid';
import FeePaid from './FeePaid';

const Home = () => {
  const [status, setStatus] = useState('paid');

  if (status === 'unpaid') {
    return <Feeunpaid key="fee-unpaid" />;
  }

  return (
    <FeePaid
      key="fee-paid"
      feestatus="paid"
      onShowUnpaid={() => setStatus('unpaid')}
    />
  );
};

export default Home;
