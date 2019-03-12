import React, { Component } from "react";
import Pagination from "./Pagination";

class TableComponent extends Component {
  constructor() {
    super();

    this.state = {
      currentPhones: [],
      staticCurrentPhones: [],
      sortedBy: "",
      sortDirections: "",
      searchQuery: "",
      editInputStyle: {
        top: 0,
        left: 0,
        width: "120px",
        height: "50px",
        display: "none"
      },
      editInputQuery: "",
      editCellLocation: {
        phoneId: "",
        header: ""
      },
      itemsPerPage: "20",
      activePage: 1,
      searchPhonesBufer: null
    };

    this.pageClickHandler = this.pageClickHandler.bind(this);
  }

  withCheckboxes(phones) {
    return phones.map(phone => ({ ...phone, checked: false }));
  }

  componentDidMount() {
    let { config } = this.props;
    let sortHeaders = Object.keys(config).filter(
      header => config[header].isSortable
    );
    let sortDirections = {};
    let searchParams = new URLSearchParams(window.location.search);
    let itemsPerPage = searchParams.get("perpage") || this.state.itemsPerPage;
    let activePage = +searchParams.get("page") || this.state.activePage;
    let maxPage =
      this.state.searchPhonesBufer === null
        ? Math.ceil(this.props.phones.length / itemsPerPage)
        : Math.ceil(this.state.searchPhonesBufer.length / itemsPerPage);

    if (
      searchParams.get("perpage") &&
      !["3", "5", "10", "20"].some(
        oneOfAllowed => oneOfAllowed === searchParams.get("perpage")
      )
    ) {
      searchParams.set("perpage", "20");
      itemsPerPage = "20";
      window.history.pushState(null, null, `?${searchParams.toString()}`);
    }
    if (searchParams.get("page")) {
      if (activePage > maxPage) {
        activePage = maxPage;
        searchParams.set("page", activePage);
        window.history.pushState(null, null, `?${searchParams.toString()}`);
      }
      searchParams.set("page", activePage);
      window.history.pushState(null, null, `?${searchParams.toString()}`);
    }

    let from = itemsPerPage * activePage - itemsPerPage;
    let to = itemsPerPage * activePage;

    for (let header of sortHeaders) {
      sortDirections[header] = "↕";
    }

    this.setState(
      {
        itemsPerPage,
        activePage,
        searchQuery: searchParams.get("query") || "",
        currentPhones: this.withCheckboxes(this.props.phones).slice(from, to),
        staticCurrentPhones: this.withCheckboxes(this.props.phones),
        sortDirections
      },
      () => {
        if (searchParams.get("sortby")) {
          let header = searchParams.get("sortby").split("_")[0];
          let direction = searchParams.get("sortby").split("_")[1];
          let isSortable = this.props.config[header].isSortable;
          this.sortBy(isSortable, header, direction);
        }

        searchParams.get("query") &&
        this.searchHandler(null, searchParams.get("query"));
      }
    );
  }

  selectPhoneHandler(id) {
    let updatedCurrentPhones = [...this.state.currentPhones];
    updatedCurrentPhones = updatedCurrentPhones.map(phone => {
      if (phone.id === id) {
        return {
          ...phone,
          checked: !phone.checked
        };
      }
      return phone;
    });

    this.setState({ currentPhones: updatedCurrentPhones });
  }

  selectAllHandler(event) {
    let allChecked = event.target.checked;
    let updatedCurrentPhones = [...this.state.currentPhones];
    updatedCurrentPhones = updatedCurrentPhones.map(phone => {
      return { ...phone, checked: allChecked };
    });

    this.setState({ currentPhones: updatedCurrentPhones });
  }

  isAllSelected() {
    return this.state.currentPhones.every(phone => phone.checked);
  }

