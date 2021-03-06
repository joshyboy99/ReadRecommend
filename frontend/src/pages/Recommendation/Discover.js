import React, { Component } from "react";
import { Form, Container, Spinner, InputGroup } from "react-bootstrap";
import BookList from "../../components/Books/BookList.js";
import {
    getRecommendations,
    getCollectionOverview,
} from "../../fetchFunctions";
import { toast } from "react-toastify";
import { BsArrowRepeat } from "react-icons/bs";

class Discover extends Component {
    constructor(props) {
        super(props);

        this.state = {
            recommendationMode: "Top Rated",
            currentRecommendations: [],
            loading: true,
        };
    }

    componentDidMount() {
        this.handleSubmit();
    }

    updateMode = (event) => {
        // When calling handleSubmit asynchronously the event will
        // be nullified otherwise
        event.persist();
        this.setState({ recommendationMode: event.target.value }, () => {
            this.handleSubmit(event); // Call asynchronously
        });
    };

    getRecentlyReadRecommendations = (books, user) => {
        let bookIDs = [];
        books.forEach((book) => {
            bookIDs.push(book.id);
        });
        return getRecommendations("content", user.id, null, 20, bookIDs).then(
            (res) => {
                return res.json();
            }
        );
    };

    handleSubmit = (event) => {
        const user = this.props.initialUserInfo;
        this.setState({ loading: true });
        switch (this.state.recommendationMode) {
            case "Top Rated":
                getRecommendations("top_rated", user ? user.id : null, null, 20)
                    .then((res) => {
                        if (!res.ok) {
                            return res.text().then((text) => {
                                throw Error(text);
                            });
                        }
                        return res.json();
                    })
                    .then((recommendations) => {
                        recommendations = recommendations.flat();
                        this.setState({
                            currentRecommendations: recommendations,
                            loading: false,
                        });
                    })
                    .catch((error) => {
                        // An error occurred
                        let errorMessage = "Something went wrong...";
                        try {
                            errorMessage = JSON.parse(error.message).message;
                        } catch {
                            errorMessage = error.message;
                        } finally {
                            toast.error(errorMessage);
                            this.setState({ loading: false });
                        }
                    });
                break;
            case "People You Follow":
                getRecommendations("following", user ? user.id : null, null, 20)
                    .then((res) => {
                        if (!res.ok) {
                            return res.text().then((text) => {
                                throw Error(text);
                            });
                        }
                        return res.json();
                    })
                    .then((recommendations) => {
                        recommendations = recommendations.flat();
                        this.setState({
                            currentRecommendations: recommendations,
                            loading: false,
                        });
                    })
                    .catch((error) => {
                        // An error occurred
                        let errorMessage = "Something went wrong...";
                        try {
                            errorMessage = JSON.parse(error.message).message;
                        } catch {
                            errorMessage = error.message;
                        } finally {
                            toast.error(errorMessage);
                            this.setState({ loading: false });
                        }
                    });
                break;
            case "Suggested For You":
                getCollectionOverview(user.username, "recently_read")
                    .then((res) => {
                        if (!res.ok) {
                            return res.text().then((text) => {
                                throw Error(text);
                            });
                        }

                        return res.json();
                    })
                    .then((json) => {
                        return this.getRecentlyReadRecommendations(
                            json.books,
                            user
                        );
                    })
                    .then((recommendations) => {
                        recommendations = recommendations.flat();
                        this.setState({
                            currentRecommendations: recommendations,
                            loading: false,
                        });
                    })
                    .catch((error) => {
                        // An error occurred
                        let errorMessage = "Something went wrong...";
                        try {
                            errorMessage = JSON.parse(error.message).message;
                        } catch {
                            errorMessage = error.message;
                        } finally {
                            toast.error(errorMessage);
                            this.setState({ loading: false });
                        }
                    });
                break;
            default:
                return null;
        }
    };

    render() {
        return (
            <div className="Search">
                <Container>
                    <h1> Discover </h1>
                    <br></br>
                    <Form method="POST" onSubmit={this.handleSubmit}>
                        <InputGroup>
                            <Form.Control
                                as="select"
                                defaultValue={"Top Rated"}
                                onChange={this.updateMode}
                            >
                                <option>Top Rated</option>
                                {this.props.initialUserInfo && (
                                    <>
                                        <option>People You Follow</option>
                                        <option>Suggested For You</option>
                                    </>
                                )}
                            </Form.Control>
                            <InputGroup.Append>
                                <InputGroup.Text
                                    style={{
                                        cursor: "pointer",
                                    }}
                                    onClick={this.handleSubmit}
                                >
                                    <BsArrowRepeat />
                                </InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form>
                    <br></br>
                    {this.state.loading ? (
                        <Spinner
                            animation="border"
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                            }}
                        />
                    ) : (
                        <BookList
                            books={this.state.currentRecommendations}
                        ></BookList>
                    )}
                </Container>
            </div>
        );
    }
}

export default Discover;
