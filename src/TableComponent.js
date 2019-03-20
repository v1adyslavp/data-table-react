import React, {Component} from 'react';
import Pagination from './Pagination';
import './TableComponent.css';

class TableComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      phones: this.withCheckboxes([...this.props.phones]),
      allCheckedPages: [],
      sortedBy: {},
      query: '',
      itemsPerPage: '20',
      selectedPhones: [],
      activePage: 1,
      editInputStyle: {
        top: 0,
        left: 0,
        width: '120px',
        height: '50px',
        display: 'none'
      },
      editInputQuery: '',
      editCellLocation: {
        phoneId: '',
        header: ''
      }
    };

    this.paginationClickHandler = this.paginationClickHandler.bind(this);
  }

  componentDidMount() {
    let searchParams = new URLSearchParams(window.location.search);
    let sorted = searchParams.get('sorted');
    let query = searchParams.get('query');
    let itemsPerPage = searchParams.get('perpage');
    let activePage = +searchParams.get('page');

    if (sorted) {
      let [header, direction] = sorted.split('_');
      let isSortable = this.props.config[header].isSortable;

      isSortable && this.setState({sortedBy: {header, direction}});
    }

    if (query) {
      this.setState({query});
    }

    if (itemsPerPage) {
      this.setState({itemsPerPage, showTo: itemsPerPage});
    }

    if (activePage) {
      this.setState({
        activePage,
        showFrom: activePage * itemsPerPage - itemsPerPage,
        showTo: activePage * itemsPerPage
      });
    }
  }

  withCheckboxes(phones) {
    return phones.map(phone => ({...phone, checked: false}));
  }

  selectAllHandler(phones, selectedPhones, activePage) {
    let allChecked = !this.isAllOnPageChecked(activePage);
    let {showFrom, showTo, allCheckedPages} = this.state;
    let updatedPhones = [...phones];

    updatedPhones = updatedPhones.map((phone, i) => {
      if (i >= showFrom && i < showTo) {
        return {...phone, checked: allChecked};
      }
      return phone;
    });

    let basePhones = this.state.phones.map(phone => {
      let newPhone = {...phone};
      updatedPhones.forEach(updPhone => {
        if (updPhone.id === phone.id) {
          newPhone.checked = updPhone.checked;
        }
      });

      return newPhone;
    });

    if (allChecked) {
      allCheckedPages = [...allCheckedPages, activePage];
    } else {
      allCheckedPages = allCheckedPages.filter(page => page !== activePage);
    }

    if (selectedPhones.length > 0) {
      this.setState({
        allCheckedPages,
        selectedPhones: updatedPhones
      });
    } else {
      this.setState({
        allCheckedPages,
        phones: basePhones
      });
    }
  }

  selectPhoneHandler(id, activePage) {
    let {
      selectedPhones,
      phones,
      allCheckedPages,
      showFrom,
      showTo
    } = this.state;
    let updatedPhones = selectedPhones.length > 0 ? selectedPhones : phones;

    updatedPhones = updatedPhones.map(phone => {
      if (id === phone.id) {
        return {...phone, checked: !phone.checked};
      }
      return phone;
    });

    let currentPagePhones = updatedPhones.slice(showFrom || 0, showTo || 20);

    if (this.isAllSelected(currentPagePhones)) {
      allCheckedPages = [...allCheckedPages, activePage];
    } else {
      allCheckedPages = allCheckedPages.filter(page => page !== activePage);
    }

    if (selectedPhones.length > 0) {
      this.setState({
        allCheckedPages,
        selectedPhones: updatedPhones
      });
    } else {
      this.setState({
        allCheckedPages,
        phones: updatedPhones
      });
    }
  }

  isAllSelected(phones) {
    return phones.every(phone => phone.checked);
  }

  isAllOnPageChecked(activePage) {
    return this.state.allCheckedPages.includes(activePage);
  }

  getSortArrow(header) {
    let {sortedBy} = this.state;
    if (sortedBy.header === header && sortedBy.direction === 'down') {
      return {arrow: '↓', color: 'green'};
    } else if (sortedBy.header === header && sortedBy.direction === 'up') {
      return {arrow: '↑', color: 'red'};
    } else {
      return {arrow: '↕', color: 'blue'};
    }
  }

  sortStateHandler(header) {
    this.setState(prevState => {
      let {header: sortedByHeader, direction} = prevState.sortedBy;
      let newSort = {};

      if (sortedByHeader === header && direction === 'up') {
        newSort = {...prevState.sortedBy, direction: 'down'};
      } else if (sortedByHeader === header && direction === 'down') {
        newSort = {...prevState.sortedBy, direction: 'up'};
      } else {
        newSort.header = header;
        newSort.direction = 'down';
      }

      return {
        sortedBy: newSort,
        showFrom: 0,
        showTo: prevState.itemsPerPage,
        activePage: 1
      };
    });
  }

  sortBy(phones) {
    let {sortedBy} = this.state;
    let phonesToSort = [...phones];
    let sortType = typeof phonesToSort[0][sortedBy.header];

    if (sortedBy.direction === 'up') {
      if (sortType === 'string') {
        phonesToSort.sort((a, b) =>
          b[sortedBy.header].localeCompare(a[sortedBy.header])
        );
      } else if (sortType === 'number') {
        phonesToSort.sort((a, b) => b[sortedBy.header] - a[sortedBy.header]);
      }
      this.setURLSearchParam('sorted', `${sortedBy.header}_up`);
    } else if (sortedBy.direction === 'down') {
      if (sortType === 'string') {
        phonesToSort.sort((a, b) =>
          a[sortedBy.header].localeCompare(b[sortedBy.header])
        );
      } else if (sortType === 'number') {
        phonesToSort.sort((a, b) => a[sortedBy.header] - b[sortedBy.header]);
      }
      this.setURLSearchParam('sorted', `${sortedBy.header}_down`);
    }

    return phonesToSort;
  }

  showSelectedHandler() {
    let {
      selectedPhones: selectedFromState,
      phones,
      itemsPerPage
    } = this.state;
    let selectedPhones =
      selectedFromState.length > 0 ? selectedFromState : phones;
    let uncheckedPhones = phones.map(phone => {
      return {...phone, checked: false};
    });

    selectedPhones = selectedPhones.filter(phone => phone.checked).map(phone => {
      return {...phone, checked: false};
    });

    if (selectedPhones.length === 0) {
      return;
    }

    this.setURLSearchParam('page', 1);
    this.setState({
      selectedPhones,
      phones: uncheckedPhones,
      showFrom: 0,
      showTo: +itemsPerPage,
      activePage: 1,
      allCheckedPages: []
    });
  }

  showAllHandler() {
    this.setURLSearchParam('page', 1);
    this.setState({
      selectedPhones: [],
      activePage: 1,
      showFrom: 0,
      showTo: +this.state.itemsPerPage,
      allCheckedPages: []
    });
  }

  getUncheckedPhones(phones) {
    return phones.map(phone => {
      return {...phone, checked: false};
    });
  }

  searchHandler(value) {
    let uncheckedPhones = this.getUncheckedPhones(this.state.phones);
    let shouldParamBeDeleted = value === '';
    this.setURLSearchParam('query', value, shouldParamBeDeleted);
    this.setState({
      query: value,
      phones: uncheckedPhones,
      allCheckedPages: [],
      showFrom: 0,
      showTo: this.state.itemsPerPage,
      activePage: 1
    });
  }

  setFilteredPhones(phones) {
    let reg = new RegExp(this.state.query, 'i');
    let searchableHaders = Object.entries(this.props.config).filter(([, settings]) => settings.isSearchable).map(([header]) => header);
    let filteredPhones = [...phones].filter(phone =>
      searchableHaders.some(header => reg.test(phone[header]))
    );

    return filteredPhones;
  }

  itemsPerPageHandler(value) {
    let uncheckedPhones = this.getUncheckedPhones(this.state.phones);

    this.setURLSearchParam('perpage', value);
    this.setState({
      itemsPerPage: value,
      showFrom: 0,
      showTo: +value,
      activePage: 1,
      phones: uncheckedPhones,
      allCheckedPages: []
    });
  }

  paginationClickHandler(showFrom, showTo, activePage) {
    this.setURLSearchParam('page', activePage);
    this.setState({showFrom, showTo, activePage});
  }

  editCellHandler(event) {
    let element = event.target;
    let container = element.offsetParent;
    let offsetTop = container.offsetTop + element.offsetTop;
    let offsetLeft = container.offsetLeft + element.offsetLeft;
    let phoneId = event.target.dataset.phoneId;
    let header = event.target.dataset.header;
    let cellValue = event.target.textContent;

    this.setState({
      editInputStyle: {
        display: 'block',
        top: offsetTop,
        left: offsetLeft,
        width: element.clientWidth - 4,
        height: element.clientHeight - 4
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
    this.setState({editInputQuery: editQuery});
  }

  submitEditHandler(event) {
    if (event.key !== 'Enter') {
      return;
    }

    let {phoneId: rowByPhoneId, header} = this.state.editCellLocation;
    let {editInputQuery, phones} = this.state;
    let updatedPhones = [...phones];

    updatedPhones = updatedPhones.map(phone => {
      if (phone.id === rowByPhoneId) {
        phone[header] = editInputQuery;
      }
      return phone;
    });

    this.setState({
      phones: updatedPhones,
      editInputStyle: {
        top: 0,
        left: 0,
        width: '120px',
        height: '50px',
        display: 'none'
      },
      editInputQuery: '',
      editCellLocation: {
        phoneId: '',
        header: ''
      }
    });
  }

  setURLSearchParam(param, value, shouldBeDeleted = false) {
    let paramsString = window.location.search;
    let searchParams = new URLSearchParams(paramsString);
    searchParams.set(param, value);
    shouldBeDeleted && searchParams.delete(param);
    window.history.pushState(null, null, `?${searchParams.toString()}`);
  }

  render() {
    let {
      selectedPhones,
      itemsPerPage,
      phones,
      query,
      showFrom,
      showTo,
      activePage
    } = this.state;
    let {config} = this.props;

    if (selectedPhones.length > 0) {
      phones = selectedPhones;
    }
    phones = this.sortBy(phones);
    phones = this.setFilteredPhones(phones);

    let currentPagePhones = phones.slice(showFrom || 0, showTo || 20);

    return (
      <div className="TableComponent-container">
        <textarea
          type="text"
          style={{
            display: this.state.editInputStyle.display,
            position: 'absolute',
            resize: 'none',
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
            value={itemsPerPage}
            onChange={event => this.itemsPerPageHandler(event.target.value)}
            className="TableComponent-items-per-page"
          >
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
          <Pagination
            phones={phones}
            itemsPerPage={itemsPerPage}
            clickHandler={this.paginationClickHandler}
            activePage={activePage}
          />
        </div>
        <div className="TableComponent-filter-container">
          <button
            type="button"
            onClick={() => this.showSelectedHandler()}
            className="TableComponent-filter-selected-btn"
          >
            Show selected
          </button>
          <button type="button" onClick={() => this.showAllHandler()}>
            Show All
          </button>
          <input
            onChange={event => this.searchHandler(event.target.value)}
            placeholder=" Type to search ..."
            type="text"
            value={query}
          />
        </div>
        <table className="TableComponent-table">
          <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={this.isAllSelected(currentPagePhones)}
                onChange={() =>
                  this.selectAllHandler(phones, selectedPhones, activePage)
                }
              />
            </th>
            {Object.entries(config).map(([header, props]) => {
              let {color, arrow} = this.getSortArrow(header);

              return (
                <th
                  className={
                    props.isSortable
                      ? 'TableComponent-table-sortable-header'
                      : null
                  }
                  key={header}
                  onClick={
                    props.isSortable
                      ? () => this.sortStateHandler(header)
                      : null
                  }
                >
                  {props.title}
                  {props.isSortable && (
                    <span style={{color}}> {arrow}</span>
                  )}
                </th>
              );
            })}
          </tr>
          </thead>
          <tbody>
          {currentPagePhones.map(phone => (
            <tr key={phone.id}>
              <td>
                <input
                  type="checkbox"
                  checked={phone.checked}
                  onChange={() =>
                    this.selectPhoneHandler(phone.id, activePage)
                  }
                />
              </td>
              {Object.keys(config).map(header => (
                <td
                  key={header}
                  data-phone-id={phone.id}
                  data-header={header}
                  onDoubleClick={event => this.editCellHandler(event)}
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
            phones={phones}
            itemsPerPage={itemsPerPage}
            clickHandler={this.paginationClickHandler}
            activePage={activePage}
          />
        </div>
      </div>
    );
  }
}

export default TableComponent;
