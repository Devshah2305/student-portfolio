const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  validateTask,
  validateAuthInput,
} = require("../middleware/validate");

function runMiddleware(middleware, body) {
  let statusCode;
  let responseBody;
  let nextCalled = false;

  const req = { body };

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseBody = data;
      return this;
    },
  };

  middleware(req, res, () => {
    nextCalled = true;
  });

  return { statusCode, responseBody, nextCalled };
}

test("accepts a valid task title", () => {
  const result = runMiddleware(validateTask, {
    title: "Complete Docker practical",
  });

  assert.equal(result.nextCalled, false);
  assert.equal(result.statusCode, undefined);
});

test("rejects a missing task title", () => {
  const result = runMiddleware(validateTask, {});

  assert.equal(result.statusCode, 400);
  assert.equal(result.nextCalled, false);
});

test("rejects a title containing only spaces", () => {
  const result = runMiddleware(validateTask, { title: "   " });

  assert.equal(result.statusCode, 400);
});

test("rejects a title longer than 100 characters", () => {
  const result = runMiddleware(validateTask, {
    title: "A".repeat(101),
  });

  assert.equal(result.statusCode, 400);
});

test("accepts a title of exactly 100 characters", () => {
  const result = runMiddleware(validateTask, {
    title: "A".repeat(100),
  });

  assert.equal(result.nextCalled, true);
});

test("accepts valid authentication input", () => {
  const result = runMiddleware(validateAuthInput, {
    username: "devshah",
    password: "secret123",
  });

  assert.equal(result.nextCalled, true);
});

test("rejects an invalid username and short password", () => {
  const result = runMiddleware(validateAuthInput, {
    username: "ab",
    password: "123",
  });

  assert.equal(result.statusCode, 400);
  assert.equal(result.nextCalled, false);
  assert.ok(result.responseBody.errors.username);
  assert.ok(result.responseBody.errors.password);
});