  sortBy(isSortable = false, header, direction = "down") {
    if (!isSortable) {
      return;
    }

    let paramsString = window.location.search;
    let searchParams = new URLSearchParams(paramsString);
    let sortDownHeader = "";
    if (direction === "up") {
      sortDownHeader = header;
    }
    let sortType = typeof this.state.currentPhones[0][header];
    let updatedCurrentPhones = [...this.state.staticCurrentPhones];
    let searchBufer =
      this.state.searchPhonesBufer !== null
        ? [...this.state.searchPhonesBufer]
        : null;
    let sortDirections = this.getRefreshedSortArrows();

    if (header === sortDownHeader || this.state.sortedBy) {
      if (sortType === "string") {
        updatedCurrentPhones.sort((a, b) => b[header].localeCompare(a[header]));
        searchBufer !== null &&
        searchBufer.sort((a, b) => b[header].localeCompare(a[header]));
      } else if (sortType === "number") {
        updatedCurrentPhones.sort((a, b) => b[header] - a[header]);
        searchBufer !== null &&
        searchBufer.sort((a, b) => b[header] - a[header]);
      }
      sortDirections[header] = "↑";
      searchParams.set("sortby", `${header}_up`);
      window.history.pushState(null, null, `?${searchParams.toString()}`);

      this.setState({
        currentPhones:
          searchBufer === null
            ? updatedCurrentPhones.slice(0, this.state.itemsPerPage)
            : searchBufer.slice(0, this.state.itemsPerPage),
        staticCurrentPhones: updatedCurrentPhones,
        searchPhonesBufer: searchBufer,
        sortedBy: "",
        activePage: 1,
        sortDirections
      });
    } else {
      if (sortType === "string") {
        updatedCurrentPhones.sort((a, b) => a[header].localeCompare(b[header]));
        searchBufer !== null &&
        searchBufer.sort((a, b) => a[header].localeCompare(b[header]));
      } else if (sortType === "number") {
        updatedCurrentPhones.sort((a, b) => a[header] - b[header]);
        searchBufer !== null &&
        searchBufer.sort((a, b) => a[header] - b[header]);
      }
      sortDirections[header] = "↓";
      searchParams.set("sortby", `${header}_down`);
      window.history.pushState(null, null, `?${searchParams.toString()}`);

      this.setState({
        currentPhones:
          searchBufer === null
            ? updatedCurrentPhones.slice(0, this.state.itemsPerPage)
            : searchBufer.slice(0, this.state.itemsPerPage),
        staticCurrentPhones: updatedCurrentPhones,
        searchPhonesBufer: searchBufer,
        sortedBy: header,
        activePage: 1,
        sortDirections
      });
    }
  }

  searchHandler(event, linkQuerry = null) {
    let { config } = this.props;
    let value = linkQuerry || event.target.value;

    let paramsString = window.location.search;
    let searchParams = new URLSearchParams(paramsString);
    value === ""
      ? searchParams.delete("query")
      : searchParams.set("query", `${value}`);
    searchParams.set("page", "1");
    window.history.pushState(null, null, `?${searchParams.toString()}`);

    let updatedCurrentPhones = [...this.state.staticCurrentPhones];
    let searchBy = Object.keys(config).filter(
      header => config[header].isSearchable
    );
    let reg = new RegExp(value, "i");

    updatedCurrentPhones = updatedCurrentPhones.filter(phone =>
      searchBy.some(header => reg.test(phone[header]))
    );

    this.setState({
      searchQuery: value,
      currentPhones: updatedCurrentPhones.slice(0, this.state.itemsPerPage),
      searchPhonesBufer: value === "" ? null : updatedCurrentPhones,
      activePage: 1
    });
  }

  showSelectedHandler() {
    let updatedCurrentPhones = [...this.state.currentPhones];
    updatedCurrentPhones = updatedCurrentPhones.filter(phone => phone.checked);

    if (updatedCurrentPhones.length === 0) {
      return;
    }

    this.setState({ currentPhones: updatedCurrentPhones });
  }

  showAllHandler() {
    let from =
      this.state.activePage * this.state.itemsPerPage - this.state.itemsPerPage;
    let to = this.state.activePage * this.state.itemsPerPage;

    let phonesBufer =
      this.state.searchPhonesBufer === null
        ? [...this.state.staticCurrentPhones]
        : [...this.state.searchPhonesBufer];

    this.setState({
      currentPhones: phonesBufer.slice(from, to)
    });
  }

  editCellHandler(event) {
    let phoneId = event.target.dataset.phoneId;
    let header = event.target.dataset.header;
    let cellValue = event.target.textContent;
    let cellPosition = event.target.getBoundingClientRect();

    this.setState({
      editInputStyle: {
        display: "block",
        top: cellPosition.top,
        left: cellPosition.left,
        width: cellPosition.right - cellPosition.left - 3,
        height: cellPosition.bottom - cellPosition.top - 5
      },
      editCellLocation: {
        phoneId,
        header
      },
      editInputQuery: cellValue
    });
  }

  editInputHandler(event) {
    let editQuery = event.target.value;
    this.setState({ editInputQuery: editQuery });
  }

  submitEditHandler(event) {
    if (event.which !== 13) {
      return;
    }

    let { phoneId: rowByPhoneId, header } = this.state.editCellLocation;
    let { editInputQuery: editQuery } = this.state;
    let updatedCurrentPhones = [...this.state.currentPhones];

    updatedCurrentPhones = updatedCurrentPhones.map(phone => {
      if (phone.id === rowByPhoneId) {
        phone[header] = editQuery;
      }
      return phone;
    });

    this.setState({
      currentPhones: updatedCurrentPhones,
      editInputStyle: {
        top: 0,
        left: 0,
        width: "120px",
        height: "50px",
        display: "none"
      },
      editInputQuery: "",
      editCellLocation: {
        phoneId: "",
        header: ""
      }
    });
  }

