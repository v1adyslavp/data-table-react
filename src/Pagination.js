import React from 'react';
import './Pagination.css';

const Pagination = ({phones, itemsPerPage, clickHandler, activePage}) => {
  let pages = Math.ceil(phones.length / itemsPerPage);
  let pagesArr = [];
  for (let i = 1; i <= pages; i++) {
    let showFrom = i * itemsPerPage - itemsPerPage;
    let showTo = i * itemsPerPage;

    pagesArr.push(
      <span
        key={i}
        onClick={() => clickHandler(showFrom, showTo, i)}
        className={
          activePage === i
            ? 'Pagination-page Pagination-active'
            : 'Pagination-page'
        }
      >
        {i}
      </span>
    );
  }
  return <div>{pagesArr}</div>;
};

export default Pagination;
