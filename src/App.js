import AutoComplete from "./AutoComplete";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/user/:id">
            {(props) => {
              let data = props.history.location.state;
              return (
                <div className="option-card" style={{ textAlign: "left" }}>
                  <p>
                    <b>ID: {data.id}</b>
                  </p>
                  <p style={{ paddingBottom: 8 }}>
                    Name:<i> {data.name}</i>
                  </p>
                  <p>Address: {`${data.address}. ${data.pincode}`}</p>
                  <p></p>
                  {/* <p>{data.items}</p> */}
                </div>
              );
            }}
          </Route>
          <Route path="/">
            {(props) => (
              <AutoComplete
                onSelect={(data) => {
                  console.log(data);
                  props.history.push(`/user/${data.id}`, data);
                }}
              />
            )}
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
