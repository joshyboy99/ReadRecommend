from sqlalchemy import Column, Integer, String, DateTime

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Book(Base):
    __tablename__ = "books"

    isbn = Column(String, primary_key=True)
    title = Column(String)

    publisher = Column(String)
    publicationdate = Column(Integer)

    language = Column(String)
    cover = Column(String)
    summary = Column(String)

    # TODO: Category
    # TODO: Reviews

    def __init__(
        self, isbn, title, publisher, publicationDate, language, cover, summary
    ):
        self.isbn = isbn
        self.title = title
        self.publisher = publisher
        self.publicationdate = publicationDate
        self.language = language
        self.cover = cover
        self.summary = summary

    def __repr__(self):
        return "<Book(title='%s', author='%s', publisher='%s')>" % (
            self.title,
            self.author,
            self.publisher,
        )

    def setISBN(self, isbn):
        self.isbn = isbn

    def setTitle(self, title):
        self.title = title

    def setAuthor(self, author):
        self.author = author