  itemsPerPageHandler(event, perPageFromSearch = null) {
    let perPageValue = perPageFromSearch || event.target.value;

    let paramsString = window.location.search;
    let searchParams = new URLSearchParams(paramsString);
    searchParams.set("perpage", `${perPageValue}`);
    window.history.pushState(null, null, `?${searchParams.toString()}`);

    let phonesBufer =
      this.state.searchPhonesBufer === null
        ? [...this.state.staticCurrentPhones]
        : [...this.state.searchPhonesBufer];

    this.setState({
      itemsPerPage: perPageValue,
      currentPhones: phonesBufer.slice(0, perPageValue),
      activePage: 1
    });
  }

  pageClickHandler(from, to, activePage) {
    let paramsString = window.location.search;
    let searchParams = new URLSearchParams(paramsString);
    searchParams.set("page", `${activePage}`);
    window.history.pushState(null, null, `?${searchParams.toString()}`);

    let phonesBufer =
      this.state.searchPhonesBufer === null
        ? [...this.state.staticCurrentPhones]
        : [...this.state.searchPhonesBufer];

    this.setState({
      currentPhones: phonesBufer.slice(from, to),
      activePage
    });
  }

  getRefreshedSortArrows() {
    let sortDirections = { ...this.state.sortDirections };
    for (let header in sortDirections) {
      sortDirections[header] = "↕";
    }
    return sortDirections;
  }

  render() {
    let setArrowColor = header => {
      if (this.state.sortDirections[header] === "↕") {
        return { color: "blue" };
      } else if (this.state.sortDirections[header] === "↓") {
        return { color: "green" };
      } else if (this.state.sortDirections[header] === "↑") {
        return { color: "red" };
      }
    };

    return (
      <div className="TableComponent-container">
        <input
          type="text"
          style={{
            display: this.state.editInputStyle.display,
            position: "absolute",
            top: this.state.editInputStyle.top,
            left: this.state.editInputStyle.left,
            width: this.state.editInputStyle.width,
            height: this.state.editInputStyle.height
          }}
          value={this.state.editInputQuery}
          onChange={event => this.editInputHandler(event)}
          onKeyDown={event => this.submitEditHandler(event)}
        />

        <div className="TableComponent-pagination-container">
          <select
            value={this.state.itemsPerPage}
            onChange={event => this.itemsPerPageHandler(event)}
            className="TableComponent-items-per-page"
          >
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>

          <Pagination
            perPage={this.state.itemsPerPage}
            searchingPhones={this.state.searchPhonesBufer}
            phones={this.state.staticCurrentPhones}
            activePage={this.state.activePage}
            pageClickHandler={this.pageClickHandler}
          />
        </div>

        <button
          className="TableComponent-show-btn"
          onClick={() => this.showSelectedHandler()}
        >
          Show selected
        </button>
        <button
          className="TableComponent-show-btn"
          onClick={() => this.showAllHandler()}
        >
          Show all
        </button>
        <input
          type="text"
          className="TableComponent-search-input"
          placeholder=" Type to search ..."
          value={this.state.searchQuery}
          onChange={event => this.searchHandler(event)}
        />
        <table className="TableComponent-table">
          <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={this.isAllSelected()}
                onChange={event => this.selectAllHandler(event)}
              />
            </th>
            {Object.entries(this.props.config).map(([header, props]) => (
              <th
                className={
                  props.isSortable
                    ? "TableComponent-table-sortable-header"
                    : null
                }
                key={header}
                onClick={() => this.sortBy(props.isSortable, header)}
              >
                {props.title}{" "}
                {props.isSortable && (
                  <span style={setArrowColor(header)}>
                      {this.state.sortDirections[header]}
                    </span>
                )}
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {this.state.currentPhones.map(phone => (
            <tr key={phone.id}>
              <td>
                <input
                  type="checkbox"
                  checked={phone.checked}
                  onChange={() => this.selectPhoneHandler(phone.id)}
                />
              </td>
              {Object.keys(this.props.config).map(header => (
                <td
                  key={header}
                  data-phone-id={phone.id}
                  data-header={header}
                  onDoubleClick={event => {
                    this.editCellHandler(event);
                  }}
                >
                  {phone[header]}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
        <div className="TableComponent-pagination-bot-container">
          <Pagination
            perPage={this.state.itemsPerPage}
            searchingPhones={this.state.searchPhonesBufer}
            phones={this.state.staticCurrentPhones}
            activePage={this.state.activePage}
            pageClickHandler={this.pageClickHandler}
          />
        </div>
      </div>
    );
  }
}

export default TableComponent;
