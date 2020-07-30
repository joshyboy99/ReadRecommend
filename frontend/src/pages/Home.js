import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";

class Home extends Component {
    render() {
        if (!this.props.initialUserInfo) {
            return <Redirect to="/discover" />;
        } else if (this.props.initialUserInfo.roles.includes("admin")) {
            return <Redirect to="/admin/bookList" />;
        } else if (this.props.initialUserInfo.roles.includes("user")) {
            return <Redirect to="/home" />;
        }
    }
}

Home.propTypes = {
    initialUserInfo: PropTypes.object.isRequired,
};

export default Home;
