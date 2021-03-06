from flask import jsonify, request

import flask_praetorian
from flask_praetorian.exceptions import MissingToken
from backend import db, guard
from backend.auth import auth_bp
from backend.errors import InvalidRequest, ResourceExists
from backend.model.schema import Collection, Reader, reader_schema


@auth_bp.route("/login", methods=["POST"])
def login():
    reader_data = request.json
    username = reader_data.get("username")
    password = reader_data.get("password")

    if not (username and password):
        raise InvalidRequest(
            "Request should be of the form {{username: 'username', password: 'password'}}",
        )

    reader = guard.authenticate(username, password)
    return (
        jsonify(
            {"access_token": guard.encode_jwt_token(reader), "roles": reader.roles}
        ),
        200,
    )


@auth_bp.route("/signup", methods=["POST"])
def signup():
    reader_data = request.json
    username = reader_data.get("username")
    password = reader_data.get("password")
    email = reader_data.get("email")

    # Ensure request is valid format
    if not (username and email and password):
        raise InvalidRequest(
            "Request should be of the form {{username: 'username', password: 'password', email: 'email'}}"
        )

    # Check if a user with this email/username already exists
    if Reader.query.filter(
        (Reader.email == email) | (Reader.username == username)
    ).first():
        raise ResourceExists("The username or email already exists")

    new_reader = Reader(
        username=username,
        email=email,
        password=guard.hash_password(password),
        roles="user",
    )

    # Add the new user's Main collection
    main_collection = Collection(name="Main")
    new_reader.collections.append(main_collection)

    db.session.add(new_reader)
    db.session.commit()

    return reader_schema.dump(new_reader)


@auth_bp.route("/verify")
@flask_praetorian.auth_required
def verify():
    user = flask_praetorian.current_user()
    return jsonify(reader_schema.dump(user))


@auth_bp.route("/refresh", methods=["GET"])
def refresh():
    # Look for token in both header and cookie
    try:
        old_token = guard.read_token_from_cookie()
    except MissingToken:
        try:
            old_token = guard.read_token_from_header()
        except MissingToken:
            raise MissingToken(
                "No jwt token found in headers under 'Authorization', or in a cookie under 'accessToken"
            )

    new_token = guard.refresh_jwt_token(old_token)
    return jsonify({"access_token": new_token}), 200
