const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const connection = require("../connection");
const getId = require("../getId");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  const PATH = "/api/issues/";

  /* My tests */
  suite("POST /api/issues/ Tests", () => {
    test("1)  All Fields Test", () => {
      // Represents the data that will be sent during this test
      const data = {
        issue_title: "Test 1",
        issue_text: "Testing all fields",
        created_by: "Lucas Chapman",
      };

      chai
        .request(server)
        .post(PATH + "test")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            const json = JSON.parse(res.text);

            assert.isObject(json, "The returned data should be an object");
            assert.nestedInclude(
              json,
              data,
              `'${res.text}' should match '${JSON.stringify(data)}'`
            );
          }
        });
    });

    test("2)  Required Fields Only Test", () => {
      // Represents the data that will be sent during this test
      const data = {
        issue_title: "Test 2",
        issue_text: "Testing only required fields fields",
        created_by: "Lucas Chapman",
      };

      chai
        .request(server)
        .post(PATH + "testing")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            const json = JSON.parse(res.text);

            assert.isObject(json, "The returned data should be an object");

            assert.nestedInclude(
              json,
              data,
              `'${res.text}' should match '${JSON.stringify(data)}'`
            );

            assert.property(
              json,
              "created_on",
              "Missing 'created_on' property"
            );
            assert.isNumber(
              Date.parse(json.created_on),
              "'created_on' property should be a number"
            );
            assert.property(
              json,
              "updated_on",
              "Missing 'updated_on' property"
            );
            assert.isNumber(
              Date.parse(json.updated_on),
              "'updated_on' property should be a number"
            );
            assert.property(json, "open", "Missing 'open' property");
            assert.isBoolean(
              json.open,
              "'open' property should be a boolean value"
            );
            assert.isTrue(json.open, "'open' property should be 'true'");
            assert.property(json, "_id", "'_id' property is missing");
            assert.isNotEmpty(json._id, "'_id' should not be empty");
            assert.property(
              json,
              "status_text",
              "'status_text' property is missing"
            );
            assert.isEmpty(json.status_text, "'status_text' should be empty");
          }
        });
    });

    test("3)  Missing Data Test", () => {
      // Represents the data that will be sent during this test
      const data = {
        assigned_to: "Lucas Chapman",
        status_text: "Test 3",
        open: true,
      };

      chai
        .request(server)
        .post(PATH + "fail")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            const json = JSON.parse(res.text);

            assert.isObject(json);
            assert.property(json, "error");
            assert.equal(
              json.error,
              "required field(s) missing",
              `${json.error} does not equal 'required field(s) missing'`
            );
          }
        });
    });
  });

  suite("GET /api/issues/ Tests", () => {
    test("1)  View Issues Test", () => {
      chai
        .request(server)
        .get(PATH + "test")
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            assert.notEqual(JSON.parse(res.text), [], "Returned nothing!");
          }
        });
    });

    test("2)  One Filter Test", () => {
      chai
        .request(server)
        .get(PATH + "test?issue_title=Test 1")
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            assert.notEqual(JSON.parse(res.text), [], "Returned nothing!");
          }
        });
    });

    test("3)  Multiple Filters Test", () => {
      chai
        .request(server)
        .get(PATH + "test?issue_title=Test 1&open=false")
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            assert.notEqual(JSON.parse(res.text), [], "Returned nothing!");
          }
        });
    });
  });

  suite("PUT /api/issues/ Tests", () => {
    test("1)  One Field Test", () => {
      connection(async (client) => {
        const ID = await getId(client, "Test 1");
        const data = {
          _id: ID,
          issue_text: "Testing updates on one field",
        };

        chai
          .request(server)
          .put(PATH + "testing")
          .send(data)
          .end((err, res) => {
            if (err) {
              console.log(err);
            } else {
              assert.deepPropertyVal(
                JSON.parse(res.text),
                "result",
                "successfully updated",
                `'${res.text}' should have a property of 'result' that is equal to 'successfully updated'`
              );
            }
          });
      });
    });

    test("2)  Multiple Fields Test", () => {
      connection(async (client) => {
        const ID = await getId(client, "Test 2");
        const data = {
          _id: ID,
          issue_text: "Testing updates on multiple fields",
          assigned_to: "John Smith",
          status_text: "Open",
        };

        chai
          .request(server)
          .put(PATH + "testing")
          .send(data)
          .end((err, res) => {
            if (err) {
              console.log(err);
            } else {
              assert.deepPropertyVal(
                JSON.parse(res.text),
                "result",
                "successfully updated",
                `'${res.text}' should have a property of 'error' that is equal to 'missing _id'`
              );
            }
          });
      });
    });

    test("3)  No Fields Test", () => {
      connection(async (client) => {
        const ID = await getId(client, "Test 2");
        const data = {
          _id: ID,
        };

        chai
          .request(server)
          .put(PATH + "testing")
          .send(data)
          .end((err, res) => {
            if (err) {
              console.log(err);
            } else {
              assert.deepPropertyVal(
                JSON.parse(res.text),
                "error",
                "no update field(s) sent",
                `'${res.text}' should have a property of 'error' that is equal to 'no update field(s) sent'`
              );
            }
          });
      });
    });

    test("4)  No _id Test", () => {
      const data = {
        issue_text: "Testing updates without an _id",
        assigned_to: "John Smith",
        status_text: "Closed",
        open: false,
      };

      chai
        .request(server)
        .put(PATH + "testing")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            assert.deepPropertyVal(
              JSON.parse(res.text),
              "error",
              "missing _id",
              `'${res.text}' should have a property of 'error' that is equal to 'missing _id'`
            );
          }
        });
    });

    test("5)  Invalid _id Test", () => {
      const data = {
        _id: "7597e280d35ae174eeddf13c",
        issue_text: "Testing updates without an invalid _id",
        assigned_to: "John Smith",
        status_text: "Closed",
        open: false,
      };

      chai
        .request(server)
        .put(PATH + "test")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            assert.deepPropertyVal(
              JSON.parse(res.text),
              "error",
              "could not update",
              `'${res.text}' should have a property of 'error' that is equal to 'could not update'`
            );
          }
        });
    });
  });

  suite("DELETE /api/issues/ Tests", () => {
    test("1)  Delete Issue Test", () => {
      connection(async (client) => {
        const ID = await getId(client, "Test 1");
        const data = { _id: ID };

        chai
          .request(server)
          .delete(PATH + "test")
          .send(data)
          .end((err, res) => {
            if (err) {
              console.log(err);
            } else {
              assert.deepPropertyVal(
                JSON.parse(res.text),
                "result",
                "successfully deleted",
                `'${res.text}' should have a property of 'result' that is equal to 'successfully deleted'`
              );
            }
          });
      });
    });

    test("2)  Invalid _id Test", () => {
      const data = { _id: "7597e280d35ae174eeddf13c" };

      chai
        .request(server)
        .delete(PATH + "testing")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            assert.deepPropertyVal(
              JSON.parse(res.text),
              "error",
              "could not delete",
              `'${res.text}' should have a property of 'error' that is equal to 'could not delete'`
            );
          }
        });
    });

    test("3)  Missing _id Test", () => {
      const data = {};

      chai
        .request(server)
        .delete(PATH + "testing")
        .send(data)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            assert.deepPropertyVal(
              JSON.parse(res.text),
              "error",
              "missing _id",
              `'${res.text}' should have a property of 'error' that is equal to 'missing _id'`
            );
          }
        });
    });
  });
});
