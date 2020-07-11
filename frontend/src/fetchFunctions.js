const apiUrl = "http://localhost:5000";

export function getUserById(userId) {
    return fetch(`${apiUrl}/user/id/${userId}`);
}

export function verifyUser() {
    return fetch(`${apiUrl}/verify`, {
        credentials: "include",
    });
}

export function getBook(bookISBN) {
    return fetch(`${apiUrl}/book/${bookISBN}`);
}

export function addToCollection(isbn, id) {
    console.log("ISBN and Col id are: " + isbn + " and " + id);
    fetch("http://localhost:5000/modify_collection", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            book_id: isbn,
            collection_id: id,
        }),
        credentials: "include",
    })
        .then((res) => {
            return res.json();
        })
        .then((json) => {
            console.log(json);
            return json;
        });
}

export function unfollowUser(followerUsername, userUsername) {
    return fetch("http://localhost:5000/follow", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user: userUsername,
            follower: followerUsername,
        }),
        credentials: "include",
    })
        .then((res) => {
            if (!res.ok) {
                return res.text().then((text) => {
                    throw Error(text);
                });
            }

            return res.json();
        })
        .catch((error) => {
            console.log(error.message);
        });
}

export function followUser(followerUsername, userUsername) {
    return fetch("http://localhost:5000/follow", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user: userUsername,
            follower: followerUsername,
        }),
        credentials: "include",
    })
        .then((res) => {
            if (!res.ok) {
                return res.text().then((text) => {
                    throw Error(text);
                });
            }

            return res.json();
        })
        .catch((error) => {
            console.log(error.message);
        });
}
