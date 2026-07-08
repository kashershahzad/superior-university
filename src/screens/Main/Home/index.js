import React, { useState } from 'react';

import Feeunpaid from './Feeunpaid';
import FeePaid from './FeePaid';

const Home = () => {
  const [status, setStatus] = useState('paid');

  return( status === 'unpaid' ? <Feeunpaid /> : <FeePaid />);
};

export default Home;
