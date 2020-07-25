import React, { Component } from "react";
import { Image } from "react-bootstrap";

class BlindCover extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const book = this.props.book;
        return (
            <div
                style={{
                    position: "relative",
                    width: "330px",
                }}
            >
                <Image
                    className="mr-3"
                    src="https://i.pinimg.com/736x/c0/28/54/c02854a59bb95f10e076485898a1841a.jpg"
                    alt={book.title}
                    thumbnail
                    width="314px"
                />
                <div
                    style={{
                        position: "absolute",
                        top: "30%",
                        left: 0,
                        right: 0,
                        textAlign: "left",
                        fontFamily: "Abril Fatface",
                        fontSize: 26,
                        color: "#001942",
                    }}
                >
                    {book.genres
                        .sort()
                        .slice(0, 3)
                        .map((genre) => (
                            <div
                                key={genre}
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                {genre}
                                <br></br>
                            </div>
                        ))}
                </div>
            </div>
        );
    }
}

export default BlindCover;
