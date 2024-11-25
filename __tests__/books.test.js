/** Integration Tests for books  */

process.env.NODE_ENV = "test"
const request = require("supertest")
const app = require("../app")
const db = require("../db")
const Book = require("../models/book")

beforeAll(async () => {
  await db.query(`
    INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES (
      '1234567890',
      'http://example.com',
      'John Doe',
      'English',
      200,
      'Tech Inc',
      'Learn JSONSchema',
      2024
    );
  `)
})

afterAll(async () => {
  await db.query(`DELETE FROM books`)
  await db.end()
})

describe("GET /books", () => {
  test("Gets a list of books", async () => {
    const res = await request(app).get("/books")
    expect(res.statusCode).toBe(200)
    expect(res.body.books.length).toBe(1)
    expect(res.body.books[0]).toHaveProperty("isbn")
  })
})

describe("GET /books/:isbn", () => {
  test("Gets a single book by isbn", async () => {
    const res = await request(app).get("/books/1234567890")
    expect(res.statusCode).toBe(200)
    expect(res.body,book).toHaveProperty("isbn")
    expect(res.body.book.isbn).toBe("1234567890")
  })

  test("Returns 404 if the book is not found", async () => {
    const res = await request(app).get("/books/0000000000")
    expect(res.statusCode).toBe(404)
  })
})

describe("POST /books", () => {
  test("Creates a new book", async () => {
    const res = await request(app)
      .post("/books")
      .send({
        isbn: "0987654321",
        amazon_url: "http://example.org",
        author: "Jane Smith",
        language: "Spanish",
        pages: 150,
        publisher: "Good Press",
        title: "TDD - Test Driven Development",
        year: 2021,
      })
      expect(res.statusCode).toBe(201)
      expect(res.body.book).toHaveProperty("isbn")
  })

  test("Fails to creat a book with invalid input", async () => {
    const res = await request(app)
      .post("/books")
      .send({
        isbn: "",
        amazon_url: "no-url",
        author: "",
      })
      expect(res.statusCode).toBe(400)
      expect(res.body.error.length).toBeGreaterThan(0)
  })
})

describe("PUT /books/:isbn", () => {
  test("Updates an existing book", async () => {
    const res = await request(app)
      .put("/books/1234567890")
      .send({
        amazon_url: "http://updated-example.com",
        author: "Updated Author",
        language: "Updated Language",
        pages: 300,
        publisher: "Updated Publisher",
        title: "Updated Title",
        year: 2024
      })
      expect(res.statusCode).toBe(200)
      expect(res.body.book.author).toBe("updated Author")
  })

  test("Fails to update a book with invalid data", async () => {
    const res = await request(app)
      .put("/books/1234567890")
      .send({
        amazon_url: "invalid-url",
        author: "",
      })
      expect(res.statusCode).toBe(400)
      expect(res.body.errors.length).toBeGreaterThan(0)
  })

  test("Returns 404 if the book to update is not found", async () => {
    const res = await request(app)
      .put("/books/0000000000")
      .send({
        amazon_url: "http://valid-url.com",
        author: "non-existent",
        langugage: "",
        pages: 200,
        publisher: "non-existent publisher",
        title: "non-existent",
        year: 2021,
      })
      expect(res.statusCode).toBe(404)
  })
})

describe("DELETE /books/:isbn", () => {
  test("Deletes a book", async () => {
    const res = await request(app).delete("/books/1234567890")
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe("Book deleted")
  })

  test("Returns 404 if the book to delete is not found", async() => {
    const res = await request(app).delete("/books/0000000000")
    expect(res.statusCode).toBe(404)
  })
})

