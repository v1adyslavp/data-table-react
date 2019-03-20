import React from "react";
import ReactDOM from "react-dom";
import TableComponent from "./TableComponent";

import "./App.css";
class App extends React.Component {
  state = {
    phones: [],
    columnConfig: {
      name: {
        title: "Название", // так будет называться колонка в таблице
        isSortable: true,
        isSearchable: true // Поиск будет проверять эту и последнюю колонки
      },
      age: {
        title: "Возраст",
        isSortable: true // по этой колонке можно сортировать
      },
      snippet: {
        // Только для тех ключей которые есть в columnConfig будут колонки в таблице
        title: "Описание",
        isSearchable: true // В этой колонке тоже будет происходить поиск query
      }
    }
  };

  async componentDidMount() {
    let response = await fetch(
      "https://raw.githubusercontent.com/vladikcoder/phones-app/master/phones/phones.json"
    );
    let phones = await response.json();

    this.setState({ phones });
  }

  render() {
    return (
      <div className="App">
        <h1>Data table</h1>
        {this.state.phones.length > 0 ? (
          <TableComponent
            phones={this.state.phones}
            config={this.state.columnConfig}
          />
        ) : (
          "loading..."
        )}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
