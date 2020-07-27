import React, { Component } from "react";
import { Form, Button, Accordion, Card } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";

import { addReview } from "../fetchFunctions";

class AddReview extends Component {
    constructor(props) {
        super(props);

        this.state = {
            readerId: "",
            bookId: "",

            review: "",
            score: "",
        };
    }

    componentDidMount() {
        this.setState({
            readerId: this.props.readerID,
            bookId: this.props.bookID,
        });
    }

    updateReview = (event) => {
        this.setState({ review: event.target.value });
    };

    updateScore = (event) => {
        this.setState({ score: event.target.value });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        if (!this.state.score) {
            toast.error("Please fill in the required fields");
            return;
        }

        addReview(
            this.state.readerId,
            this.state.bookId,
            this.state.score,
            this.state.review
        )
            .then((res) => {
                if (!res.ok) {
                    return res.text().then((text) => {
                        throw Error(text);
                    });
                }

                return res.json();
            })
            .then(() => {
                this.props.notify("Review successfully published!");
                window.location.reload();
                return this.props.history.push(
                    "/book/" + this.state.bookId + "/reviews"
                );
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
                }
            });
    };

    render() {
        return (
            <div className="AddReview">
                <ToastContainer autoClose={4000} pauseOnHover closeOnClick />

                <Accordion>
                    <Card>
                        <Accordion.Toggle
                            as={Card.Header}
                            variant="link"
                            eventKey="0"
                        >
                            <a href="#">
                                <h5>Leave a review</h5>
                            </a>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <Form
                                    method="POST"
                                    onSubmit={this.handleSubmit}
                                >
                                    <Form.Group>
                                        <Form.Control
                                            type="number"
                                            name="score"
                                            placeholder="1 - 5"
                                            value={this.state.score}
                                            onChange={this.updateScore}
                                            min="1"
                                            max="5"
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="exampleForm.ControlTextarea1">
                                        <Form.Control
                                            as="textarea"
                                            rows="3"
                                            placeholder="What did you think of this book..."
                                            value={this.state.review}
                                            onChange={this.updateReview}
                                            name="review"
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        Submit
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </div>
        );
    }
}

export default AddReview;
