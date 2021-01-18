import classNames from "classnames";
import _ from "lodash";
import PropTypes from "prop-types";
import React, { Fragment } from "react";
import "./AutoComplete.scss";
import axios from "axios";
import cloneDeep from "lodash.clonedeep";

class AutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      q: "",
      currentPosition: -1,
      tempQ: "",
      data: [],
    };
  }

  componentDidMount() {
    if (this.props.autoFocus) {
      this.inputNode && this.inputNode.focus();
    }
  }

  handleNavigation = (e) => {
    let { currentPosition } = this.state;
    if (this.scrollableDiv) {
      let children = this.scrollableDiv.querySelectorAll(".options-item");
      let childCount = children.length;
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (childCount > 0 && currentPosition > 0) {
            let el = children[currentPosition - 1];
            this.scrollableDiv.scrollTo(0, el.offsetTop - el.offsetHeight - 5);
            this.setState({ currentPosition: currentPosition - 1 });
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (childCount > 0 && currentPosition < childCount - 1) {
            let el = children[currentPosition + 1];
            this.scrollableDiv.scrollTo(0, el.offsetTop - el.offsetHeight - 5);
            this.setState({ currentPosition: currentPosition + 1 });
          }
          break;
        case "Enter":
          e.preventDefault();
          if (childCount) children[currentPosition].click();
          break;
        default:
          break;
      }
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      if (this.state.q) {
        this.setState({ isFetchingData: true });
        axios
          .get(`${process.env.REACT_APP_API_URL}${this.state.q}`)
          .then((res) => {
            const orginalData = cloneDeep(res.data);
            res.data.forEach((rec) => {
              rec.highlights.forEach((item) => {
                rec[item.path] = item.texts.map((item, i) => {
                  if (item.type === "hit") {
                    return (
                      <span
                        key={`hit-${item.value}-${i}`}
                        style={{ color: "blue" }}
                      >
                        {item.value}
                      </span>
                    );
                  }
                  return item.value;
                });
              });
            });

            this.setState({
              data: res.data,
              orginalData,
              isFetchingData: false,
            });
          });
      } else {
        this.setState({ data: [] });
      }
    });
  };

  handleMouseEnter(currentPosition) {
    this.setState({ currentPosition });
  }

  handleMouseLeave(currentPosition) {
    this.setState({ currentPosition });
  }

  onSelect(e, data) {
    this.props.onSelect(e, data);
  }

  handleBlur = () => {
    let { q, tempQ } = this.state;
    if (!q && tempQ) {
      this.setState({ q: tempQ, tempQ: "" });
    }
  };

  render() {
    let { searchInputClassname } = this.props;
    let { q, currentPosition, data, isFetchingData, orginalData } = this.state;
    return (
      <div
        className={classNames("cm-autocomplete-container")}
        onKeyDownCapture={this.handleNavigation}
      >
        <input
          ref={(node) => (this.inputNode = node)}
          type="text"
          className={classNames("search-input", searchInputClassname)}
          value={q}
          name="q"
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          autoComplete="off"
          placeholder={"Search users by ID, address, name..."}
        />
        {q && (
          <Fragment>
            {data.length !== 0 ? (
              <div
                className="autocomplete-options"
                ref={(node) => (this.scrollableDiv = node)}
              >
                {data.map((data, index) => {
                  return (
                    <div
                      key={_.uniqueId("autocomplete")}
                      onClick={(e) => this.onSelect(orginalData[index])}
                      className={classNames("options-item", {
                        hover: currentPosition === index,
                      })}
                      onMouseEnter={this.handleMouseEnter.bind(this, index)}
                      onMouseLeave={this.handleMouseLeave.bind(this, index)}
                    >
                      <div className="option-card">
                        <p>
                          <b>{data.id}</b>
                        </p>
                        <p style={{ paddingBottom: 8 }}>
                          <i>{data.name}</i>
                        </p>
                        <p>
                          {data.address} {` ${data.pincode}`}
                        </p>
                        <p></p>
                        {/* <p>{data.items}</p> */}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              q &&
              !isFetchingData && (
                <div className="autocomplete-options">
                  <p style={{ padding: "24px 0px" }}>No results found</p>
                </div>
              )
            )}
          </Fragment>
        )}
      </div>
    );
  }
}

AutoComplete.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default AutoComplete;
