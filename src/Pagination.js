import React from "react";

const Pagination = ({
                      searchingPhones,
                      phones,
                      perPage,
                      activePage,
                      pageClickHandler
                    }) => {
  let pages =
    searchingPhones === null
      ? Math.ceil(phones.length / perPage)
      : Math.ceil(searchingPhones.length / perPage);
  if (activePage > pages) {
    activePage = pages;
  } else if (activePage < 1) {
    activePage = 1;
  }
  let renderPages = [];

  for (let i = 1; i <= pages; i++) {
    let from = perPage * i - perPage;
    let to = perPage * i;
    renderPages.push(
      <span
        key={i}
        className={
          activePage === i
            ? "TableComponent-pagination-item TableComponent-pagination-active-page"
            : "TableComponent-pagination-item"
        }
        onClick={event => pageClickHandler(from, to, i)}
      >
        {i}
      </span>
    );
  }
  return <div>{renderPages}</div>;
};

export default Pagination;
