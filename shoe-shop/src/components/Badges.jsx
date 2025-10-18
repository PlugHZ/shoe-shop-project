import React from 'react';
import { FaTruckFast, FaHandHoldingDollar, FaBoxOpen } from 'react-icons/fa6';
import './Badges.css';

const Badges = () => {
  return (
    <section className="badges-section container">
        <div className="badge">
            <FaTruckFast size={36} />
            <span>ส่งฟรีทั่วประเทศไทย</span>
        </div>
        <div className="badge">
            <FaHandHoldingDollar size={36} />
            <span>บริการเก็บเงินปลายทาง</span>
        </div>
        <div className="badge">
            <FaBoxOpen size={36} />
            <span>คืนสินค้าภายใน 14 วัน</span>
        </div>
    </section>
  )
}
export default Badges;